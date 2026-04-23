package com.monbo.bpm.module.department.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.monbo.bpm.common.BusinessException;
import com.monbo.bpm.module.department.dto.DepartmentCreateDTO;
import com.monbo.bpm.module.department.dto.DepartmentRespDTO;
import com.monbo.bpm.module.department.dto.DepartmentUpdateDTO;
import com.monbo.bpm.module.department.dto.DeptUserDTO;
import com.monbo.bpm.module.department.entity.Department;
import com.monbo.bpm.module.department.entity.DepartmentUser;
import com.monbo.bpm.module.department.mapper.DepartmentMapper;
import com.monbo.bpm.module.department.mapper.DepartmentUserMapper;
import com.monbo.bpm.module.department.service.IDepartmentService;
import com.monbo.bpm.module.user.dto.UserRespDTO;
import com.monbo.bpm.module.user.entity.User;
import com.monbo.bpm.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements IDepartmentService {

    private final DepartmentMapper departmentMapper;
    private final DepartmentUserMapper departmentUserMapper;
    private final UserMapper userMapper;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        User user = userMapper.findByUsername(auth.getName());
        return user != null ? user.getId() : null;
    }

    @Override
    @Transactional
    public Long createDepartment(DepartmentCreateDTO dto) {
        long exists = departmentMapper.selectCount(
                new LambdaQueryWrapper<Department>().eq(Department::getDeptCode, dto.getDeptCode()));
        if (exists > 0) {
            throw BusinessException.bad("部门编码已存在");
        }
        // 校验父部门存在性
        Long parentId = dto.getParentId() != null ? dto.getParentId() : 0L;
        if (parentId != 0 && departmentMapper.selectById(parentId) == null) {
            throw BusinessException.bad("父部门不存在");
        }

        Long operatorId = getCurrentUserId();
        Department dept = new Department();
        dept.setDeptName(dto.getDeptName());
        dept.setDeptCode(dto.getDeptCode());
        dept.setParentId(parentId);
        dept.setLeader(dto.getLeader());
        dept.setPhone(dto.getPhone());
        dept.setEmail(dto.getEmail());
        dept.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        dept.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        dept.setCreatedBy(operatorId);
        dept.setCreatedTime(LocalDateTime.now());
        departmentMapper.insert(dept);
        log.info("创建部门 id={} code={}", dept.getId(), dept.getDeptCode());
        return dept.getId();
    }

    @Override
    @Transactional
    public boolean updateDepartment(Long id, DepartmentUpdateDTO dto) {
        Department dept = departmentMapper.selectById(id);
        if (dept == null) {
            throw BusinessException.notFound("部门不存在");
        }
        String deptName = dto.getDeptName();
        if (deptName == null || deptName.isBlank()) {
            throw BusinessException.bad("部门名称不能为空");
        }
        dept.setDeptName(deptName);
        if (dto.getLeader() != null) {
            dept.setLeader(dto.getLeader());
        }
        if (dto.getPhone() != null) {
            dept.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null) {
            dept.setEmail(dto.getEmail());
        }
        if (dto.getSortOrder() != null) {
            dept.setSortOrder(dto.getSortOrder());
        }
        if (dto.getStatus() != null) {
            dept.setStatus(dto.getStatus());
        }
        dept.setUpdatedBy(getCurrentUserId());
        dept.setUpdatedTime(LocalDateTime.now());
        return departmentMapper.updateById(dept) > 0;
    }

    @Override
    @Transactional
    public boolean deleteDepartment(Long id) {
        Department dept = departmentMapper.selectById(id);
        if (dept == null) {
            throw BusinessException.notFound("部门不存在");
        }
        // 检查是否有子部门
        long childCount = departmentMapper.selectCount(
                new LambdaQueryWrapper<Department>().eq(Department::getParentId, id));
        if (childCount > 0) {
            throw BusinessException.bad("请先删除子部门");
        }
        departmentUserMapper.deleteByDeptId(id);
        departmentMapper.deleteById(id);
        log.info("删除部门 id={}", id);
        return true;
    }

    @Override
    public DepartmentRespDTO getDepartmentById(Long id) {
        Department dept = departmentMapper.selectById(id);
        if (dept == null) {
            throw BusinessException.notFound("部门不存在");
        }
        return toRespDTO(dept);
    }

    @Override
    public List<DepartmentRespDTO> listDepartments() {
        List<Department> all = departmentMapper.selectList(
                new LambdaQueryWrapper<Department>().orderByAsc(Department::getSortOrder));
        return buildTree(all);
    }

    @Override
    @Transactional
    public void assignUsersToDepartment(Long deptId, List<Long> userIds) {
        if (departmentMapper.selectById(deptId) == null) {
            throw BusinessException.notFound("部门不存在");
        }
        departmentUserMapper.deleteByDeptId(deptId);

        if (userIds != null && !userIds.isEmpty()) {
            // 去重防止重复插入
            List<Long> distinctIds = userIds.stream().distinct().collect(Collectors.toList());
            // 验证用户存在性（批量查询）
            List<User> existingUsers = userMapper.selectBatchIds(distinctIds);
            if (existingUsers.size() != distinctIds.size()) {
                throw BusinessException.bad("部分用户不存在");
            }
            Long operatorId = getCurrentUserId();
            LocalDateTime now = LocalDateTime.now();
            for (Long userId : distinctIds) {
                DepartmentUser du = new DepartmentUser();
                du.setDeptId(deptId);
                du.setUserId(userId);
                du.setCreatedBy(operatorId);
                du.setCreatedTime(now);
                departmentUserMapper.insert(du);
            }
        }
        log.info("部门 id={} 分配用户 userIds={}", deptId, userIds);
    }

    @Override
    public List<UserRespDTO> getUsersByDepartmentId(Long deptId) {
        if (departmentMapper.selectById(deptId) == null) {
            throw BusinessException.notFound("部门不存在");
        }
        List<Long> userIds = departmentMapper.selectUserIdsByDeptId(deptId);
        if (userIds.isEmpty()) {
            return Collections.emptyList();
        }
        // 批量查询替代 N 次 selectById
        List<User> users = userMapper.selectBatchIds(userIds);
        return users.stream()
                .filter(u -> u != null)
                .map(u -> {
                    UserRespDTO dto = new UserRespDTO();
                    dto.setId(u.getId());
                    dto.setUsername(u.getUsername());
                    dto.setRealName(u.getRealName());
                    dto.setEmail(u.getEmail());
                    dto.setPhone(u.getPhone());
                    dto.setStatus(u.getStatus());
                    dto.setCreatedTime(u.getCreatedTime());
                    dto.setUpdatedTime(u.getUpdatedTime());
                    dto.setRoleIds(Collections.emptyList());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<DepartmentRespDTO> getDepartmentsByUserId(Long userId) {
        if (userMapper.selectById(userId) == null) {
            throw BusinessException.notFound("用户不存在");
        }
        List<Long> deptIds = departmentUserMapper.selectDeptIdsByUserId(userId);
        if (deptIds.isEmpty()) {
            return Collections.emptyList();
        }
        // 批量查询替代 N 次 selectById
        List<Department> depts = departmentMapper.selectBatchIds(deptIds);
        return depts.stream()
                .filter(d -> d != null)
                .map(this::toRespDTO)
                .collect(Collectors.toList());
    }

    private List<DepartmentRespDTO> buildTree(List<Department> all) {
        Map<Long, List<Department>> childrenMap = all.stream()
                .filter(d -> d.getParentId() != null && d.getParentId() != 0)
                .collect(Collectors.groupingBy(Department::getParentId));

        List<Department> roots = all.stream()
                .filter(d -> d.getParentId() == null || d.getParentId() == 0)
                .collect(Collectors.toList());

        return roots.stream().map(root -> toTreeNode(root, childrenMap)).collect(Collectors.toList());
    }

    private DepartmentRespDTO toTreeNode(Department dept, Map<Long, List<Department>> childrenMap) {
        DepartmentRespDTO dto = toRespDTO(dept);
        List<Department> children = childrenMap.get(dept.getId());
        if (children != null && !children.isEmpty()) {
            dto.setChildren(children.stream()
                    .map(c -> toTreeNode(c, childrenMap))
                    .collect(Collectors.toList()));
        } else {
            dto.setChildren(Collections.emptyList());
        }
        return dto;
    }

    private DepartmentRespDTO toRespDTO(Department dept) {
        DepartmentRespDTO dto = new DepartmentRespDTO();
        dto.setId(dept.getId());
        dto.setParentId(dept.getParentId());
        dto.setDeptName(dept.getDeptName());
        dto.setDeptCode(dept.getDeptCode());
        dto.setLeader(dept.getLeader());
        dto.setPhone(dept.getPhone());
        dto.setEmail(dept.getEmail());
        dto.setSortOrder(dept.getSortOrder());
        dto.setStatus(dept.getStatus());
        dto.setCreatedTime(dept.getCreatedTime());
        dto.setUpdatedTime(dept.getUpdatedTime());
        return dto;
    }
}
