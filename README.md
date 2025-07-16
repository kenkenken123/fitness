# Fitness App

一个用于辅助健身、记录训练的 Web 应用，采用前后端分离架构。

## 🎯 功能特性

### 用户系统
- ✅ 支持游客模式自动注册和登录
- ✅ 用户身份验证和会话管理

### 训练管理
- ✅ **训练记录**: 创建和查看包含多个训练项目的详细训练日志
- ✅ **训练类型**: 支持力量训练、有氧运动、柔韧性训练等多种类型
- ✅ **训练统计**: 实时统计卡路里消耗、训练时长、完成次数
- ✅ **训练历史**: 查看和管理历史训练记录
- - ✅ **AI生成训练计划 (后端完成)**: 用户选择训练环境后，由AI根据可用器材智能生成训练计划

### 环境管理
- ✅ **训练环境**: 管理训练场所（健身房、家庭、户外等）
- ✅ **器材管理**: 为每个训练环境配置和管理健身器材
- ✅ **器材类型**: 内置20+常见健身器材类型，支持下拉选择

### 仪表盘功能
- ✅ **今日统计**: 实时显示今日训练次数、卡路里消耗、训练时长、连续天数
- ✅ **周目标**: 可视化周训练目标进度
- ✅ **最近训练**: 显示最近5次训练记录
- ✅ **成就系统**: 展示用户获得的训练成就徽章

### 现代化UI
- ✅ **响应式设计**: 移动优先的App风格界面
- ✅ **渐变主题**: 美观的渐变色彩设计
- ✅ **卡片布局**: 清晰的卡片式信息展示
- ✅ **交互动画**: 平滑的过渡和悬停效果

## 🏗️ 技术栈

### 后端
- **框架**: .NET Core 8.0 + Furion
- **数据库**: MySQL
- **ORM**: Entity Framework Core
- **API**: RESTful API设计
- **认证**: JWT身份验证

### 前端
- **框架**: Next.js 14 (React 18)
- **UI库**: Tailwind CSS + Material-UI组件
- **状态管理**: React Context
- **HTTP客户端**: Axios
- **图标**: Lucide React

## 📊 API接口

### 训练相关API
- `GET /api/workouts/users/{userId}/dashboard` - 获取用户仪表盘数据
- `GET /api/workouts/recent?userId={id}&limit={n}` - 获取最近训练记录
- `GET /api/workouts/user/{userId}` - 获取用户所有训练记录
- `POST /api/workouts` - 创建新的训练记录
- `PUT /api/workouts/{id}` - 更新训练记录
- `DELETE /api/workouts/{id}` - 删除训练记录

### 环境管理API
- `GET /api/trainingEnvironments/user/{userId}` - 获取用户训练环境
- `POST /api/trainingEnvironments` - 创建训练环境
- `PUT /api/trainingEnvironments/{id}` - 更新训练环境
- `DELETE /api/trainingEnvironments/{id}` - 删除训练环境

### 器材管理API
- `GET /api/equipments` - 获取所有器材
- `POST /api/equipments` - 添加新器材
- `PUT /api/equipments/{id}` - 更新器材信息
- `DELETE /api/equipments/{id}` - 删除器材

## 🚀 如何运行

### 环境要求
- **Node.js**: 18.0+
- **.NET**: 8.0+
- **MySQL**: 8.0+

### 数据库设置
1. 创建MySQL数据库
2. 更新 `backend/appsettings.json` 中的连接字符串
3. 运行数据库迁移（Furion会自动创建表结构）

### 运行后端

1. 进入 `backend` 目录
2. 安装依赖: `dotnet restore`
3. 运行服务: `dotnet run`
4. 后端服务将运行在 `http://localhost:5000`

### 运行前端

1. 进入 `frontend` 目录
2. 安装依赖: `npm install`
3. 运行开发服务器: `npm run dev`
4. 前端应用将运行在 `http://localhost:3000`

## 📱 页面预览

### 首页 (Dashboard)
- 今日训练统计
- 周目标进度条
- 最近训练记录
- 成就徽章展示

### 训练环境管理
- 训练场所列表
- 器材配置管理
- 一键添加器材（支持20+器材类型）

### 训练记录
- 创建新训练
- 添加训练项目（组数、次数、重量等）
- 查看历史训练详情

## 🔧 开发说明

### 数据结构
- **Workout**: 训练记录（名称、类型、时间、卡路里等）
- **Exercise**: 训练项目（动作名称、组数、次数、重量等）
- **TrainingEnvironment**: 训练环境（名称、关联器材等）
- **Equipment**: 健身器材（名称、类型、重量等）

### 前端组件结构
- `/app/home` - 首页仪表盘
- `/app/locations` - 训练环境管理
- `/app/locations/[id]` - 具体环境器材管理
- `/components` - 可复用组件（对话框、卡片等）