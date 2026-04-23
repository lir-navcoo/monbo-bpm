package com.monbo.bpm.module.process.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.monbo.bpm.module.process.entity.ProcessDef;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ProcessDefMapper extends BaseMapper<ProcessDef> {

    @Select("SELECT ID_ FROM ACT_RE_PROCDEF WHERE KEY_ = #{key} AND VERSION_ = #{version} LIMIT 1")
    String selectCamundaProcDefIdByKeyAndVersion(String key, Integer version);
}
