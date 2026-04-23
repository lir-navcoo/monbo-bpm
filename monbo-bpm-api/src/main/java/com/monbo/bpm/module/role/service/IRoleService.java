package com.monbo.bpm.module.role.service;

import com.monbo.bpm.module.role.dto.RoleCreateDTO;
import com.monbo.bpm.module.role.dto.RoleRespDTO;
import com.monbo.bpm.module.role.dto.RoleUpdateDTO;
import com.monbo.bpm.module.user.dto.UserRespDTO;

import java.util.List;

public interface IRoleService {

    Long createRole(RoleCreateDTO dto);

    boolean updateRole(Long id, RoleUpdateDTO dto);

    boolean deleteRole(Long id);

    RoleRespDTO getRoleById(Long id);

    List<RoleRespDTO> listRoles();

    void assignUsersToRole(Long roleId, List<Long> userIds);

    List<UserRespDTO> getUsersByRoleId(Long roleId);
}
