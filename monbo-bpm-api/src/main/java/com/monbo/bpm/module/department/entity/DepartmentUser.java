package com.monbo.bpm.module.department.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("mb_department_user")
public class DepartmentUser {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long deptId;

    private Long userId;

    private Long createdBy;

    private LocalDateTime createdTime;

    @TableLogic
    private Integer deleted;
}
