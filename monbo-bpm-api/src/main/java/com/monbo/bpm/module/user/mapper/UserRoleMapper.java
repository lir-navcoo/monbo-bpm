package com.monbo.bpm.module.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.monbo.bpm.module.user.entity.UserRole;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface UserRoleMapper extends BaseMapper<UserRole> {

    @Select("SELECT role_id FROM mb_user_role WHERE user_id = #{userId}")
    List<Long> selectRoleIdsByUserId(@Param("userId") Long userId);

    @Select("SELECT r.role_code FROM mb_user_role ur " +
            "INNER JOIN mb_role r ON r.id = ur.role_id " +
            "INNER JOIN mb_user u ON u.id = ur.user_id " +
            "WHERE u.username = #{username} AND u.deleted = 0 AND r.deleted = 0")
    List<String> selectRoleCodesByUsername(@Param("username") String username);

    /**
     * 批量查询用户角色映射，一次查询返回所有用户ID对应的角色ID列表
     * @param userIds 用户ID列表
     * @return Map: userId -> List<roleId>
     */
    @Select("<script>" +
            "SELECT user_id, role_id FROM mb_user_role " +
            "WHERE user_id IN <foreach collection='userIds' item='id' open='(' separator=',' close=')'>#{id}</foreach>" +
            "</script>")
    List<Map<String, Object>> selectUserRolePairs(@Param("userIds") List<Long> userIds);

    @Select("SELECT user_id FROM mb_user_role WHERE role_id = #{roleId}")
    List<Long> selectUserIdsByRoleId(@Param("roleId") Long roleId);

    @Select("DELETE FROM mb_user_role WHERE role_id = #{roleId}")
    void deleteByRoleId(@Param("roleId") Long roleId);

    @Select("DELETE FROM mb_user_role WHERE user_id = #{userId}")
    void deleteByUserId(@Param("userId") Long userId);
}
