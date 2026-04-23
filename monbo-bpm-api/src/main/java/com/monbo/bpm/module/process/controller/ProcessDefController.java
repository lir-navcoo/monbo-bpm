package com.monbo.bpm.module.process.controller;

import com.monbo.bpm.common.Result;
import com.monbo.bpm.module.process.dto.ProcessDefCreateDTO;
import com.monbo.bpm.module.process.dto.ProcessDefRespDTO;
import com.monbo.bpm.module.process.dto.ProcessDefUpdateDTO;
import com.monbo.bpm.module.process.service.IProcessDefService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@Validated
@RequestMapping("/api/process-defs")
@RequiredArgsConstructor
public class ProcessDefController {

    private final IProcessDefService processDefService;

    /** 发布流程定义 */
    @PostMapping
    public Result<Long> createProcessDef(@Valid @RequestBody ProcessDefCreateDTO dto) {
        return Result.ok(processDefService.createProcessDef(dto));
    }

    /** 按 ID 查询 */
    @GetMapping("/{id}")
    public Result<ProcessDefRespDTO> getProcessDefById(@PathVariable Long id) {
        return Result.ok(processDefService.getProcessDefById(id));
    }

    /** 按 processKey + version 查询 */
    @GetMapping("/key/{processKey}")
    public Result<ProcessDefRespDTO> getProcessDef(
            @PathVariable String processKey,
            @RequestParam(required = false) Integer version) {
        return Result.ok(processDefService.getProcessDef(processKey, version));
    }

    /** 列出所有流程定义 */
    @GetMapping
    public Result<List<ProcessDefRespDTO>> listProcessDefs(
            @RequestParam(required = false) String category) {
        return Result.ok(processDefService.listProcessDefs(category));
    }

    /** 更新流程定义元数据 */
    @PutMapping("/{id}")
    public Result<Void> updateProcessDef(@PathVariable Long id,
                                         @Valid @RequestBody ProcessDefUpdateDTO dto) {
        processDefService.updateProcessDef(id, dto);
        return Result.ok();
    }

    /** 重新部署流程（BPMN XML 变更） */
    @PostMapping("/{id}/redeploy")
    public Result<Long> redeployProcessDef(@PathVariable Long id,
                                            @RequestBody RedeployDTO dto) {
        return Result.ok(processDefService.redeployProcessDef(id, dto.getBpmnXml(), dto.getSvgXml()));
    }

    /** 激活流程定义 */
    @PutMapping("/{id}/activate")
    public Result<Void> activateProcessDef(@PathVariable Long id) {
        processDefService.activateProcessDef(id);
        return Result.ok();
    }

    /** 挂起流程定义 */
    @PutMapping("/{id}/suspend")
    public Result<Void> suspendProcessDef(@PathVariable Long id) {
        processDefService.suspendProcessDef(id);
        return Result.ok();
    }

    /** 删除流程定义 */
    @DeleteMapping("/{id}")
    public Result<Void> deleteProcessDef(@PathVariable Long id) {
        processDefService.deleteProcessDef(id);
        return Result.ok();
    }

    /** 重新部署请求体 */
    @lombok.Data
    public static class RedeployDTO {
        private String bpmnXml;
        private String svgXml;
    }
}
