package com.monbo.bpm.module.process.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProcessDefRespDTO {

    private Long id;

    /** Camunda 流程定义 Key（唯一标识） */
    private String processKey;

    /** 流程显示名称 */
    private String processName;

    private String description;

    private String category;

    /** Camunda 流程定义版本号 */
    private Integer version;

    /** 是否有 BPMN XML */
    private Boolean hasBpmnXml;

    /** 是否有 SVG 流程图 */
    private Boolean hasSvgXml;

    /** 流程定义状态：1=激活，2=挂起 */
    private Integer status;

    /** Camunda 部署 ID */
    private String deploymentId;

    /** Camunda 流程定义 ID（key:version 格式） */
    private String camundaProcessDefinitionId;

    private Long createdBy;

    private LocalDateTime createdTime;

    private Long updatedBy;

    private LocalDateTime updatedTime;
}
