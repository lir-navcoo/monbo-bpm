-- monbo-bpm 数据库建表脚本
-- 执行方式: mysql -u root -p root123456 < init.sql

CREATE DATABASE IF NOT EXISTS monbo_bpm DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE monbo_bpm;

-- 用户表
CREATE TABLE IF NOT EXISTS mb_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt加密密码',
    real_name VARCHAR(128) COMMENT '真实姓名',
    email VARCHAR(128) COMMENT '邮箱',
    phone VARCHAR(32) COMMENT '手机号',
    dept_id BIGINT COMMENT '部门ID',
    status TINYINT DEFAULT 1 COMMENT '1:启用 0:禁用',
    created_by BIGINT COMMENT '创建人ID',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT COMMENT '更新人ID',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS mb_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(64) NOT NULL UNIQUE COMMENT '角色代码',
    role_name VARCHAR(128) NOT NULL COMMENT '角色名称',
    description VARCHAR(512) COMMENT '描述',
    status TINYINT DEFAULT 1 COMMENT '1:启用 0:禁用',
    created_by BIGINT COMMENT '创建人ID',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT COMMENT '更新人ID',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
    INDEX idx_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS mb_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    created_by BIGINT COMMENT '创建人ID',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 流程定义扩展表（Phase 2）
CREATE TABLE IF NOT EXISTS mb_process_def (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    process_key VARCHAR(128) NOT NULL COMMENT '流程标识',
    process_name VARCHAR(256) NOT NULL COMMENT '流程名称',
    description VARCHAR(1024) COMMENT '流程描述',
    category VARCHAR(128) COMMENT '分类',
    version INT DEFAULT 1 COMMENT '版本号',
    bpmn_xml LONGTEXT COMMENT 'BPMN XML内容',
    svg_xml LONGTEXT COMMENT '流程图SVG',
    status TINYINT DEFAULT 1 COMMENT '1:草稿 2:已部署 3:已下线',
    deployment_id VARCHAR(128) COMMENT 'Camunda部署ID',
    camunda_process_def_id VARCHAR(128) COMMENT 'Camunda流程定义ID（key:version）',
    created_by BIGINT COMMENT '创建人ID',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT COMMENT '更新人ID',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
    UNIQUE KEY uk_process_key_version (process_key, version),
    INDEX idx_process_key (process_key),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程定义表';

-- 部门表
CREATE TABLE IF NOT EXISTS mb_department (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT DEFAULT 0 COMMENT '父部门ID，0表示顶级部门',
    dept_name VARCHAR(128) NOT NULL COMMENT '部门名称',
    dept_code VARCHAR(64) NOT NULL COMMENT '部门编码',
    leader VARCHAR(64) COMMENT '部门负责人',
    phone VARCHAR(32) COMMENT '联系电话',
    email VARCHAR(128) COMMENT '部门邮箱',
    sort_order INT DEFAULT 0 COMMENT '排序号',
    status TINYINT DEFAULT 1 COMMENT '1:启用 0:禁用',
    created_by BIGINT COMMENT '创建人ID',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT COMMENT '更新人ID',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
    UNIQUE KEY uk_dept_code (dept_code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 部门用户关联表
CREATE TABLE IF NOT EXISTS mb_department_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dept_id BIGINT NOT NULL COMMENT '部门ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    created_by BIGINT COMMENT '创建人ID',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_dept_user (dept_id, user_id),
    INDEX idx_dept_id (dept_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门用户关联表';

-- 流程实例表
CREATE TABLE IF NOT EXISTS mb_process_inst (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    process_def_id BIGINT NOT NULL COMMENT '本地流程定义ID',
    camunda_process_inst_id VARCHAR(128) COMMENT 'Camunda流程实例ID',
    business_key VARCHAR(256) COMMENT '业务标识',
    starter_id BIGINT COMMENT '发起人ID',
    status TINYINT DEFAULT 1 COMMENT '1-运行中 2-已完成 3-已取消',
    camunda_process_def_id VARCHAR(128) COMMENT 'Camunda流程定义ID（key:version）',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
    INDEX idx_process_def_id (process_def_id),
    INDEX idx_camunda_inst_id (camunda_process_inst_id),
    INDEX idx_business_key (business_key),
    ended_time DATETIME DEFAULT NULL COMMENT '结束时间',
    INDEX idx_starter_id (starter_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程实例表';
