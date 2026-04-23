package com.monbo.bpm.module.role.controller;

import com.monbo.bpm.common.Result;
import com.monbo.bpm.module.role.dto.RoleCreateDTO;
import com.monbo.bpm.module.role.dto.RoleRespDTO;
import com.monbo.bpm.module.role.dto.RoleUpdateDTO;
import com.monbo.bpm.module.role.dto.RoleUserDTO;
import com.monbo.bpm.module.role.service.IRoleService;
import com.monbo.bpm.module.user.dto.UserRespDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final IRoleService roleService;

    @PostMapping
    public Result<Long> createRole(@Valid @RequestBody RoleCreateDTO dto) {
        return Result.ok(roleService.createRole(dto));
    }

    @GetMapping("/{id}")
    public Result<RoleRespDTO> getRoleById(@PathVariable Long id) {
        return Result.ok(roleService.getRoleById(id));
    }

    @GetMapping
    public Result<List<RoleRespDTO>> listRoles() {
        return Result.ok(roleService.listRoles());
    }

    @PutMapping("/{id}")
    public Result<Void> updateRole(@PathVariable Long id,
                                   @Valid @RequestBody RoleUpdateDTO dto) {
        roleService.updateRole(id, dto);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return Result.ok();
    }

    @PutMapping("/{id}/users")
    public Result<Void> assignUsersToRole(@PathVariable Long id,
                                          @Valid @RequestBody RoleUserDTO dto) {
        roleService.assignUsersToRole(id, dto.getUserIds());
        return Result.ok();
    }

    @GetMapping("/{id}/users")
    public Result<List<UserRespDTO>> getUsersByRoleId(@PathVariable Long id) {
        return Result.ok(roleService.getUsersByRoleId(id));
    }
}
