package com.monbo.bpm.module.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UserRoleDTO {

    @NotNull(message = "角色ID列表不能为null")
    private List<Long> roleIds;
}
