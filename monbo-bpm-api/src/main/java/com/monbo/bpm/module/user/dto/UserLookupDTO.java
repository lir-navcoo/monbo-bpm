package com.monbo.bpm.module.user.dto;

import lombok.Data;

@Data
public class UserLookupDTO {

    private Long id;

    private String username;

    private String realName;

    private Long deptId;

    private String deptName;
}
