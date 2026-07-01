package com.fitnessduck.app.data.repository

import android.util.Log
import com.fitnessduck.app.data.model.*
import com.fitnessduck.app.data.network.RetrofitClient
import java.text.SimpleDateFormat
import java.util.*

class FitnessRepository {

    private val api get() = RetrofitClient.apiService
    
    // 是否启用 Mock 数据模式。当接口请求失败时，会自动回退到 Mock 模式，确保应用可用
    private var mockMode = false

    fun isMockMode(): Boolean = mockMode
    fun setMockMode(enabled: Boolean) {
        mockMode = enabled
    }

    private val tag = "FitnessRepository"

    // ==========================================
    // Mock 数据区 (供无后端离线演示使用)
    // ==========================================
    private var mockUser = User(id = 1, username = "游客鸭鸭", displayName = "肌肉鸭鸭 🦆", token = "mock-token-xyz")
    
    private val mockProfile = UserProfileDto(
        id = 1,
        username = "游客鸭鸭",
        displayName = "肌肉鸭鸭 🦆",
        level = 4,
        experiencePoints = 320,
        nextLevelExperience = 1000,
        workoutCount = 18,
        environmentCount = 2,
        badges = listOf("🏆 健身新手", "🔥 连续3天", "🦆 强壮鸭鸭")
    )

    private val mockEquipments = mutableListOf(
        Equipment(id = 1, name = "可调哑铃 (对)", type = "哑铃", weight = 20.0, userId = 1),
        Equipment(id = 2, name = "多功能瑜伽垫", type = "自重", weight = 0.0, userId = 1),
        Equipment(id = 3, name = "商用跑步机", type = "跑步机", weight = 0.0, userId = 1),
        Equipment(id = 4, name = "哑铃凳", type = "辅助器材", weight = 15.0, userId = 1)
    )

    private val mockEnvironments = mutableListOf(
        TrainingEnvironment(
            id = 1, userId = 1, name = "温馨的家里 🏠", description = "备有基本哑铃与自重器材",
            equipments = listOf(mockEquipments[0], mockEquipments[1])
        ),
        TrainingEnvironment(
            id = 2, userId = 1, name = "鸭鸭健身房 🏋️", description = "设备齐全，练爆胸背！",
            equipments = mockEquipments.toList()
        )
    )

