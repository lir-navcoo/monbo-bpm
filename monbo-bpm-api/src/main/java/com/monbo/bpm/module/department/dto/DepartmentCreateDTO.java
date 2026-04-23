package com.monbo.bpm.module.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DepartmentCreateDTO {

    @NotBlank(message = "部门名称不能为空")
    @Size(max = 128, message = "部门名称最多128字符")
    private String deptName;

    @NotBlank(message = "部门编码不能为空")
    @Size(max = 64, message = "部门编码最多64字符")
    private String deptCode;

    private Long parentId;

    @Size(max = 64, message = "负责人姓名最多64字符")
    private String leader;

    @Pattern(regexp = "^$|^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @Pattern(regexp = "^$|^[\\w.-]+@[\\w.-]+\\.\\w+$", message = "邮箱格式不正确")
    private String email;

    private Integer sortOrder;

    private Integer status;
}
