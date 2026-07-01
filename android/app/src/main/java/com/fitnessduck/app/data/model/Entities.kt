package com.fitnessduck.app.data.model

import com.google.gson.annotations.SerializedName

// ==========================================
// 1. 用户认证与个人中心数据模型
// ==========================================

data class User(
    val id: Int = 0,
    val username: String = "",
    val displayName: String? = null,
    val token: String? = null
)

data class UserLoginDto(
    val username: String,
    val passwordHash: String // 后端直接接收密码，但我们统一在DTO字段上匹配
)

data class UserRegisterDto(
    val username: String,
    val passwordHash: String,
    val displayName: String? = null
)

data class UserProfileDto(
    val id: Int,
    val username: String,
    val displayName: String?,
    val level: Int,
    val experiencePoints: Int,
    val nextLevelExperience: Int,
    val workoutCount: Int,
    val environmentCount: Int,
    val badges: List<String> = emptyList()
)

// ==========================================
// 2. 训练环境与器材数据模型
// ==========================================

data class TrainingEnvironment(
    val id: Int = 0,
    val userId: Int = 0,
    val name: String = "",
    val description: String? = null,
    val equipments: List<Equipment> = emptyList()
)

data class Equipment(
    val id: Int = 0,
    val name: String = "",
    val type: String = "", // e.g. 哑铃, 跑步机, 杠铃, 自重
    val weight: Double = 0.0,
    val userId: Int = 0
)

data class TrainingEnvironmentDto(
    val name: String,
    val description: String? = null,
    val equipmentIds: List<Int> = emptyList()
)

// ==========================================
// 3. 锻炼日志与锻炼组数据模型
// ==========================================

data class WorkoutLog(
    val id: Int = 0,
    val userId: Int = 0,
    val name: String = "",
    val startTime: String = "",
    val endTime: String? = null,
    val estimatedDuration: Int? = null,
    val estimatedCalories: Int? = null,
    val isCompleted: Boolean = false,
    val workoutSets: List<WorkoutSet> = emptyList()
)

data class WorkoutSet(
    val id: Int = 0,
    val workoutLogId: Int = 0,
    val activityName: String = "",
    val weight: Double = 0.0,
    val sets: Int = 0,
    val reps: Int = 0,
    val isCompleted: Boolean = false
)

// ==========================================
// 4. 仪表盘数据模型
// ==========================================

data class TodayStats(
    val workoutsCompleted: Int = 0,
    val caloriesBurned: Int = 0,
    val totalDuration: Int = 0,
    val currentStreak: Int = 0
)

data class WeeklyGoal(
    val current: Int = 0,
    val target: Int = 6,
    val percentage: Double = 0.0
)

data class RecentWorkout(
    val id: Int = 0,
    val name: String = "",
    val date: String = "",
    val duration: Int = 0,
    val calories: Int = 0,
    val type: String = "",
    val environmentName: String? = null
)

data class Achievement(
    val id: Int = 0,
    val name: String = "",
    val icon: String = "",
    val type: String = "",
    val earnedDate: String = ""
)

data class DashboardData(
    val userId: Int = 0,
    val username: String = "",
    val displayName: String? = null,
    val todayStats: TodayStats = TodayStats(),
    val weeklyGoal: WeeklyGoal = WeeklyGoal(),
    val recentWorkouts: List<RecentWorkout> = emptyList(),
    val achievements: List<Achievement> = emptyList()
)

// ==========================================
// 5. AI 相关 DTO
// ==========================================

data class AiEquipmentRecognitionDto(
    val imageUrl: String,
    val recognizedEquipments: List<String> = emptyList()
)

data class AiWorkoutRequest(
    val userId: Int,
    val environmentId: Int,
    val focus: String // 力量 (Strength) / 有氧 (Cardio)
)
