package com.monbo.bpm.module.task.service.impl;

import com.monbo.bpm.common.BusinessException;
import com.monbo.bpm.module.task.dto.TaskRespDTO;
import com.monbo.bpm.module.task.service.ITaskService;
import com.monbo.bpm.module.user.entity.User;
import com.monbo.bpm.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.task.Task;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements ITaskService {

    private final ProcessEngine processEngine;
    private final UserMapper userMapper;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        var user = userMapper.findByUsername(auth.getName());
        return user != null ? user.getId() : null;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return auth.getName();
    }

    @Override
    public List<TaskRespDTO> listMyTasks(Long userId) {
        Long currentUserId = userId != null ? userId : getCurrentUserId();
        if (currentUserId == null) {
            throw BusinessException.bad("用户未登录");
        }
        User user = userMapper.selectById(currentUserId);
        if (user == null) {
            throw BusinessException.bad("用户不存在");
        }

        // 查询已签收给我的任务
        List<Task> tasks = processEngine.getTaskService()
                .createTaskQuery()
                .taskAssignee(user.getUsername())
                .list();

        // 查询候选给我的任务（包含候选组）
        List<Task> candidateTasks = processEngine.getTaskService()
                .createTaskQuery()
                .taskCandidateUser(user.getUsername())
                .list();

        // 合并去重
        tasks.addAll(candidateTasks);

        return tasks.stream()
                .distinct()
                .map(this::toRespDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaskRespDTO getTaskById(String taskId) {
        Task task = processEngine.getTaskService().createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw BusinessException.notFound("任务不存在");
        }
        return toRespDTO(task);
    }

    @Override
    public boolean claimTask(String taskId, Long userId) {
        if (userId == null) {
            userId = getCurrentUserId();
        }
        if (userId == null) {
            throw BusinessException.bad("用户未登录");
        }
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw BusinessException.bad("用户不存在");
        }
        Task task = processEngine.getTaskService().createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw BusinessException.notFound("任务不存在");
        }
        if (task.getAssignee() != null) {
            throw BusinessException.bad("任务已被签收");
        }
        processEngine.getTaskService().claim(taskId, user.getUsername());
        log.info("签收任务 taskId={} user={}", taskId, user.getUsername());
        return true;
    }

    @Override
    public boolean unclaimTask(String taskId, Long userId) {
        Task task = processEngine.getTaskService().createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw BusinessException.notFound("任务不存在");
        }
        String currentUser = getCurrentUsername();
        if (task.getAssignee() == null || !task.getAssignee().equals(currentUser)) {
            throw BusinessException.bad("无权操作此任务");
        }
        // 释放回候选池
        processEngine.getTaskService().setAssignee(taskId, null);
        log.info("取消签收任务 taskId={}", taskId);
        return true;
    }

    @Override
    public boolean completeTask(String taskId, Long userId) {
        Task task = processEngine.getTaskService().createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw BusinessException.notFound("任务不存在");
        }
        // 签收人才能提交
        String currentUser = getCurrentUsername();
        if (task.getAssignee() == null || !task.getAssignee().equals(currentUser)) {
            throw BusinessException.bad("无权操作此任务");
        }
        processEngine.getTaskService().complete(taskId);
        log.info("完成任务 taskId={}", taskId);
        return true;
    }

    @Override
    public boolean delegateTask(String taskId, Long fromUserId, Long toUserId) {
        if (toUserId == null) {
            throw BusinessException.bad("被委托人不能为空");
        }
        User fromUser = userMapper.selectById(fromUserId);
        User toUser = userMapper.selectById(toUserId);
        if (fromUser == null || toUser == null) {
            throw BusinessException.bad("用户不存在");
        }
        Task task = processEngine.getTaskService().createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw BusinessException.notFound("任务不存在");
        }
        // 只有当前签收人可以委托
        String currentUser = getCurrentUsername();
        if (task.getAssignee() == null || !task.getAssignee().equals(currentUser)) {
            throw BusinessException.bad("无权操作此任务");
        }
        processEngine.getTaskService().delegateTask(taskId, toUser.getUsername());
        log.info("转派任务 taskId={} from={} to={}", taskId, fromUser.getUsername(), toUser.getUsername());
        return true;
    }

    @Override
    public List<TaskRespDTO> listClaimableTasks(Long userId) {
        Long currentUserId = userId != null ? userId : getCurrentUserId();
        if (currentUserId == null) {
            throw BusinessException.bad("用户未登录");
        }
        User user = userMapper.selectById(currentUserId);
        if (user == null) {
            throw BusinessException.bad("用户不存在");
        }
        List<Task> tasks = processEngine.getTaskService()
                .createTaskQuery()
                .taskCandidateUser(user.getUsername())
                .list();
        return tasks.stream()
                .map(this::toRespDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskRespDTO> listHistoryTasks(Long userId) {
        Long currentUserId = userId != null ? userId : getCurrentUserId();
        if (currentUserId == null) {
            throw BusinessException.bad("用户未登录");
        }
        User user = userMapper.selectById(currentUserId);
        if (user == null) {
            throw BusinessException.bad("用户不存在");
        }
        List<org.camunda.bpm.engine.history.HistoricTaskInstance> tasks =
                processEngine.getHistoryService()
                        .createHistoricTaskInstanceQuery()
                        .taskAssignee(user.getUsername())
                        .finished()
                        .list();
        return tasks.stream()
                .map(this::toHistoricRespDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countMyPendingTasks() {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return 0;
        }
        User user = userMapper.selectById(currentUserId);
        if (user == null) {
            return 0;
        }
        // 已签收给我的任务
        long assigned = processEngine.getTaskService()
                .createTaskQuery()
                .taskAssignee(user.getUsername())
                .count();
        // 候选给我的任务（包含候选组）
        long candidate = processEngine.getTaskService()
                .createTaskQuery()
                .taskCandidateUser(user.getUsername())
                .count();
        return assigned + candidate;
    }

    private TaskRespDTO toRespDTO(Task task) {
        TaskRespDTO dto = new TaskRespDTO();
        dto.setCamundaTaskId(task.getId());
        dto.setTaskName(task.getName());
        dto.setTaskDefinitionKey(task.getTaskDefinitionKey());
        dto.setCreatedTime(toLocalDateTime(task.getCreateTime()));
        dto.setDueDate(toLocalDateTime(task.getDueDate()));
        dto.setPriority(task.getPriority());
        dto.setAssignee(task.getAssignee());
        dto.setCandidateUsers(task.getAssignee()); // 简化：实际候选人通过任务查询获取
        dto.setCandidateGroups(null);

        // 填充流程实例信息
        String procInstId = task.getProcessInstanceId();
        if (procInstId != null) {
            dto.setCamundaProcessInstId(procInstId);
            // 通过 ProcessDefinitionId 获取 key 和 name
            String procDefId = task.getProcessDefinitionId();
            if (procDefId != null) {
                try {
                    var pd = processEngine.getRepositoryService().createProcessDefinitionQuery()
                            .processDefinitionId(procDefId).singleResult();
                    if (pd != null) {
                        dto.setProcessDefKey(pd.getKey());
                        dto.setProcessDefVersion(pd.getVersion());
                        dto.setProcessDefName(pd.getName());
                    }
                } catch (Exception ignored) {}
            }
            try {
                var pi = processEngine.getRuntimeService().createProcessInstanceQuery()
                        .processInstanceId(procInstId).singleResult();
                if (pi != null) {
                    dto.setProcessInstBusinessKey(pi.getBusinessKey());
                }
            } catch (Exception ignored) {}
        }
        dto.setStatus(task.isSuspended() ? "suspended" : "active");
        return dto;
    }

    private LocalDateTime toLocalDateTime(Date date) {
        if (date == null) return null;
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }

    private TaskRespDTO toHistoricRespDTO(org.camunda.bpm.engine.history.HistoricTaskInstance task) {
        TaskRespDTO dto = new TaskRespDTO();
        dto.setCamundaTaskId(task.getId());
        dto.setTaskName(task.getName());
        dto.setTaskDefinitionKey(task.getTaskDefinitionKey());
        dto.setCreatedTime(toLocalDateTime(task.getStartTime()));
        dto.setDueDate(toLocalDateTime(task.getDueDate()));
        dto.setPriority(task.getPriority());
        dto.setAssignee(task.getAssignee());
        dto.setCamundaProcessInstId(task.getProcessInstanceId());
        dto.setStatus("finished");
        // 填充流程定义信息
        String procDefId = task.getProcessDefinitionId();
        if (procDefId != null) {
            try {
                var pd = processEngine.getRepositoryService().createProcessDefinitionQuery()
                        .processDefinitionId(procDefId).singleResult();
                if (pd != null) {
                    dto.setProcessDefKey(pd.getKey());
                    dto.setProcessDefVersion(pd.getVersion());
                    dto.setProcessDefName(pd.getName());
                }
            } catch (Exception ignored) {}
        }
        return dto;
    }
}
