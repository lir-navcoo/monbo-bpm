package com.monbo.bpm.module.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class TaskCompleteDTO {

    @NotBlank(message = "任务ID不能为空")
    private String taskId;

    /** 流程变量 */
    private Map<String, Object> variables;

    /** 审批意见 */
    private String comment;
}
