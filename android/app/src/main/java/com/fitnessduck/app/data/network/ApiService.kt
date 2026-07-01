package com.fitnessduck.app.data.network

import com.fitnessduck.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ==========================================
    // 1. 用户认证与个人中心接口
    // ==========================================

    @POST("users/login")
    suspend fun login(@Body body: Map<String, String>): Response<User>

    @POST("users/register")
    suspend fun register(@Body body: Map<String, String>): Response<User>

    @GET("users/{userId}/profile")
    suspend fun getUserProfile(@Path("userId") userId: Int): Response<UserProfileDto>

    // ==========================================
    // 2. 仪表盘数据接口
    // ==========================================

    @GET("workouts/users/{userId}/dashboard")
    suspend fun getDashboardData(@Path("userId") userId: Int): Response<DashboardData>

    // ==========================================
    // 3. 训练环境管理接口
    // ==========================================

    @GET("trainingEnvironments/user/{userId}")
    suspend fun getEnvironments(@Path("userId") userId: Int): Response<List<TrainingEnvironment>>

    @GET("trainingEnvironments/{id}")
    suspend fun getEnvironmentDetail(@Path("id") id: Int): Response<TrainingEnvironment>

    @POST("trainingEnvironments")
    suspend fun createEnvironment(@Body body: TrainingEnvironmentDto): Response<TrainingEnvironment>

    @PUT("trainingEnvironments/{id}")
    suspend fun updateEnvironment(
        @Path("id") id: Int,
        @Body body: TrainingEnvironmentDto
    ): Response<TrainingEnvironment>

    @DELETE("trainingEnvironments/{id}")
    suspend fun deleteEnvironment(@Path("id") id: Int): Response<Unit>

    // ==========================================
    // 4. 器材管理接口
    // ==========================================

    @GET("equipments/ByUserId/{userId}")
    suspend fun getEquipmentsByUserId(@Path("userId") userId: Int): Response<List<Equipment>>

    @POST("equipments")
    suspend fun createEquipment(@Body body: Equipment): Response<Equipment>

    @PUT("equipments/{id}")
    suspend fun updateEquipment(@Path("id") id: Int, @Body body: Equipment): Response<Equipment>

    @DELETE("equipments/{id}")
    suspend fun deleteEquipment(@Path("id") id: Int): Response<Unit>

    @POST("equipments/recognize")
    suspend fun recognizeEquipment(@Body body: Map<String, String>): Response<AiEquipmentRecognitionDto>

    // ==========================================
    // 5. 训练日志与 AI 生成接口
    // ==========================================

    @GET("workoutlogs/user/{userId}")
    suspend fun getWorkoutLogs(@Path("userId") userId: Int): Response<List<WorkoutLog>>

    @POST("workoutlogs/generate")
    suspend fun generateWorkoutPlan(@Body body: AiWorkoutRequest): Response<WorkoutLog>

    // ==========================================
    // 6. 动作指令接口
    // ==========================================

    @POST("exercises/instructions")
    suspend fun getExerciseInstruction(@Body body: Map<String, String>): Response<Map<String, String>>
}
