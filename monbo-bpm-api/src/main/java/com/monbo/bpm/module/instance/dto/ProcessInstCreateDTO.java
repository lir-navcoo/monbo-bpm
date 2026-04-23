package com.monbo.bpm.module.instance.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ProcessInstCreateDTO {

    /** 本地流程定义ID（与 processDefKey 二选一） */
    private Long processDefId;

    /** 流程定义key（与 processDefId 二选一） */
    private String processDefKey;

    /** 流程定义版本，不传则取最新 */
    private Integer processDefVersion;

    /** 业务标识 */
    private String businessKey;

    /** 启动变量 */
    private Map<String, Object> variables;
}
