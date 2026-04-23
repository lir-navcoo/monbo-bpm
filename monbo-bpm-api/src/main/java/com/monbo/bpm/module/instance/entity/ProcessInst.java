package com.monbo.bpm.module.instance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("mb_process_inst")
public class ProcessInst {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 本地流程定义ID */
    private Long processDefId;

    /** Camunda 流程实例ID */
    private String camundaProcessInstId;

    /** 业务标识（BusinessKey） */
    private String businessKey;

    /** 流程发起人 */
    private Long starterId;

    /** 当前状态：1-运行中 2-已完成 3-已取消 */
    private Integer status;

    /** Camunda 流程定义ID（key:version） */
    private String camundaProcessDefId;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createdTime;

    private LocalDateTime updatedTime;

    /** 结束时间（完成/取消时记录） */
    private LocalDateTime endedTime;
}