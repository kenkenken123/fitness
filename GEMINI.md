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
- **Equipment:** 器材
- **EnvironmentEquipment:** 环境与器材的关联 (多对多)
- **WorkoutSet:** 训练组详情

## API 接口

- **Users:**
    - `POST /register`: 用户注册
    - `POST /login`: 用户登录
- **TrainingEnvironments:**
    - `GET /`: 获取所有环境
    - `POST /`: 创建新环境
    - `PUT /{id}`: 更新环境
    - `DELETE /{id}`: 删除环境
- **WorkoutLogs:**
    - `GET /user/{userId}`: 获取指定用户的训练日志
    - `POST /`: 创建新的训练日志 (包含多个训练组)

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
    - `/locations`: 训练地址的增删改查。
    - `/profile`: 提供登出和关于页面。

## 项目功能

（在此处添加项目功能描述）
