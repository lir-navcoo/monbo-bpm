package com.monbo.bpm.module.task.service;

import com.monbo.bpm.module.task.dto.TaskRespDTO;

import java.util.List;

public interface ITaskService {

    /** 查询我的待办任务 */
    List<TaskRespDTO> listMyTasks(Long userId);

    /** 按任务ID查询 */
    TaskRespDTO getTaskById(String taskId);

    /** 签收任务 */
    boolean claimTask(String taskId, Long userId);

    /** 取消签收（释放回候选池） */
    boolean unclaimTask(String taskId, Long userId);

    /** 办理任务 */
    boolean completeTask(String taskId, Long userId);

    /** 转派任务 */
    boolean delegateTask(String taskId, Long fromUserId, Long toUserId);

    /** 查询可签收的任务（候选池） */
    List<TaskRespDTO> listClaimableTasks(Long userId);

    /** 查询历史任务 */
    List<TaskRespDTO> listHistoryTasks(Long userId);

    /** 统计当前用户的待办任务数量（已签收 + 可签收） */
    long countMyPendingTasks();
}
