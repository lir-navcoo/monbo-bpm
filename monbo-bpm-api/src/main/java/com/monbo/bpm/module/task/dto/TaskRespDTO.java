package com.monbo.bpm.module.task.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskRespDTO {

    private String camundaTaskId;

    private String taskName;

    private String taskDefinitionKey;

    private String processDefKey;

    private String camundaProcessInstId;

    private String processInstBusinessKey;

    private Integer processDefVersion;

    private String processDefName;

    /** 办理人（已签收时） */
    private String assignee;

    /** 候选人列表 */
    private String candidateUsers;

    /** 候选组列表 */
    private String candidateGroups;

    /** 创建时间 */
    private LocalDateTime createdTime;

    /** 到期时间 */
    private LocalDateTime dueDate;

    /** 优先级 */
    private Integer priority;

    /** 状态：pending/active/completed */
    private String status;
}
