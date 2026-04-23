package com.monbo.bpm.module.role.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoleCreateDTO {

    @NotBlank(message = "角色编码不能为空")
    @Size(max = 50, message = "角色编码最多 50 字符")
    private String roleCode;

    @NotBlank(message = "角色名称不能为空")
    @Size(max = 100, message = "角色名称最多 100 字符")
    private String roleName;

    @Size(max = 500, message = "描述最多 500 字符")
    private String description;
}
