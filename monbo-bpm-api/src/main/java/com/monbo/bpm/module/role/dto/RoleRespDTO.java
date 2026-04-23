package com.monbo.bpm.module.role.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoleRespDTO {

    private Long id;

    private String roleCode;

    private String roleName;

    private String description;

    private Integer status;

    private LocalDateTime createdTime;

    private LocalDateTime updatedTime;
}
