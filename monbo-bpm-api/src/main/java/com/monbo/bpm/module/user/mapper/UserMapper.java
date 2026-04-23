package com.monbo.bpm.module.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.monbo.bpm.module.user.entity.User;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface UserMapper extends BaseMapper<User> {

    User findByUsername(@Param("username") String username);

    /**
     * 分页查询，XML 中使用 MyBatis-Plus Page 的 current/size 属性进行 LIMIT
     */
    List<User> selectUserPage(Page<User> page, @Param("username") String username);
}
