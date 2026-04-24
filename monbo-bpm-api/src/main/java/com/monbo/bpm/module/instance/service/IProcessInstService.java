package com.monbo.bpm.module.instance.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.monbo.bpm.module.instance.dto.ProcessInstCreateDTO;
import com.monbo.bpm.module.instance.dto.ProcessInstRespDTO;

import java.util.List;

public interface IProcessInstService {

    /** 发起流程实例 */
    Long startProcess(ProcessInstCreateDTO dto);

    /** 查询单个实例 */
    ProcessInstRespDTO getProcessInstById(Long id);

    /** 分页查询所有流程实例 */
    IPage<ProcessInstRespDTO> listAll(int pageNum, int pageSize);

    /** 查询我的发起实例 */
    List<ProcessInstRespDTO> listMyInstances(Long starterId);

    /** 查询实例（按businessKey） */
    ProcessInstRespDTO getByBusinessKey(String businessKey);

    /** 取消流程实例 */
    boolean cancelProcessInst(Long id);

    /** 按流程定义查询实例 */
    List<ProcessInstRespDTO> listByProcessDef(Long processDefId);

    /** 统计所有流程实例数量 */
    long countAll();
}
