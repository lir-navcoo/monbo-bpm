package com.monbo.bpm.module.dashboard.service.impl;

import com.monbo.bpm.module.dashboard.dto.DashboardStatsRespDTO;
import com.monbo.bpm.module.dashboard.service.IDashboardService;
import com.monbo.bpm.module.instance.service.IProcessInstService;
import com.monbo.bpm.module.role.service.IRoleService;
import com.monbo.bpm.module.task.service.ITaskService;
import com.monbo.bpm.module.user.service.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements IDashboardService {

    private final IUserService userService;
    private final IRoleService roleService;
    private final IProcessInstService processInstService;
    private final ITaskService taskService;

    @Override
    public DashboardStatsRespDTO getStats() {
        DashboardStatsRespDTO stats = new DashboardStatsRespDTO();
        // 用户总数：利用分页接口的 total 字段
        stats.setTotalUsers(userService.listUsers(1, 1, null, null).getTotal());
        // 角色总数
        stats.setTotalRoles(roleService.listRoles().size());
        // 流程实例总数
        stats.setTotalProcessInstances(processInstService.countAll());
        // 待办任务总数
        stats.setPendingTasks(taskService.countMyPendingTasks());
        log.debug("仪表盘统计: totalUsers={}, totalRoles={}, totalProcessInstances={}, pendingTasks={}",
                stats.getTotalUsers(), stats.getTotalRoles(),
                stats.getTotalProcessInstances(), stats.getPendingTasks());
        return stats;
    }
}
