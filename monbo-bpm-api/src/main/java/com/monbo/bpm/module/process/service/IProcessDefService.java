package com.monbo.bpm.module.process.service;

import com.monbo.bpm.module.process.dto.ProcessDefCreateDTO;
import com.monbo.bpm.module.process.dto.ProcessDefRespDTO;
import com.monbo.bpm.module.process.dto.ProcessDefUpdateDTO;

import java.util.List;

public interface IProcessDefService {

    /**
     * 发布流程定义（BPMN XML 部署到 Camunda 引擎）
     */
    Long createProcessDef(ProcessDefCreateDTO dto);

    /**
     * 查询单个流程定义
     */
    ProcessDefRespDTO getProcessDefById(Long id);

    /**
     * 查询单个流程定义（按 processKey + version）
     */
    ProcessDefRespDTO getProcessDef(String processKey, Integer version);

    /**
     * 列出所有流程定义（合并本地库 + Camunda 部署状态）
     */
    List<ProcessDefRespDTO> listProcessDefs(String category);

    /**
     * 更新流程定义元数据（BPMN 内容变更需重新部署）
     */
    boolean updateProcessDef(Long id, ProcessDefUpdateDTO dto);

    /**
     * 重新部署流程（用于 BPMN XML 变更）
     */
    Long redeployProcessDef(Long id, String bpmnXml, String svgXml);

    /**
     * 激活流程定义
     */
    boolean activateProcessDef(Long id);

    /**
     * 挂起流程定义
     */
    boolean suspendProcessDef(Long id);

    /**
     * 删除流程定义
     */
    boolean deleteProcessDef(Long id);
}
