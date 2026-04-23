package com.monbo.bpm.module.department.controller;

import com.monbo.bpm.common.Result;
import com.monbo.bpm.module.department.dto.DepartmentCreateDTO;
import com.monbo.bpm.module.department.dto.DepartmentRespDTO;
import com.monbo.bpm.module.department.dto.DepartmentUpdateDTO;
import com.monbo.bpm.module.department.dto.DeptUserDTO;
import com.monbo.bpm.module.department.service.IDepartmentService;
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
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final IDepartmentService departmentService;

    @PostMapping
    public Result<Long> createDepartment(@Valid @RequestBody DepartmentCreateDTO dto) {
        return Result.ok(departmentService.createDepartment(dto));
    }

    @GetMapping("/{id}")
    public Result<DepartmentRespDTO> getDepartmentById(@PathVariable Long id) {
        return Result.ok(departmentService.getDepartmentById(id));
    }

    @GetMapping
    public Result<List<DepartmentRespDTO>> listDepartments() {
        return Result.ok(departmentService.listDepartments());
    }

    @PutMapping("/{id}")
    public Result<Void> updateDepartment(@PathVariable Long id,
                                       @Valid @RequestBody DepartmentUpdateDTO dto) {
        departmentService.updateDepartment(id, dto);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return Result.ok();
    }

    @PutMapping("/{id}/users")
    public Result<Void> assignUsers(@PathVariable Long id,
                                   @Valid @RequestBody DeptUserDTO dto) {
        departmentService.assignUsersToDepartment(id, dto.getUserIds());
        return Result.ok();
    }

    @GetMapping("/{id}/users")
    public Result<List<UserRespDTO>> getUsersByDepartmentId(@PathVariable Long id) {
        return Result.ok(departmentService.getUsersByDepartmentId(id));
    }

    @GetMapping("/users/{userId}")
    public Result<List<DepartmentRespDTO>> getDepartmentsByUserId(@PathVariable Long userId) {
        return Result.ok(departmentService.getDepartmentsByUserId(userId));
    }
}
