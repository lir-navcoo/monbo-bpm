package com.monbo.bpm.module.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserPasswordDTO {

    // 旧密码由 Service 层验证存在性（通过 selectById 判断用户）
    private String oldPassword;

    // 新密码由 Service 层校验非空、与旧密码不同
    @Size(min = 6, max = 100, message = "新密码至少 6 位")
    private String newPassword;
}
