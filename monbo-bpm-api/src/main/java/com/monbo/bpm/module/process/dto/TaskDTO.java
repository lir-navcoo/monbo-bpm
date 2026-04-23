package com.monbo.bpm.module.process.dto;

import lombok.Data;

@Data
public class TaskDTO {

    private String taskId;

    private String taskName;

    private String processInstanceId;

    private String processDefinitionKey;

    private String assignee;

    private String candidateUser;

    private String candidateGroup;

    private String dueDate;

    private Integer priority;

    private String createdTime;

    private String description;
}
