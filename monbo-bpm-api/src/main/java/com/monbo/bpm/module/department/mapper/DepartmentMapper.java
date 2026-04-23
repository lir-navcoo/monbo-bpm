package com.monbo.bpm.module.department.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.monbo.bpm.module.department.entity.Department;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface DepartmentMapper extends BaseMapper<Department> {

    @Select("SELECT user_id FROM mb_department_user WHERE dept_id = #{deptId}")
    List<Long> selectUserIdsByDeptId(@Param("deptId") Long deptId);

    @Select("<script>" +
            "SELECT dept_id, user_id FROM mb_department_user " +
            "WHERE dept_id IN <foreach collection='deptIds' item='id' open='(' separator=',' close=')'>#{id}</foreach>" +
            "</script>")
    List<java.util.Map<String, Object>> selectDeptUserPairs(@Param("deptIds") List<Long> deptIds);
}
