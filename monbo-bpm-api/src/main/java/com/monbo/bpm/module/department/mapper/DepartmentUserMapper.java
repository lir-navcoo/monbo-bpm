package com.monbo.bpm.module.department.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.monbo.bpm.module.department.entity.DepartmentUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DepartmentUserMapper extends BaseMapper<DepartmentUser> {

    @Select("SELECT dept_id FROM mb_department_user WHERE user_id = #{userId}")
    List<Long> selectDeptIdsByUserId(@Param("userId") Long userId);

    @Select("DELETE FROM mb_department_user WHERE dept_id = #{deptId}")
    void deleteByDeptId(@Param("deptId") Long deptId);

    @Select("DELETE FROM mb_department_user WHERE user_id = #{userId}")
    void deleteByUserId(@Param("userId") Long userId);
}
