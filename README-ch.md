# 🦆 健身鸭 (Fitness Duck)

您的贴身智能健身教练！这是一款集趣味性、智能化与社区感于一体的健身应用，旨在为您带来轻松愉快的训练体验。

![Fitness Duck Logo](frontend/public/icons/logo_muscle_duck.png)

## ✨ 核心亮点

### 🎨 趣味与现代化 UI
- **糖果色主题**: 采用清新的薄荷绿、糖果粉和天空蓝，配合圆润的 UI 设计，拒绝沉闷。
- **互动仪表盘**:
    - **活动圆环**: 直观展示每日卡路里、时长和训练次数。
    - **Nano Banners**: 首页采用可爱的 3D 图标导航，元气满满。
    - **肌肉鸭鸭吉祥物**: 强壮又友好的鸭鸭全程陪伴您的训练！

### 🏋️ 智能训练管理
- **训练日志**: 轻松记录每组动作的重量、次数和组数。
- **AI 计划生成**: 只需要选择训练部位（力量/有氧），AI 会根据您当前的可用器材自动生成专属计划。
- **历史与统计**: 详尽的数据图表，记录您的每一次进步。

### 📍 场所与器材
- **多场景管理**: 支持家庭、健身房、户外等多个训练场景切换。
- **智能器材库**:
    - **📷 AI 拍照识别**: 拍一张照片，AI 自动识别并添加健身器材，省去手动输入的烦恼！
    - **自定义管理**: 灵活编辑您的私有器材库。

### 👤 个人中心
- **成长体系**: 训练等级、成就徽章系统。
- **个性化都在细节里**: 默认萌鸭头像、暖心的每日问候。

## 🏗️ 技术架构

### 前端 (Frontend)
- **框架**: Next.js 14 (React 18)
- **样式**: Tailwind CSS + Shadcn UI + 自定义糖果主题
- **交互**: Axios + Lucide React + 3D 资产

### 后端 (Backend)
- **框架**: .NET Core 8.0 + Furion
- **数据库**: MySQL
- **ORM**: Entity Framework Core
- **架构**: 采用领域驱动设计 (DDD)

## 🚀 快速开始

### 环境依赖
- Node.js 18+
- .NET 8.0 SDK
- MySQL 8.0+

### 安装步骤

1.  **克隆项目**
    ```bash
    git clone https://github.com/yourusername/fitness-duck.git
    cd fitness-duck
    ```

2.  **后端启动**
    - 进入 `backend/` 目录。
    - 修改 `appsettings.json` 中的数据库连接字符串。
    - 运行服务 (会自动执行数据库迁移):
        ```bash
        dotnet run
        ```
    - 服务地址: `http://localhost:5000`

3.  **前端启动**
    - 进入 `frontend/` 目录。
    - 安装依赖:
        ```bash
        npm install
        ```
    - 启动开发服务:
        ```bash
        npm run dev
        ```
    - 访问地址: `http://localhost:3000`

## 📸 精彩截图

*(在此处添加首页仪表盘、器材管理页、AI 识别弹窗等截图)*

## 📄 开源协议

MIT License.
