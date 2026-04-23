package com.monbo.bpm.module.process.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.monbo.bpm.common.BusinessException;
import com.monbo.bpm.module.process.dto.ProcessDefCreateDTO;
import com.monbo.bpm.module.process.dto.ProcessDefRespDTO;
import com.monbo.bpm.module.process.dto.ProcessDefUpdateDTO;
import com.monbo.bpm.module.process.entity.ProcessDef;
import com.monbo.bpm.module.process.mapper.ProcessDefMapper;
import com.monbo.bpm.module.process.service.IProcessDefService;
import com.monbo.bpm.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RepositoryService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcessDefServiceImpl implements IProcessDefService {

    private final ProcessDefMapper processDefMapper;
    private final RepositoryService repositoryService;
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
    public Long createProcessDef(ProcessDefCreateDTO dto) {
        // 校验 processKey 唯一
        long exists = processDefMapper.selectCount(
                new LambdaQueryWrapper<ProcessDef>()
                        .eq(ProcessDef::getProcessKey, dto.getProcessKey()));
        if (exists > 0) {
            throw BusinessException.bad("流程Key已存在");
        }

        // 查询当前最新版本号（1次查询）
        Integer latestVersion = processDefMapper.selectList(
                        new LambdaQueryWrapper<ProcessDef>()
                                .eq(ProcessDef::getProcessKey, dto.getProcessKey())
                                .orderByDesc(ProcessDef::getVersion).last("LIMIT 1"))
                .stream().mapToInt(ProcessDef::getVersion).max().orElse(0);

        int newVersion = latestVersion + 1;

        // 部署到 Camunda
        String deploymentId = deployToCamunda(dto.getProcessKey(), newVersion, dto.getBpmnXml());

        // 写入本地库
        Long operatorId = getCurrentUserId();
        ProcessDef def = new ProcessDef();
        def.setProcessKey(dto.getProcessKey());
        def.setProcessName(dto.getProcessName());
        def.setDescription(dto.getDescription());
        def.setCategory(dto.getCategory());
        def.setVersion(newVersion);
        def.setBpmnXml(dto.getBpmnXml());
        def.setSvgXml(dto.getSvgXml());
        def.setStatus(1); // 激活
        def.setDeploymentId(deploymentId);
        def.setCamundaProcessDefId(dto.getProcessKey() + ":" + newVersion + ":" + deploymentId);
        def.setCreatedBy(operatorId);
        def.setCreatedTime(LocalDateTime.now());
        processDefMapper.insert(def);

        log.info("发布流程定义 id={} key={} v{}", def.getId(), dto.getProcessKey(), newVersion);
        return def.getId();
    }

    @Override
    public ProcessDefRespDTO getProcessDefById(Long id) {
        ProcessDef def = processDefMapper.selectById(id);
        if (def == null) {
            throw BusinessException.notFound("流程定义不存在");
        }
        return toRespDTO(def);
    }

    @Override
    public ProcessDefRespDTO getProcessDef(String processKey, Integer version) {
        LambdaQueryWrapper<ProcessDef> wrapper = new LambdaQueryWrapper<ProcessDef>()
                .eq(ProcessDef::getProcessKey, processKey);
        if (version != null) {
            wrapper.eq(ProcessDef::getVersion, version);
        } else {
            // 取最新版本
            wrapper.orderByDesc(ProcessDef::getVersion).last("LIMIT 1");
        }
        ProcessDef def = processDefMapper.selectOne(wrapper);
        if (def == null) {
            throw BusinessException.notFound("流程定义不存在");
        }
        return toRespDTO(def);
    }

    @Override
    public List<ProcessDefRespDTO> listProcessDefs(String category) {
        LambdaQueryWrapper<ProcessDef> wrapper = new LambdaQueryWrapper<ProcessDef>();
        if (category != null && !category.isEmpty()) {
            wrapper.eq(ProcessDef::getCategory, category);
        }
        wrapper.orderByDesc(ProcessDef::getCreatedTime);
        List<ProcessDef> defs = processDefMapper.selectList(wrapper);
        return defs.stream().map(this::toRespDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean updateProcessDef(Long id, ProcessDefUpdateDTO dto) {
        ProcessDef def = processDefMapper.selectById(id);
        if (def == null) {
            throw BusinessException.notFound("流程定义不存在");
        }

        // BPMN 内容变更 → 重新部署（同 createProcessDef，禁止原地覆盖版本）
        if (dto.getBpmnXml() != null && !dto.getBpmnXml().isEmpty()) {
            if (!dto.getBpmnXml().equals(def.getBpmnXml())) {
                // 版本号+1 创建新版本，与 redeployProcessDef 语义一致
                int newVersion = def.getVersion() + 1;
                String newDeploymentId = deployToCamunda(def.getProcessKey(), newVersion, dto.getBpmnXml());

                ProcessDef newDef = new ProcessDef();
                newDef.setProcessKey(def.getProcessKey());
                newDef.setProcessName(dto.getProcessName() != null && !dto.getProcessName().isEmpty() ? dto.getProcessName() : def.getProcessName());
                newDef.setDescription(dto.getDescription() != null ? dto.getDescription() : def.getDescription());
                newDef.setCategory(dto.getCategory() != null ? dto.getCategory() : def.getCategory());
                newDef.setVersion(newVersion);
                newDef.setBpmnXml(dto.getBpmnXml());
                newDef.setSvgXml(dto.getSvgXml() != null ? dto.getSvgXml() : def.getSvgXml());
                newDef.setStatus(1);
                newDef.setDeploymentId(newDeploymentId);
                newDef.setCreatedBy(getCurrentUserId());
                newDef.setCreatedTime(LocalDateTime.now());
                processDefMapper.insert(newDef);
                log.info("BPMN变更创建新版本 id={} key={} v{}", newDef.getId(), def.getProcessKey(), newVersion);
                return true;
            }
        }

        if (dto.getProcessName() != null && !dto.getProcessName().isEmpty()) {
            def.setProcessName(dto.getProcessName());
        }
        if (dto.getDescription() != null) {
            def.setDescription(dto.getDescription());
        }
        if (dto.getCategory() != null) {
            def.setCategory(dto.getCategory());
        }

        def.setUpdatedBy(getCurrentUserId());
        def.setUpdatedTime(LocalDateTime.now());
        return processDefMapper.updateById(def) > 0;
    }

    @Override
    @Transactional
    public Long redeployProcessDef(Long id, String bpmnXml, String svgXml) {
        if (bpmnXml == null || bpmnXml.isBlank()) {
            throw BusinessException.bad("BPMN XML不能为空");
        }
        ProcessDef def = processDefMapper.selectById(id);
        if (def == null) {
            throw BusinessException.notFound("流程定义不存在");
        }

        // 发布新版本
        int newVersion = def.getVersion() + 1;
        String deploymentId = deployToCamunda(def.getProcessKey(), newVersion, bpmnXml);

        // 写入新版本记录
        Long operatorId = getCurrentUserId();
        ProcessDef newDef = new ProcessDef();
        newDef.setProcessKey(def.getProcessKey());
        newDef.setProcessName(def.getProcessName());
        newDef.setDescription(def.getDescription());
        newDef.setCategory(def.getCategory());
        newDef.setVersion(newVersion);
        newDef.setBpmnXml(bpmnXml);
        newDef.setSvgXml(svgXml);
        newDef.setStatus(1);
        newDef.setDeploymentId(deploymentId);
        newDef.setCamundaProcessDefId(def.getProcessKey() + ":" + newVersion + ":" + deploymentId);
        newDef.setCreatedBy(operatorId);
        newDef.setCreatedTime(LocalDateTime.now());
        processDefMapper.insert(newDef);

        log.info("重新部署流程定义 id={} key={} v{}", newDef.getId(), def.getProcessKey(), newVersion);
        return newDef.getId();
    }

    @Override
    @Transactional
    public boolean activateProcessDef(Long id) {
        ProcessDef def = processDefMapper.selectById(id);
        if (def == null) {
            throw BusinessException.notFound("流程定义不存在");
        }
        if (def.getStatus() == 1) {
            return true; // 已是激活状态
        }
        repositoryService.activateProcessDefinitionById(def.getCamundaProcessDefId(), true, null);
        def.setStatus(1);
        def.setUpdatedBy(getCurrentUserId());
        def.setUpdatedTime(LocalDateTime.now());
        processDefMapper.updateById(def);
        log.info("激活流程定义 id={} key={}", id, def.getProcessKey());
        return true;
    }

    @Override
    @Transactional
    public boolean suspendProcessDef(Long id) {
        ProcessDef def = processDefMapper.selectById(id);
        if (def == null) {
            throw BusinessException.notFound("流程定义不存在");
        }
        if (def.getStatus() == 2) {
            return true; // 已是挂起状态
        }
        repositoryService.suspendProcessDefinitionById(def.getCamundaProcessDefId(), true, null);
        def.setStatus(2);
        def.setUpdatedBy(getCurrentUserId());
        def.setUpdatedTime(LocalDateTime.now());
        processDefMapper.updateById(def);
        log.info("挂起流程定义 id={} key={}", id, def.getProcessKey());
        return true;
    }

    @Override
    @Transactional
    public boolean deleteProcessDef(Long id) {
        ProcessDef def = processDefMapper.selectById(id);
        if (def == null) {
            throw BusinessException.notFound("流程定义不存在");
        }
        // 从 Camunda 删除部署
        try {
            repositoryService.deleteDeployment(def.getDeploymentId(), true);
        } catch (Exception e) {
            log.warn("Camunda 部署删除失败 deploymentId={}: {}", def.getDeploymentId(), e.getMessage());
        }
        processDefMapper.deleteById(id);
        log.info("删除流程定义 id={} key={}", id, def.getProcessKey());
        return true;
    }

    /**
     * 将 BPMN XML 部署到 Camunda 引擎
     */
    private String deployToCamunda(String processKey, int version, String bpmnXml) {
        String resourceName = processKey + "_v" + version + ".bpmn";
        ByteArrayInputStream inputStream = new ByteArrayInputStream(bpmnXml.getBytes(StandardCharsets.UTF_8));
        return repositoryService.createDeployment()
                .name(processKey + "_v" + version)
                .addInputStream(resourceName, inputStream)
                .deploy()
                .getId();
    }

    private ProcessDefRespDTO toRespDTO(ProcessDef def) {
        ProcessDefRespDTO dto = new ProcessDefRespDTO();
        dto.setId(def.getId());
        dto.setProcessKey(def.getProcessKey());
        dto.setProcessName(def.getProcessName());
        dto.setDescription(def.getDescription());
        dto.setCategory(def.getCategory());
        dto.setVersion(def.getVersion());
        dto.setHasBpmnXml(def.getBpmnXml() != null && !def.getBpmnXml().isEmpty());
        dto.setHasSvgXml(def.getSvgXml() != null && !def.getSvgXml().isEmpty());
        dto.setStatus(def.getStatus());
        dto.setDeploymentId(def.getDeploymentId());
        dto.setCamundaProcessDefinitionId(def.getProcessKey() + ":" + def.getVersion());
        dto.setCreatedBy(def.getCreatedBy());
        dto.setCreatedTime(def.getCreatedTime());
        dto.setUpdatedBy(def.getUpdatedBy());
        dto.setUpdatedTime(def.getUpdatedTime());
        return dto;
    }
}
