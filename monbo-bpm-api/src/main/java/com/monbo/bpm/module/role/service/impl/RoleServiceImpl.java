package com.monbo.bpm.module.role.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.monbo.bpm.common.BusinessException;
import com.monbo.bpm.module.role.dto.RoleCreateDTO;
import com.monbo.bpm.module.role.dto.RoleRespDTO;
import com.monbo.bpm.module.role.dto.RoleUpdateDTO;
import com.monbo.bpm.module.role.entity.Role;
import com.monbo.bpm.module.role.mapper.RoleMapper;
import com.monbo.bpm.module.role.service.IRoleService;
import com.monbo.bpm.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements IRoleService {

    private final RoleMapper roleMapper;
    private final com.monbo.bpm.module.user.mapper.UserMapper userMapper;
    private final com.monbo.bpm.module.user.mapper.UserRoleMapper userRoleMapper;

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
    public Long createRole(RoleCreateDTO dto) {
        long exists = roleMapper.selectCount(
                new LambdaQueryWrapper<Role>().eq(Role::getRoleCode, dto.getRoleCode()));
        if (exists > 0) {
            throw BusinessException.bad("角色编码已存在");
        }

        Long operatorId = getCurrentUserId();
        Role role = new Role();
        role.setRoleName(dto.getRoleName());
        role.setRoleCode(dto.getRoleCode());
        role.setDescription(dto.getDescription());
        role.setStatus(1);
        role.setCreatedBy(operatorId);
        role.setCreatedTime(LocalDateTime.now());
        roleMapper.insert(role);
        log.info("创建角色 id={} code={}", role.getId(), role.getRoleCode());
        return role.getId();
    }

    @Override
    @Transactional
    public boolean updateRole(Long id, RoleUpdateDTO dto) {
        Role role = roleMapper.selectById(id);
        if (role == null) {
            throw BusinessException.notFound("角色不存在");
        }
        if (dto.getRoleCode() != null && !dto.getRoleCode().isEmpty()) {
            if (!dto.getRoleCode().equals(role.getRoleCode())) {
                long exists = roleMapper.selectCount(
                        new LambdaQueryWrapper<Role>().eq(Role::getRoleCode, dto.getRoleCode()));
                if (exists > 0) {
                    throw BusinessException.bad("角色编码已存在");
                }
            }
            role.setRoleCode(dto.getRoleCode());
        }
        if (dto.getRoleName() != null && !dto.getRoleName().isEmpty()) {
            role.setRoleName(dto.getRoleName());
        }
        if (dto.getDescription() != null) {
            role.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            role.setStatus(dto.getStatus());
        }
        role.setUpdatedBy(getCurrentUserId());
        role.setUpdatedTime(LocalDateTime.now());
        return roleMapper.updateById(role) > 0;
    }

    @Override
    @Transactional
    public boolean deleteRole(Long id) {
        if (roleMapper.selectById(id) == null) {
            throw BusinessException.notFound("角色不存在");
        }
        userRoleMapper.deleteByRoleId(id);
        roleMapper.deleteById(id);
        log.info("删除角色 id={}", id);
        return true;
    }

    @Override
    public RoleRespDTO getRoleById(Long id) {
        Role role = roleMapper.selectById(id);
        if (role == null) {
            throw BusinessException.notFound("角色不存在");
        }
        return toRespDTO(role);
    }

    @Override
    public List<RoleRespDTO> listRoles() {
        return roleMapper.selectList(null).stream()
                .map(this::toRespDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void assignUsersToRole(Long roleId, List<Long> userIds) {
        if (roleMapper.selectById(roleId) == null) {
            throw BusinessException.notFound("角色不存在");
        }
        userRoleMapper.deleteByRoleId(roleId);

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
                com.monbo.bpm.module.user.entity.UserRole ur = new com.monbo.bpm.module.user.entity.UserRole();
                ur.setUserId(userId);
                ur.setRoleId(roleId);
                ur.setCreatedBy(operatorId);
                ur.setCreatedTime(now);
                userRoleMapper.insert(ur);
            }
        }
        log.info("角色 id={} 分配用户 userIds={}", roleId, userIds);
    }

    @Override
    public List<com.monbo.bpm.module.user.dto.UserRespDTO> getUsersByRoleId(Long roleId) {
        if (roleMapper.selectById(roleId) == null) {
            throw BusinessException.notFound("角色不存在");
        }
        List<Long> userIds = userRoleMapper.selectUserIdsByRoleId(roleId);
        if (userIds.isEmpty()) {
            return Collections.emptyList();
        }
        // 批量查询替代 N 次 selectById
        List<User> users = userMapper.selectBatchIds(userIds);
        return users.stream()
                .filter(u -> u != null)
                .map(u -> {
                    com.monbo.bpm.module.user.dto.UserRespDTO dto = new com.monbo.bpm.module.user.dto.UserRespDTO();
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

    private RoleRespDTO toRespDTO(Role role) {
        RoleRespDTO dto = new RoleRespDTO();
        dto.setId(role.getId());
        dto.setRoleName(role.getRoleName());
        dto.setRoleCode(role.getRoleCode());
        dto.setDescription(role.getDescription());
        dto.setStatus(role.getStatus());
        dto.setCreatedTime(role.getCreatedTime());
        dto.setUpdatedTime(role.getUpdatedTime());
        return dto;
    }
}
