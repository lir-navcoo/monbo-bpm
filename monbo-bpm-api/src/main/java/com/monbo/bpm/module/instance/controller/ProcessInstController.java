package com.monbo.bpm.module.instance.controller;

import com.monbo.bpm.common.Result;
import com.monbo.bpm.module.instance.dto.ProcessInstCreateDTO;
import com.monbo.bpm.module.instance.dto.ProcessInstRespDTO;
import com.monbo.bpm.module.instance.service.IProcessInstService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/process-insts")
@RequiredArgsConstructor
public class ProcessInstController {

    private final IProcessInstService processInstService;

    /** 发起流程实例 */
    @PostMapping
    public Result<Long> startProcess(@Valid @RequestBody ProcessInstCreateDTO dto) {
        return Result.ok(processInstService.startProcess(dto));
    }

    /** 查询单个实例 */
    @GetMapping("/{id}")
    public Result<ProcessInstRespDTO> getProcessInst(@PathVariable Long id) {
        return Result.ok(processInstService.getProcessInstById(id));
    }

    /** 查询我的发起实例 */
    @GetMapping("/my")
    public Result<List<ProcessInstRespDTO>> listMyInstances() {
        return Result.ok(processInstService.listMyInstances(null));
    }

    /** 按流程定义查询实例 */
    @GetMapping("/process-def/{processDefId}")
    public Result<List<ProcessInstRespDTO>> listByProcessDef(@PathVariable Long processDefId) {
        return Result.ok(processInstService.listByProcessDef(processDefId));
    }

    /** 按业务标识查询 */
    @GetMapping("/by-key/{businessKey}")
    public Result<ProcessInstRespDTO> getByBusinessKey(@PathVariable String businessKey) {
        return Result.ok(processInstService.getByBusinessKey(businessKey));
    }

    /** 取消流程实例 */
    @PutMapping("/{id}/cancel")
    public Result<Void> cancelProcessInst(@PathVariable Long id) {
        processInstService.cancelProcessInst(id);
        return Result.ok();
    }
}
