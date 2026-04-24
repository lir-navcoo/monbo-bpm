package com.monbo.bpm.module.instance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.monbo.bpm.common.BusinessException;
import com.monbo.bpm.module.instance.dto.ProcessInstCreateDTO;
import com.monbo.bpm.module.instance.dto.ProcessInstRespDTO;
import com.monbo.bpm.module.instance.entity.ProcessInst;
import com.monbo.bpm.module.instance.mapper.ProcessInstMapper;
import com.monbo.bpm.module.instance.service.IProcessInstService;
import com.monbo.bpm.module.process.entity.ProcessDef;
import com.monbo.bpm.module.process.mapper.ProcessDefMapper;
import com.monbo.bpm.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.history.HistoricProcessInstance;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcessInstServiceImpl implements IProcessInstService {

    private final ProcessInstMapper processInstMapper;
    private final ProcessDefMapper processDefMapper;
    private final ProcessEngine processEngine;
    private final UserMapper userMapper;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        var user = userMapper.findByUsername(auth.getName());
        return user != null ? user.getId() : null;
    }

    @Override
    @Transactional
    public Long startProcess(ProcessInstCreateDTO dto) {
        ProcessDef processDef = resolveProcessDef(dto);
        if (processDef == null) {
            throw BusinessException.bad("流程定义不存在");
        }
        ProcessInstance pi = processEngine.getRuntimeService()
                .startProcessInstanceByKey(
                        processDef.getProcessKey(),
                        dto.getBusinessKey(),
                        dto.getVariables() != null ? dto.getVariables() : new HashMap<>());

        Long starterId = getCurrentUserId();
        ProcessInst inst = new ProcessInst();
        inst.setProcessDefId(processDef.getId());
        inst.setCamundaProcessInstId(pi.getId());
        inst.setBusinessKey(dto.getBusinessKey());
        inst.setStarterId(starterId);
        inst.setStatus(1);
        inst.setCamundaProcessDefId(processDef.getCamundaProcessDefId());
        inst.setCreatedTime(LocalDateTime.now());
        processInstMapper.insert(inst);

        log.info("发起流程实例 id={} businessKey={} procDef={}", inst.getId(), dto.getBusinessKey(), processDef.getProcessKey());
        return inst.getId();
    }

    @Override
    public ProcessInstRespDTO getProcessInstById(Long id) {
        ProcessInst inst = processInstMapper.selectById(id);
        if (inst == null) {
            throw BusinessException.notFound("流程实例不存在");
        }
        syncFromCamunda(inst);
        return toRespDTO(inst);
    }

    @Override
    public IPage<ProcessInstRespDTO> listAll(int pageNum, int pageSize) {
        Page<ProcessInst> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProcessInst> wrapper = new LambdaQueryWrapper<ProcessInst>()
                .orderByDesc(ProcessInst::getCreatedTime);
        Page<ProcessInst> result = processInstMapper.selectPage(page, wrapper);
        return result.convert(this::toRespDTO);
    }

    @Override
    public List<ProcessInstRespDTO> listMyInstances(Long starterId) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            throw BusinessException.bad("用户未登录");
        }
        LambdaQueryWrapper<ProcessInst> wrapper = new LambdaQueryWrapper<ProcessInst>()
                .eq(ProcessInst::getStarterId, currentUserId)
                .orderByDesc(ProcessInst::getCreatedTime);
        return processInstMapper.selectList(wrapper).stream()
                .map(this::toRespDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProcessInstRespDTO getByBusinessKey(String businessKey) {
        ProcessInst inst = processInstMapper.selectOne(
                new LambdaQueryWrapper<ProcessInst>()
                        .eq(ProcessInst::getBusinessKey, businessKey)
                        .orderByDesc(ProcessInst::getCreatedTime).last("LIMIT 1"));
        if (inst == null) {
            throw BusinessException.notFound("流程实例不存在");
        }
        return toRespDTO(inst);
    }

    @Override
    @Transactional
    public boolean cancelProcessInst(Long id) {
        ProcessInst inst = processInstMapper.selectById(id);
        if (inst == null) {
            throw BusinessException.notFound("流程实例不存在");
        }
        if (inst.getStatus() != 1) {
            throw BusinessException.bad("只有运行中的实例可以取消");
        }
        processEngine.getRuntimeService()
                .deleteProcessInstance(inst.getCamundaProcessInstId(), "用户取消");
        inst.setStatus(3);
        inst.setEndedTime(LocalDateTime.now());
        inst.setUpdatedTime(LocalDateTime.now());
        processInstMapper.updateById(inst);
        log.info("取消流程实例 id={} businessKey={}", id, inst.getBusinessKey());
        return true;
    }

    @Override
    public List<ProcessInstRespDTO> listByProcessDef(Long processDefId) {
        if (processDefId == null) {
            throw BusinessException.bad("流程定义ID不能为空");
        }
        LambdaQueryWrapper<ProcessInst> wrapper = new LambdaQueryWrapper<ProcessInst>()
                .eq(ProcessInst::getProcessDefId, processDefId)
                .orderByDesc(ProcessInst::getCreatedTime);
        return processInstMapper.selectList(wrapper).stream()
                .peek(this::syncFromCamunda)
                .map(this::toRespDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countAll() {
        return processInstMapper.selectCount(null);
    }

    private void syncFromCamunda(ProcessInst inst) {
        if (inst.getStatus() != 1) {
            return;
        }
        String camundaInstId = inst.getCamundaProcessInstId();
        try {
            ProcessInstance running = processEngine.getRuntimeService()
                    .createProcessInstanceQuery()
                    .processInstanceId(camundaInstId)
                    .singleResult();
            if (running != null) {
                return;
            }
        } catch (Exception ignored) {
        }

        HistoricProcessInstance hist = processEngine.getHistoryService()
                .createHistoricProcessInstanceQuery()
                .processInstanceId(camundaInstId)
                .singleResult();

        if (hist != null && hist.getEndTime() != null) {
            inst.setStatus(2);
            inst.setEndedTime(LocalDateTime.now());
            inst.setUpdatedTime(LocalDateTime.now());
            processInstMapper.updateById(inst);
            log.info("同步流程实例状态 id={} camundaInstId={} → 已完成", inst.getId(), camundaInstId);
        }
    }

    private ProcessDef resolveProcessDef(ProcessInstCreateDTO dto) {
        if (dto.getProcessDefId() != null) {
            return processDefMapper.selectById(dto.getProcessDefId());
        }
        if (dto.getProcessDefKey() != null) {
            LambdaQueryWrapper<ProcessDef> wrapper = new LambdaQueryWrapper<ProcessDef>()
                    .eq(ProcessDef::getProcessKey, dto.getProcessDefKey());
            if (dto.getProcessDefVersion() != null) {
                wrapper.eq(ProcessDef::getVersion, dto.getProcessDefVersion());
            } else {
                wrapper.orderByDesc(ProcessDef::getVersion).last("LIMIT 1");
            }
            return processDefMapper.selectOne(wrapper);
        }
        return null;
    }

    private ProcessInstRespDTO toRespDTO(ProcessInst inst) {
        ProcessInstRespDTO dto = new ProcessInstRespDTO();
        dto.setId(inst.getId());
        dto.setProcessDefId(inst.getProcessDefId());
        dto.setCamundaProcessInstId(inst.getCamundaProcessInstId());
        dto.setBusinessKey(inst.getBusinessKey());
        dto.setStarterId(inst.getStarterId());
        dto.setStatus(inst.getStatus());
        dto.setCamundaProcessDefId(inst.getCamundaProcessDefId());
        dto.setCreatedTime(inst.getCreatedTime());
        ProcessDef def = processDefMapper.selectById(inst.getProcessDefId());
        if (def != null) {
            dto.setProcessDefKey(def.getProcessKey());
            dto.setProcessDefVersion(def.getVersion());
            dto.setProcessDefName(def.getProcessName());
        }
        dto.setEndedTime(inst.getEndedTime());
        return dto;
    }
}
