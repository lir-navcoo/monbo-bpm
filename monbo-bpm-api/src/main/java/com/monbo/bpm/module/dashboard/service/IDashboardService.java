package com.monbo.bpm.module.dashboard.service;

import com.monbo.bpm.module.dashboard.dto.DashboardStatsRespDTO;

public interface IDashboardService {

    /** 获取首页统计数据 */
    DashboardStatsRespDTO getStats();
}
