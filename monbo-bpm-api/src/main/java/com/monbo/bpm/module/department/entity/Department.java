package com.monbo.bpm.module.department.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("mb_department")
public class Department {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long parentId;

    private String deptName;

    private String deptCode;

    private String leader;

    private String phone;

    private String email;

    private Integer sortOrder;

    private Integer status;

    private Long createdBy;

    private LocalDateTime createdTime;

    private Long updatedBy;

    private LocalDateTime updatedTime;

    @TableLogic
    private Integer deleted;
}
