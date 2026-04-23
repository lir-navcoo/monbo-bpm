package com.monbo.bpm.module.dashboard.dto;

import lombok.Data;

@Data
public class DashboardStatsRespDTO {

    /** 人员总数 */
    private long totalUsers;

    /** 角色总数 */
    private long totalRoles;

    /** 流程实例总数 */
    private long totalProcessInstances;

    /** 待办任务总数 */
    private long pendingTasks;
}
