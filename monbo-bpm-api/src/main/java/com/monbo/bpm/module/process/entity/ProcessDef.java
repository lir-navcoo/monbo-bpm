package com.monbo.bpm.module.process.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("mb_process_def")
public class ProcessDef {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String processKey;

    private String processName;

    private String description;

    private String category;

    private Integer version;

    private String bpmnXml;

    private String svgXml;

    private Integer status;

    private String deploymentId;

    /** Camunda 流程定义ID（key:version格式） */
    private String camundaProcessDefId;

    private Long createdBy;

    private LocalDateTime createdTime;

    private Long updatedBy;

    private LocalDateTime updatedTime;

    @TableLogic
    private Integer deleted;
}