    private val mockLogs = mutableListOf(
        WorkoutLog(
            id = 101, userId = 1, name = "鸭鸭力量狂飙计划 (胸肩)", 
            startTime = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date(System.currentTimeMillis() - 86400000)),
            endTime = "1小时前", estimatedDuration = 45, estimatedCalories = 350, isCompleted = true,
            workoutSets = listOf(
                WorkoutSet(id = 201, workoutLogId = 101, activityName = "哑铃卧推", weight = 15.0, sets = 4, reps = 12, isCompleted = true),
                WorkoutSet(id = 202, workoutLogId = 101, activityName = "哑铃飞鸟", weight = 10.0, sets = 3, reps = 15, isCompleted = true),
                WorkoutSet(id = 203, workoutLogId = 101, activityName = "俯卧撑", weight = 0.0, sets = 4, reps = 20, isCompleted = true)
            )
        ),
        WorkoutLog(
            id = 102, userId = 1, name = "脂肪燃烧狂跑计划 (有氧)", 
            startTime = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date(System.currentTimeMillis() - 86400000 * 2)),
            endTime = "前天", estimatedDuration = 30, estimatedCalories = 400, isCompleted = true,
            workoutSets = listOf(
                WorkoutSet(id = 204, workoutLogId = 102, activityName = "跑步机跑步", weight = 0.0, sets = 1, reps = 30, isCompleted = true)
            )
        )
    )

    private val mockDashboard = DashboardData(
        userId = 1,
        username = "游客鸭鸭",
        displayName = "肌肉鸭鸭 🦆",
        todayStats = TodayStats(workoutsCompleted = 1, caloriesBurned = 350, totalDuration = 45, currentStreak = 3),
        weeklyGoal = WeeklyGoal(current = 3, target = 6, percentage = 50.0),
        recentWorkouts = listOf(
            RecentWorkout(id = 101, name = "鸭鸭力量狂飙计划 (胸肩)", date = "今天", duration = 45, calories = 350, type = "Strength", environmentName = "温馨的家里 🏠"),
            RecentWorkout(id = 102, name = "脂肪燃烧狂跑计划 (有氧)", date = "前天", duration = 30, calories = 400, type = "Cardio", environmentName = "鸭鸭健身房 🏋️")
        ),
        achievements = listOf(
            Achievement(id = 1, name = "健身新手", icon = "🏆", type = "Level", earnedDate = "2026-06-28"),
            Achievement(id = 2, name = "连击之王", icon = "🔥", type = "Streak", earnedDate = "2026-06-30")
        )
    )

    // ==========================================
    // 接口包装与降级逻辑
    // ==========================================

    private suspend fun <T> safeApiCall(
        fallback: () -> T,
        apiCall: suspend () -> retrofit2.Response<T>
    ): Result<T> {
        if (mockMode) {
            return Result.success(fallback())
        }
        return try {
            val response = apiCall()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorMsg = "API 报错: ${response.code()} ${response.message()}"
                Log.e(tag, errorMsg)
                // 网络虽然连通但接口返回错误，如果不是 401，我们退回 mock 保证离线可用性
                if (response.code() != 401) {
                    mockMode = true
                    Log.i(tag, "已自动切换到 Mock 模式")
                    Result.success(fallback())
                } else {
                    Result.failure(Exception("登录已过期，请重新登录"))
                }
            }
        } catch (e: Exception) {
            Log.e(tag, "网络请求失败，切换至 Mock 模式", e)
            mockMode = true
            Result.success(fallback())
        }
    }

    suspend fun login(username: String, passwordHash: String): Result<User> {
        return safeApiCall({ mockUser.copy(username = username) }) {
            api.login(mapOf("username" to username, "passwordHash" to passwordHash))
        }.onSuccess {
            RetrofitClient.setToken(it.token)
        }
    }

    suspend fun register(username: String, passwordHash: String, displayName: String?): Result<User> {
        return safeApiCall({ mockUser.copy(username = username, displayName = displayName ?: username) }) {
            api.register(
                mapOf(
                    "username" to username,
                    "passwordHash" to passwordHash,
                    "displayName" to (displayName ?: "")
                )
            )
        }
    }

    suspend fun getUserProfile(userId: Int): Result<UserProfileDto> {
        return safeApiCall({ mockProfile }) {
            api.getUserProfile(userId)
        }
    }

    suspend fun getDashboardData(userId: Int): Result<DashboardData> {
        return safeApiCall({ mockDashboard }) {
            api.getDashboardData(userId)
        }
    }

    suspend fun getEnvironments(userId: Int): Result<List<TrainingEnvironment>> {
        return safeApiCall({ mockEnvironments }) {
            api.getEnvironments(userId)
        }
    }

    suspend fun getEnvironmentDetail(id: Int): Result<TrainingEnvironment> {
        return safeApiCall({ mockEnvironments.find { it.id == id } ?: mockEnvironments[0] }) {
            api.getEnvironmentDetail(id)
        }
    }

    suspend fun createEnvironment(userId: Int, name: String, description: String?, equipmentIds: List<Int>): Result<TrainingEnvironment> {
        val nextId = (mockEnvironments.maxOfOrNull { it.id } ?: 0) + 1
        val selectedEquips = mockEquipments.filter { it.id in equipmentIds }
        val newEnv = TrainingEnvironment(nextId, userId, name, description, selectedEquips)
        
        return safeApiCall({
            mockEnvironments.add(newEnv)
            newEnv
        }) {
            api.createEnvironment(TrainingEnvironmentDto(name, description, equipmentIds))
        }
    }

    suspend fun updateEnvironment(id: Int, userId: Int, name: String, description: String?, equipmentIds: List<Int>): Result<TrainingEnvironment> {
        val selectedEquips = mockEquipments.filter { it.id in equipmentIds }
        val updatedEnv = TrainingEnvironment(id, userId, name, description, selectedEquips)
        
        return safeApiCall({
            val idx = mockEnvironments.indexOfFirst { it.id == id }
            if (idx != -1) mockEnvironments[idx] = updatedEnv
            updatedEnv
        }) {
            api.updateEnvironment(id, TrainingEnvironmentDto(name, description, equipmentIds))
        }
    }

    suspend fun deleteEnvironment(id: Int): Result<Unit> {
        return safeApiCall({
            mockEnvironments.removeAll { it.id == id }
            Unit
        }) {
            api.deleteEnvironment(id)
        }
    }

    suspend fun getEquipments(userId: Int): Result<List<Equipment>> {
        return safeApiCall({ mockEquipments }) {
            api.getEquipmentsByUserId(userId)
        }
    }

    suspend fun createEquipment(userId: Int, name: String, type: String, weight: Double): Result<Equipment> {
        val nextId = (mockEquipments.maxOfOrNull { it.id } ?: 0) + 1
        val newEquip = Equipment(nextId, name, type, weight, userId)
        return safeApiCall({
            mockEquipments.add(newEquip)
            newEquip
        }) {
            api.createEquipment(newEquip)
        }
    }

    suspend fun updateEquipment(id: Int, userId: Int, name: String, type: String, weight: Double): Result<Equipment> {
        val updated = Equipment(id, name, type, weight, userId)
        return safeApiCall({
            val idx = mockEquipments.indexOfFirst { it.id == id }
            if (idx != -1) mockEquipments[idx] = updated
            updated
        }) {
            api.updateEquipment(id, updated)
        }
    }

    suspend fun deleteEquipment(id: Int): Result<Unit> {
        return safeApiCall({
            mockEquipments.removeAll { it.id == id }
            // 从各个环境的关联中移除该器材
            mockEnvironments.forEachIndexed { index, env ->
                if (env.equipments.any { it.id == id }) {
                    mockEnvironments[index] = env.copy(equipments = env.equipments.filter { it.id != id })
                }
            }
            Unit
        }) {
            api.deleteEquipment(id)
        }
    }

    suspend fun getWorkoutLogs(userId: Int): Result<List<WorkoutLog>> {
        return safeApiCall({ mockLogs }) {
            api.getWorkoutLogs(userId)
        }
    }

    suspend fun generateWorkoutPlan(userId: Int, environmentId: Int, focus: String): Result<WorkoutLog> {
        val env = mockEnvironments.find { it.id == environmentId }
        val name = if (focus == "Strength") "鸭鸭智能力量训练计划 🏋️" else "鸭鸭有氧轻盈跑跳计划 🏃"
        val nextId = (mockLogs.maxOfOrNull { it.id } ?: 100) + 1
        
        // 自动根据场所器材生成训练组
        val sets = env?.equipments?.mapIndexed { idx, eq ->
            WorkoutSet(
                id = nextId * 10 + idx,
                workoutLogId = nextId,
                activityName = if (focus == "Strength") "使用 ${eq.name} 进行抗阻训练" else "使用 ${eq.name} 进行心肺训练",
                weight = eq.weight,
                sets = if (focus == "Strength") 4 else 1,
                reps = if (focus == "Strength") 12 else 30,
                isCompleted = false
            )
        } ?: listOf(
            WorkoutSet(id = nextId * 10, workoutLogId = nextId, activityName = if (focus == "Strength") "哑铃卧推" else "跑步机慢跑", weight = 10.0, sets = 4, reps = 12)
        )

        val newLog = WorkoutLog(
            id = nextId,
            userId = userId,
            name = name,
            startTime = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date()),
            estimatedDuration = if (focus == "Strength") 50 else 35,
            estimatedCalories = if (focus == "Strength") 280 else 320,
            isCompleted = false,
            workoutSets = sets
        )

        return safeApiCall({
            mockLogs.add(0, newLog) // 插入到列表开头
            newLog
        }) {
            api.generateWorkoutPlan(AiWorkoutRequest(userId, environmentId, focus))
        }
    }

    suspend fun recognizeEquipment(userId: Int, imageUrl: String): Result<List<String>> {
        return safeApiCall({
            // 离线模拟返回随机的器材
            listOf("壶铃", "划船机", "哑铃凳").shuffled().take(2)
        }) {
            val response = api.recognizeEquipment(mapOf("imageUrl" to imageUrl))
            if (response.isSuccessful && response.body() != null) {
                retrofit2.Response.success(response.body()!!.recognizedEquipments)
            } else {
                retrofit2.Response.error(response.code(), response.errorBody()!!)
            }
        }
    }

    suspend fun getExerciseInstruction(activityName: String): Result<String> {
        return safeApiCall({
            "【健身鸭动作指南：$activityName】\n1. 挺胸收腹，保持核心收紧。\n2. 动作全程缓慢控制，不要借助惯性。\n3. 下落时吸气，发力时呼气。"
        }) {
            val response = api.getExerciseInstruction(mapOf("activityName" to activityName))
            if (response.isSuccessful && response.body() != null) {
                retrofit2.Response.success(response.body()!!["instruction"] ?: "")
            } else {
                retrofit2.Response.error(response.code(), response.errorBody()!!)
            }
        }
    }
}
