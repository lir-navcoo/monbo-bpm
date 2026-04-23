package com.monbo.bpm.module.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.monbo.bpm.common.BusinessException;
import com.monbo.bpm.module.auth.dto.RegisterDTO;
import com.monbo.bpm.module.user.dto.UserCreateDTO;
import com.monbo.bpm.module.user.dto.UserPasswordDTO;
import com.monbo.bpm.module.user.dto.UserRespDTO;
import com.monbo.bpm.module.user.dto.UserRoleDTO;
import com.monbo.bpm.module.user.dto.UserUpdateDTO;
import com.monbo.bpm.module.user.entity.User;
import com.monbo.bpm.module.user.entity.UserRole;
import com.monbo.bpm.module.user.mapper.UserRoleMapper;
import com.monbo.bpm.module.user.mapper.UserMapper;
import com.monbo.bpm.module.user.service.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final com.monbo.bpm.module.role.mapper.RoleMapper roleMapper;
    private final com.monbo.bpm.module.department.mapper.DepartmentMapper departmentMapper;
    private final com.monbo.bpm.module.department.mapper.DepartmentUserMapper departmentUserMapper;
    private final PasswordEncoder passwordEncoder;

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
    public void register(RegisterDTO dto) {
        long exists = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, dto.getUsername()));
        if (exists > 0) {
            throw BusinessException.bad("用户名已存在");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRealName(dto.getRealName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setStatus(1);
        user.setCreatedTime(LocalDateTime.now());
        userMapper.insert(user);

        log.info("注册用户 id={} username={}", user.getId(), user.getUsername());
    }

    @Override
    @Transactional
    public Long createUser(UserCreateDTO dto) {
        long exists = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, dto.getUsername()));
        if (exists > 0) {
            throw BusinessException.bad("用户名已存在");
        }

        Long operatorId = getCurrentUserId();
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRealName(dto.getRealName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setDeptId(dto.getDeptId());
        user.setStatus(1);
        user.setCreatedBy(operatorId);
        user.setCreatedTime(LocalDateTime.now());
        userMapper.insert(user);

        log.info("创建用户 id={} username={}", user.getId(), user.getUsername());
        return user.getId();
    }

    @Override
    @Transactional
    public void updateUser(Long id, UserUpdateDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw BusinessException.notFound("用户不存在");
        }
        if (dto.getRealName() != null) {
            user.setRealName(dto.getRealName());
        }
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getDeptId() != null) {
            user.setDeptId(dto.getDeptId());
        }
        if (dto.getStatus() != null) {
            user.setStatus(dto.getStatus());
        }
        user.setUpdatedBy(getCurrentUserId());
        user.setUpdatedTime(LocalDateTime.now());
        userMapper.updateById(user);
        log.info("更新用户 id={}", id);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (userMapper.selectById(id) == null) {
            throw BusinessException.notFound("用户不存在");
        }
        userRoleMapper.deleteByUserId(id);
        departmentUserMapper.deleteByUserId(id);
        userMapper.deleteById(id);
        log.info("删除用户 id={}，清理角色和部门关联", id);
    }

    @Override
    public UserRespDTO getUserById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw BusinessException.notFound("用户不存在");
        }
        UserRespDTO dto = convertToRespDTO(user, null);
        if (user.getDeptId() != null) {
            com.monbo.bpm.module.department.entity.Department dept = departmentMapper.selectById(user.getDeptId());
            if (dept != null) {
                dto.setDeptName(dept.getDeptName());
            }
        }
        return dto;
    }

    @Override
    public UserRespDTO getUserByUsername(String username) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            throw BusinessException.notFound("用户不存在");
        }
        return convertToRespDTO(user, null);
    }

    @Override
    public IPage<UserRespDTO> listUsers(int pageNum, int pageSize, String username, Long deptId) {
        if (pageSize > 100) {
            pageSize = 100;
        }

        // 递归获取所有子部门ID（用于过滤）
        List<Long> filterDeptIds = Collections.emptyList();
        if (deptId != null) {
            filterDeptIds = getAllSubDepartmentIds(deptId);
        }

        Page<User> page = new Page<>(pageNum, pageSize);
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User> wrapper =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        if (username != null && !username.isEmpty()) {
            wrapper.like("username", username);
        }
        if (!filterDeptIds.isEmpty()) {
            wrapper.in("dept_id", filterDeptIds);
        }
        wrapper.orderByDesc("created_time");
        userMapper.selectPage(page, wrapper);

        if (page.getRecords().isEmpty()) {
            return page.convert(u -> convertToRespDTO(u, Collections.emptyList()));
        }

        // 批量查询所有用户角色（1次查询替代 N 次）
        List<Long> userIds = page.getRecords().stream().map(User::getId).collect(Collectors.toList());
        Map<Long, List<Long>> roleMap = userRoleMapper.selectUserRolePairs(userIds).stream()
                .collect(Collectors.toMap(
                        m -> ((Number) m.get("user_id")).longValue(),
                        m -> {
                            Object roleIdObj = m.get("role_id");
                            if (roleIdObj == null) {
                                return Collections.<Long>emptyList();
                            }
                            return Collections.singletonList(((Number) roleIdObj).longValue());
                        },
                        (existing, replacement) -> {
                            // 合并同用户的多个角色
                            java.util.List<Long> merged = new java.util.ArrayList<>(existing);
                            merged.addAll(replacement);
                            return merged;
                        }
                ));

        // 批量查询部门信息（1次查询替代 N 次）
        List<Long> deptIds = page.getRecords().stream()
                .map(User::getDeptId)
                .filter(d -> d != null)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> deptNameMap = deptIds.isEmpty() ? Collections.emptyMap() :
                departmentMapper.selectBatchIds(deptIds).stream()
                        .collect(Collectors.toMap(
                                com.monbo.bpm.module.department.entity.Department::getId,
                                com.monbo.bpm.module.department.entity.Department::getDeptName,
                                (a, b) -> a
                        ));

        final Map<Long, String> finalDeptNameMap = deptNameMap;
        return page.convert(u -> {
            UserRespDTO dto = convertToRespDTO(u, roleMap.getOrDefault(u.getId(), Collections.emptyList()));
            if (u.getDeptId() != null) {
                dto.setDeptName(finalDeptNameMap.get(u.getDeptId()));
            }
            return dto;
        });
    }

    @Override
    @Transactional
    public void assignRoles(Long id, UserRoleDTO dto) {
        if (userMapper.selectById(id) == null) {
            throw BusinessException.notFound("用户不存在");
        }
        userRoleMapper.deleteByUserId(id);

        if (dto.getRoleIds() != null && !dto.getRoleIds().isEmpty()) {
            // 去重防止重复插入
            List<Long> distinctRoleIds = dto.getRoleIds().stream().distinct().collect(Collectors.toList());
            // 验证角色存在性（批量查询）
            List<com.monbo.bpm.module.role.entity.Role> existingRoles = roleMapper.selectBatchIds(distinctRoleIds);
            if (existingRoles.size() != distinctRoleIds.size()) {
                throw BusinessException.bad("部分角色不存在");
            }
            Long operatorId = getCurrentUserId();
            LocalDateTime now = LocalDateTime.now();
            for (Long roleId : distinctRoleIds) {
                UserRole ur = new UserRole();
                ur.setUserId(id);
                ur.setRoleId(roleId);
                ur.setCreatedBy(operatorId);
                ur.setCreatedTime(now);
                userRoleMapper.insert(ur);
            }
        }
        log.info("用户 id={} 分配角色 roleIds={}", id, dto.getRoleIds());
    }

    @Override
    @Transactional
    public void changePassword(Long id, UserPasswordDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw BusinessException.notFound("用户不存在");
        }
        if (dto.getOldPassword() == null || dto.getOldPassword().isEmpty()) {
            throw BusinessException.bad("旧密码不能为空");
        }
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw BusinessException.bad("旧密码不正确");
        }
        String newPwd = dto.getNewPassword();
        if (newPwd == null || newPwd.isEmpty()) {
            throw BusinessException.bad("新密码不能为空");
        }
        if (passwordEncoder.matches(newPwd, user.getPassword())) {
            throw BusinessException.bad("新密码不能与旧密码相同");
        }
        user.setPassword(passwordEncoder.encode(newPwd));
        user.setUpdatedBy(getCurrentUserId());
        user.setUpdatedTime(LocalDateTime.now());
        userMapper.updateById(user);
        log.info("用户 id={} 修改密码", id);
    }

    @Override
    public List<com.monbo.bpm.module.role.dto.RoleRespDTO> getRolesByUserId(Long userId) {
        if (userMapper.selectById(userId) == null) {
            throw BusinessException.notFound("用户不存在");
        }
        List<Long> roleIds = userRoleMapper.selectRoleIdsByUserId(userId);
        if (roleIds.isEmpty()) {
            return Collections.emptyList();
        }
        // 批量查询替代 N 次 selectById
        List<com.monbo.bpm.module.role.entity.Role> roles = roleMapper.selectBatchIds(roleIds);
        return roles.stream()
                .filter(r -> r != null)
                .map(r -> {
                    com.monbo.bpm.module.role.dto.RoleRespDTO dto = new com.monbo.bpm.module.role.dto.RoleRespDTO();
                    dto.setId(r.getId());
                    dto.setRoleCode(r.getRoleCode());
                    dto.setRoleName(r.getRoleName());
                    dto.setDescription(r.getDescription());
                    dto.setStatus(r.getStatus());
                    dto.setCreatedTime(r.getCreatedTime());
                    dto.setUpdatedTime(r.getUpdatedTime());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private UserRespDTO convertToRespDTO(User user, List<Long> roleIds) {
        UserRespDTO dto = new UserRespDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRealName(user.getRealName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setDeptId(user.getDeptId());
        dto.setStatus(user.getStatus());
        dto.setRoleIds(roleIds != null ? roleIds : userRoleMapper.selectRoleIdsByUserId(user.getId()));
        dto.setCreatedTime(user.getCreatedTime());
        dto.setUpdatedTime(user.getUpdatedTime());
        return dto;
    }

    /**
     * 递归获取所有子部门ID（包含传入的部门ID本身）
     */
    private List<Long> getAllSubDepartmentIds(Long parentId) {
        List<Long> result = new java.util.ArrayList<>();
        result.add(parentId);
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.monbo.bpm.module.department.entity.Department> wrapper =
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        wrapper.eq(com.monbo.bpm.module.department.entity.Department::getParentId, parentId);
        List<com.monbo.bpm.module.department.entity.Department> children = departmentMapper.selectList(wrapper);
        for (com.monbo.bpm.module.department.entity.Department child : children) {
            result.addAll(getAllSubDepartmentIds(child.getId()));
        }
        return result;
    }

    @Override
    public com.baomidou.mybatisplus.core.metadata.IPage<com.monbo.bpm.module.user.dto.UserLookupDTO> lookupUsers(
            String keyword, Long deptId, int pageNum, int pageSize) {
        if (pageSize > 100) {
            pageSize = 100;
        }

        // 递归获取所有子部门ID（用于过滤）
        List<Long> filterDeptIds = java.util.Collections.emptyList();
        if (deptId != null) {
            filterDeptIds = getAllSubDepartmentIds(deptId);
        }

        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User> wrapper =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            // 同时模糊匹配 username 和 realName
            wrapper.and(w -> w
                    .like("username", keyword)
                    .or()
                    .like("real_name", keyword));
        }
        if (!filterDeptIds.isEmpty()) {
            wrapper.in("dept_id", filterDeptIds);
        }
        wrapper.orderByDesc("created_time");

        com.baomidou.mybatisplus.extension.plugins.pagination.Page<User> page =
                new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNum, pageSize);
        userMapper.selectPage(page, wrapper);

        if (page.getRecords().isEmpty()) {
            return page.convert(u -> {
                com.monbo.bpm.module.user.dto.UserLookupDTO dto = new com.monbo.bpm.module.user.dto.UserLookupDTO();
                dto.setId(u.getId());
                dto.setUsername(u.getUsername());
                dto.setRealName(u.getRealName());
                dto.setDeptId(u.getDeptId());
                return dto;
            });
        }

        // 批量查询部门名称
        List<Long> deptIds = page.getRecords().stream()
                .map(User::getDeptId)
                .filter(d -> d != null)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
        java.util.Map<Long, String> deptNameMap = deptIds.isEmpty() ? java.util.Collections.emptyMap() :
                departmentMapper.selectBatchIds(deptIds).stream()
                        .collect(java.util.stream.Collectors.toMap(
                                com.monbo.bpm.module.department.entity.Department::getId,
                                com.monbo.bpm.module.department.entity.Department::getDeptName,
                                (a, b) -> a
                        ));

        final java.util.Map<Long, String> finalDeptNameMap = deptNameMap;
        return page.convert(u -> {
            com.monbo.bpm.module.user.dto.UserLookupDTO dto = new com.monbo.bpm.module.user.dto.UserLookupDTO();
            dto.setId(u.getId());
            dto.setUsername(u.getUsername());
            dto.setRealName(u.getRealName());
            dto.setDeptId(u.getDeptId());
            if (u.getDeptId() != null) {
                dto.setDeptName(finalDeptNameMap.get(u.getDeptId()));
            }
            return dto;
        });
    }
}
