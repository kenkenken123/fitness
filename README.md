# 🦆 Fitness Duck

A playful, intelligent, and community-focused fitness companion designed to make your workout journey fun and effective. Powered by **Next.js** and **.NET Core**.

![Fitness Duck Logo](frontend/public/icons/logo_muscle_duck.png)

## ✨ Features

### 🎨 Playful & Modern UI
- **Candy-Themed Design**: Vibrant colors (Candy Pink, Mint, Blue) and rounded aesthetics for a friendly user experience.
- **Interactive Dashboard**:
    - **Activity Rings**: Visualize your daily calories, duration, and workout counts.
    - **Nano Banners**: Cute 3D icons for quick navigation and stats.
    - **Muscle Duck Mascot**: Your strong and friendly workout buddy!

### 🏋️ Training Management
- **Smart Workout Logging**: Create detailed logs with sets, reps, and weights.
- **AI Workout Generation**: Automatically generate workout plans based on available equipment and your focus (Strength/Cardio).
- **History & Stats**: Track your progress with detailed charts and history views.

### 📍 Environment & Equipment
- **Location Management**: Manage different workout spots (Home, Gym, Park).
- **Smart Equipment Manager**:
    - **AI Camera Recognition**: Snap a photo or choose an image to automatically identify and add equipment!
    - **Manual Management**: Custom add/edit your equipment inventory.

### 👤 User Profile
- **Personalized Stats**: Level system, heatmaps (coming soon), and achievement badges.
- **Theme Integration**: Custom avatars (defaults to Muscle Duck!) and personalized greetings.

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS + Shadcn UI + Custom Candy Theme
- **Data Fetching**: Axios
- **Icons**: Lucide React + Custom 3D Assets

### Backend
- **Framework**: .NET Core 8.0 + Furion
- **Database**: MySQL
- **ORM**: Entity Framework Core
- **Architecture**: Domain-Driven Design (DDD)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- .NET 8.0 SDK
- MySQL 8.0+

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/fitness-duck.git
    cd fitness-duck
    ```

2.  **Backend Setup**
    - Navigate to `backend/` directory.
    - Update connection string in `appsettings.json`.
    - Run migrations (Furion auto-migrates on start).
    - Start the server:
        ```bash
        dotnet run
        ```
    - Server running at: `http://localhost:5000`

3.  **Frontend Setup**
    - Navigate to `frontend/` directory.
    - Install dependencies:
        ```bash
        npm install
        ```
    - Start development server:
        ```bash
        npm run dev
        ```
    - App running at: `http://localhost:3000`

## 📸 Screenshots

*(Add screenshots of your playful dashboard, location page, and AI camera dialog here)*

## 📄 License

This project is licensed under the MIT License.