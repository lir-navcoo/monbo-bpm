# monbo-bpm

企业级 BPM 流程平台，支持流程设计、部署、执行的全生命周期管理。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Spring Boot 3.2.5 + Java 21 |
| 流程引擎 | Camunda 7.21（嵌入式） |
| ORM | MyBatis-Plus 3.5.6 |
| 数据库 | MySQL |
| 认证 | Spring Security + JWT |
| 前端 | React 18 + TypeScript + React Flow + shadcn/ui |
| 构建 | Maven + Vite |

## 项目结构

```
monbo-bpm/
├── monbo-bpm-api/          # 后端（Spring Boot）
│   └── src/main/java/com/monbo/bpm/
│       ├── module/
│       │   ├── auth/       # 认证（登录/JWT）
│       │   ├── user/       # 用户管理
│       │   ├── role/       # 角色管理
│       │   ├── department/ # 组织架构（树形）
│       │   ├── process/    # 流程定义管理
│       │   ├── instance/   # 流程实例管理
│       │   └── task/       # 任务管理
│       └── common/          # 统一响应/异常处理
├── monbo-bpm-ui/           # 前端（React + React Flow）
│   └── src/
│       └── components/ProcessDesigner/  # 流程设计器
└── scripts/
    └── init.sql            # 数据库初始化
```

## 已完成功能

### 后端 API（monbo-bpm-api）

**认证模块** `/api/auth`
- `POST /login` — 用户登录，返回 JWT
- `POST /register` — 用户注册

**用户模块** `/api/users`
- CRUD + 分页查询 + 角色分配 + 密码修改

**角色模块** `/api/roles`
- CRUD + 角色-用户关联管理

**部门模块** `/api/departments`
- 树形结构 + 用户关联管理

**流程定义模块** `/api/process-defs`
- `POST /` — 创建流程定义
- `GET /` — 列表查询
- `GET /{id}` — 详情
- `PUT /{id}` — 更新
- `DELETE /{id}` — 删除
- `POST /{id}/deploy` — 部署到 Camunda
- `PUT /{id}/suspend` — 挂起
- `PUT /{id}/activate` — 激活
- `POST /{id}/redeploy` — 重新部署

**流程实例模块** `/api/process-insts`
- `POST /` — 发起流程实例
- `GET /my` — 我的发起实例
- `GET /process-def/{id}` — 按流程定义查询
- `GET /{id}` — 查询单个
- `GET /by-key/{businessKey}` — 按业务标识查询
- `PUT /{id}/cancel` — 取消实例

**任务模块** `/api/tasks`
- `GET /my` — 我的待办
- `GET /{taskId}` — 查询单个任务
- `GET /claimable` — 可签收任务（候选池）
- `GET /history` — 历史任务
- `POST /claim` — 签收
- `POST /unclaim` — 退还
- `POST /complete` — 完成任务
- `POST /delegate` — 委托

### 前端（monbo-bpm-ui）

- React Flow 流程设计器画布
- 6 种节点类型：Start、End、UserTask、ScriptTask、ServiceTask、Gateway
- 左侧节点拖拽面板（NodePalette）
- 右侧属性配置面板（Sheet + shadcn/ui）
- Toolbar（导入/导出/撤销/重做/缩放）
- BPMN 边样式（虚线箭头）
- 网关分支配置与边标签联动

## 快速启动

### 前置条件

- JDK 21
- Maven 3.9+
- MySQL 8.0+
- Node.js 18+

### 数据库初始化

```bash
mysql -u root -p < scripts/init.sql
```

### 后端启动

```bash
cd monbo-bpm-api
# 配置数据库密码后启动
DB_PASSWORD=your_password java -jar target/monbo-bpm-api-0.0.1-SNAPSHOT.jar
```

### 前端启动

```bash
cd monbo-bpm-ui
npm install
npm run dev
```

## 开发记录

| 日期 | 内容 |
|------|------|
| 2026-04-21 | 完成 Instance + Task 模块，Camunda 全流程打通（发起→签收→办理→历史查询） |

## License

Private - All rights reserved.
