# Gemini 记忆

本文件用于记录项目相关信息，以便 Gemini 提供更精准的帮助。

## 技术栈

- **后端:** .NET Core, Furion, MySQL, BCrypt.Net-Next
- **前端:** Next.js (React), Material-UI (MUI), Axios

## 架构

- **后端:** 采用分层设计，包含 Controller, Service, 和 Entity 层。
- **前端:** 基于组件的架构，使用 React Context 进行状态管理。

## 数据模型

- **User:** 用户信息 (包含密码哈希)
- **Activity:** 活动/运动项目
- **WorkoutLog:** 锻炼日志 (关联多个 WorkoutSet)
- **TrainingEnvironment:** 训练环境
- **Equipment:** 器材 (包含 `Name`, `Type`, `Weight`)
- **EnvironmentEquipment:** 环境与器材的关联 (多对多)
- **WorkoutSet:** 训练组详情

## API 接口

- **Users:**
    - `POST /register`: 用户注册
    - `POST /login`: 用户登录
- **TrainingEnvironments:**
    - `GET /user/{userId}`: 获取指定用户的所有环境
    - `GET /{id}`: 获取单个环境的详细信息
    - `POST /`: 创建新环境 (可关联设备)
    - `PUT /{id}`: 更新环境
    - `DELETE /{id}`: 删除环境
- **Equipments:**
    - `GET /`: 获取所有设备列表
    - `POST /`: 创建新设备
    - `PUT /{id}`: 更新设备
    - `DELETE /{id}`: 删除设备
- **WorkoutLogs:**
    - `GET /user/{userId}`: 获取指定用户的训练日志
    - `POST /workoutlogs/generate`: 根据训练环境ID生成AI训练计划

## 前端页面设计 (移动端优先)

- **UI/UX:**
    - **主题:** 全局暗色主题 (Dark Mode)。
    - **语言:** 界面文本全部中文化。
    - **布局:** 使用卡片、悬浮按钮等现代 App 设计元素。
- **认证流程:**
    - `/`: 提供游客自动登录功能。
    - `AuthContext`: 全局管理用户登录状态和用户信息。
- **主导航 (BottomNav):**
    - `/home`: 显示欢迎信息。
    - `/training`: 展示历史训练记录列表。
    - `/locations`: 训练环境列表。
    - `/locations/[id]`: 单个训练环境的管理页面，可管理该环境下的器材。
    - `/profile`: 提供登出和关于页面。
- **核心组件:**
    - `AddEnvironmentDialog.tsx`: 添加新环境的弹窗。
    - `EquipmentDialog.tsx`: 添加/编辑器材的弹窗。


## 项目功能

- **训练环境管理:**
    - 用户可以创建、查看、删除自己的训练环境。
    - 创建环境时，可以从一个预设的设备列表中，选择该环境所拥有的设备。
- **器材管理:**
    - 在指定的环境管理页面中，用户可以对该环境的器材进行增、删、改、查。
    - 器材信息包括名称、类型和重量。
- **AI生成训练计划 (后端完成)**: 用户选择训练环境后，由AI根据可用器材智能生成训练计划
- **训练记录**: 
    - 创建和查看包含多个训练项目的详细训练日志
    - 从后端获取数据并填充
    - 修复了后端返回数据不包含`WorkoutSets`的问题

## 备注
- **编码需要添加中文注释**
