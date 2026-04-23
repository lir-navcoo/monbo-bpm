package com.monbo.bpm.module.task.controller;

import com.monbo.bpm.common.Result;
import com.monbo.bpm.module.task.dto.TaskClaimDTO;
import com.monbo.bpm.module.task.dto.TaskCompleteDTO;
import com.monbo.bpm.module.task.dto.TaskDelegateDTO;
import com.monbo.bpm.module.task.dto.TaskRespDTO;
import com.monbo.bpm.module.task.service.ITaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final ITaskService taskService;

    /** 查询我的待办 */
    @GetMapping("/my")
    public Result<List<TaskRespDTO>> listMyTasks(@RequestParam(required = false) Long userId) {
        return Result.ok(taskService.listMyTasks(userId));
    }

    /** 按任务ID查询 */
    @GetMapping("/{taskId}")
    public Result<TaskRespDTO> getTask(@PathVariable String taskId) {
        return Result.ok(taskService.getTaskById(taskId));
    }

    /** 签收任务 */
    @PostMapping("/claim")
    public Result<Void> claimTask(@Valid @RequestBody TaskClaimDTO dto) {
        taskService.claimTask(dto.getTaskId(), dto.getAssigneeId());
        return Result.ok();
    }

    /** 取消签收 */
    @PostMapping("/unclaim")
    public Result<Void> unclaimTask(@RequestBody TaskClaimDTO dto) {
        taskService.unclaimTask(dto.getTaskId(), dto.getAssigneeId());
        return Result.ok();
    }

    /** 完成任务 */
    @PostMapping("/complete")
    public Result<Void> completeTask(@Valid @RequestBody TaskCompleteDTO dto) {
        taskService.completeTask(dto.getTaskId(), null);
        return Result.ok();
    }

    /** 转派任务 */
    @PostMapping("/delegate")
    public Result<Void> delegateTask(@Valid @RequestBody TaskDelegateDTO dto) {
        taskService.delegateTask(dto.getTaskId(), null, dto.getDelegateUserId());
        return Result.ok();
    }

    /** 查询可签收的任务 */
    @GetMapping("/claimable")
    public Result<List<TaskRespDTO>> listClaimableTasks(@RequestParam(required = false) Long userId) {
        return Result.ok(taskService.listClaimableTasks(userId));
    }

    /** 历史任务 */
    @GetMapping("/history")
    public Result<List<TaskRespDTO>> listHistoryTasks(@RequestParam(required = false) Long userId) {
        return Result.ok(taskService.listHistoryTasks(userId));
    }
}
