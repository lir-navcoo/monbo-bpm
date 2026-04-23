package com.monbo.bpm.module.dashboard.controller;

import com.monbo.bpm.common.Result;
import com.monbo.bpm.module.dashboard.dto.DashboardStatsRespDTO;
import com.monbo.bpm.module.dashboard.service.IDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final IDashboardService dashboardService;

    /** 首页统计数据 */
    @GetMapping("/stats")
    public Result<DashboardStatsRespDTO> getStats() {
        return Result.ok(dashboardService.getStats());
    }
}
