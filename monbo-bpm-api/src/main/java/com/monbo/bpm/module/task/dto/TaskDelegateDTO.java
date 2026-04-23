package com.monbo.bpm.module.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskDelegateDTO {

    @NotBlank(message = "任务ID不能为空")
    private String taskId;

    @NotNull(message = "被委托人用户ID不能为空")
    private Long delegateUserId;
}
