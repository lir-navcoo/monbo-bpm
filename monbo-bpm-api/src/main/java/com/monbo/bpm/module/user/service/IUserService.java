package com.monbo.bpm.module.user.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.monbo.bpm.module.auth.dto.RegisterDTO;
import com.monbo.bpm.module.user.dto.UserCreateDTO;
import com.monbo.bpm.module.user.dto.UserPasswordDTO;
import com.monbo.bpm.module.user.dto.UserRespDTO;
import com.monbo.bpm.module.user.dto.UserRoleDTO;
import com.monbo.bpm.module.user.dto.UserUpdateDTO;
import com.monbo.bpm.module.role.dto.RoleRespDTO;

import java.util.List;

public interface IUserService {

    void register(RegisterDTO dto);

    Long createUser(UserCreateDTO dto);

    void updateUser(Long id, UserUpdateDTO dto);

    void deleteUser(Long id);

    UserRespDTO getUserById(Long id);

    UserRespDTO getUserByUsername(String username);

    IPage<UserRespDTO> listUsers(int pageNum, int pageSize, String username, Long deptId);

    void assignRoles(Long id, UserRoleDTO dto);

    void changePassword(Long id, UserPasswordDTO dto);

    List<RoleRespDTO> getRolesByUserId(Long userId);

    /**
     * 人员选择：分页查询，支持 keyword 模糊搜索（username/realName）和部门筛选。
     * 返回精简字段，适合选择器使用。
     */
    com.baomidou.mybatisplus.core.metadata.IPage<com.monbo.bpm.module.user.dto.UserLookupDTO> lookupUsers(
            String keyword, Long deptId, int pageNum, int pageSize);
}
