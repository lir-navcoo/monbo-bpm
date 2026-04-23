package com.monbo.bpm.module.user.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.monbo.bpm.common.Result;
import com.monbo.bpm.module.user.dto.UserCreateDTO;
import com.monbo.bpm.module.user.dto.UserLookupDTO;
import com.monbo.bpm.module.user.dto.UserPasswordDTO;
import com.monbo.bpm.module.user.dto.UserRespDTO;
import com.monbo.bpm.module.user.dto.UserRoleDTO;
import com.monbo.bpm.module.user.dto.UserUpdateDTO;
import com.monbo.bpm.module.role.dto.RoleRespDTO;
import com.monbo.bpm.module.user.service.IUserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@Validated
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @PostMapping
    public Result<Long> createUser(@Valid @RequestBody UserCreateDTO dto) {
        Long id = userService.createUser(dto);
        return Result.ok(id);
    }

    @GetMapping("/{id}")
    public Result<UserRespDTO> getUserById(@PathVariable Long id) {
        return Result.ok(userService.getUserById(id));
    }

    @GetMapping
    public Result<IPage<UserRespDTO>> listUsers(
            @RequestParam(defaultValue = "1") @Min(1) int pageNum,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Long deptId) {
        return Result.ok(userService.listUsers(pageNum, pageSize, username, deptId));
    }

    /** 人员选择：分页查询，支持 keyword 模糊搜索和部门筛选 */
    @GetMapping("/lookup")
    public Result<IPage<UserLookupDTO>> lookupUsers(
            @RequestParam(defaultValue = "1") @Min(1) int pageNum,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long deptId) {
        return Result.ok(userService.lookupUsers(keyword, deptId, pageNum, pageSize));
    }

    @PutMapping("/{id}")
    public Result<Void> updateUser(@PathVariable Long id,
                                   @Valid @RequestBody UserUpdateDTO dto) {
        userService.updateUser(id, dto);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.ok();
    }

    @PutMapping("/{id}/roles")
    public Result<Void> assignRoles(@PathVariable Long id,
                                    @Valid @RequestBody UserRoleDTO dto) {
        userService.assignRoles(id, dto);
        return Result.ok();
    }

    @GetMapping("/{id}/roles")
    public Result<List<RoleRespDTO>> getRolesByUserId(@PathVariable Long id) {
        return Result.ok(userService.getRolesByUserId(id));
    }

    @PutMapping("/{id}/password")
    public Result<Void> changePassword(@PathVariable Long id,
                                      @Valid @RequestBody UserPasswordDTO dto) {
        userService.changePassword(id, dto);
        return Result.ok();
    }
}
