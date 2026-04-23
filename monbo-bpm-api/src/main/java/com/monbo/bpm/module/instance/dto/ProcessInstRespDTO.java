package com.monbo.bpm.module.instance.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProcessInstRespDTO {

    private Long id;

    private Long processDefId;

    private String camundaProcessInstId;

    private String businessKey;

    private Long starterId;

    /** 1-运行中 2-已完成 3-已取消 */
    private Integer status;

    private String processDefKey;

    private Integer processDefVersion;

    private String processDefName;

    private LocalDateTime createdTime;

    private LocalDateTime endedTime;

    private String camundaProcessDefId;
}