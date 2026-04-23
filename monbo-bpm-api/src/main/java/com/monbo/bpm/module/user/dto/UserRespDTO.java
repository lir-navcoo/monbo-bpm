package com.monbo.bpm.module.user.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserRespDTO {

    private Long id;

    private String username;

    private String realName;

    private String email;

    private String phone;

    private Long deptId;

    private String deptName;

    private Integer status;

    private List<Long> roleIds;

    private LocalDateTime createdTime;

    private LocalDateTime updatedTime;
}
