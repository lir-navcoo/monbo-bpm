package com.monbo.bpm.module.department.service;

import com.monbo.bpm.module.department.dto.DepartmentCreateDTO;
import com.monbo.bpm.module.department.dto.DepartmentRespDTO;
import com.monbo.bpm.module.department.dto.DepartmentUpdateDTO;
import com.monbo.bpm.module.department.dto.DeptUserDTO;
import com.monbo.bpm.module.user.dto.UserRespDTO;

import java.util.List;

public interface IDepartmentService {

    Long createDepartment(DepartmentCreateDTO dto);

    boolean updateDepartment(Long id, DepartmentUpdateDTO dto);

    boolean deleteDepartment(Long id);

    DepartmentRespDTO getDepartmentById(Long id);

    List<DepartmentRespDTO> listDepartments();

    void assignUsersToDepartment(Long deptId, List<Long> userIds);

    List<UserRespDTO> getUsersByDepartmentId(Long deptId);

    List<DepartmentRespDTO> getDepartmentsByUserId(Long userId);
}
