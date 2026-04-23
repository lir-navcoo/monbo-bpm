package com.monbo.bpm.module.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskClaimDTO {

    @NotBlank(message = "任务ID不能为空")
    private String taskId;

    /** 签收人用户ID（用于代签场景） */
    private Long assigneeId;
}
