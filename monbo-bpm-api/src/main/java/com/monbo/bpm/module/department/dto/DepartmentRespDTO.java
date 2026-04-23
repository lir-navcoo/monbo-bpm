package com.monbo.bpm.module.department.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DepartmentRespDTO {

    private Long id;

    private Long parentId;

    private String deptName;

    private String deptCode;

    private String leader;

    private String phone;

    private String email;

    private Integer sortOrder;

    private Integer status;

    private LocalDateTime createdTime;

    private LocalDateTime updatedTime;

    private List<DepartmentRespDTO> children;
}
