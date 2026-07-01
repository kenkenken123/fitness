package com.fitnessduck.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fitnessduck.app.data.model.*
import com.fitnessduck.app.data.repository.FitnessRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel(
    private val repository: FitnessRepository
) : ViewModel() {

    // ==========================================
    // 状态流数据 (UI States)
    // ==========================================

    private val _dashboardData = MutableStateFlow<DashboardData?>(null)
    val dashboardData: StateFlow<DashboardData?> = _dashboardData.asStateFlow()

    private val _environments = MutableStateFlow<List<TrainingEnvironment>>(emptyList())
    val environments: StateFlow<List<TrainingEnvironment>> = _environments.asStateFlow()

    private val _workoutLogs = MutableStateFlow<List<WorkoutLog>>(emptyList())
    val workoutLogs: StateFlow<List<WorkoutLog>> = _workoutLogs.asStateFlow()

    private val _allEquipments = MutableStateFlow<List<Equipment>>(emptyList())
    val allEquipments: StateFlow<List<Equipment>> = _allEquipments.asStateFlow()

    private val _userProfile = MutableStateFlow<UserProfileDto?>(null)
    val userProfile: StateFlow<UserProfileDto?> = _userProfile.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()

    fun clearMessage() {
        _message.value = null
    }

    fun isMockMode(): Boolean = repository.isMockMode()

    // ==========================================
    // 业务方法 (Actions)
    // ==========================================

    /**
     * 1. 刷新首页 Dashboard
     */
    fun refreshDashboard(userId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.getDashboardData(userId)
                .onSuccess { _dashboardData.value = it }
                .onFailure { _message.value = it.message }
            _isLoading.value = false
        }
    }

    /**
     * 2. 获取训练环境
     */
    fun loadEnvironments(userId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.getEnvironments(userId)
                .onSuccess { _environments.value = it }
                .onFailure { _message.value = it.message }
            _isLoading.value = false
        }
    }

    /**
     * 3. 加载历史训练日志
     */
    fun loadWorkoutLogs(userId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.getWorkoutLogs(userId)
                .onSuccess { _workoutLogs.value = it }
                .onFailure { _message.value = it.message }
            _isLoading.value = false
        }
    }

    /**
     * 4. 加载器材列表
     */
    fun loadAllEquipments(userId: Int) {
        viewModelScope.launch {
            repository.getEquipments(userId)
                .onSuccess { _allEquipments.value = it }
                .onFailure { _message.value = it.message }
        }
    }

    /**
     * 5. 加载个人档案与成就
     */
    fun loadUserProfile(userId: Int) {
        viewModelScope.launch {
            repository.getUserProfile(userId)
                .onSuccess { _userProfile.value = it }
                .onFailure { _message.value = it.message }
        }
    }

    /**
     * 6. 创建训练环境
     */
    fun createEnvironment(userId: Int, name: String, description: String?, equipmentIds: List<Int>) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.createEnvironment(userId, name, description, equipmentIds)
                .onSuccess {
                    _message.value = "环境创建成功 🏠"
                    loadEnvironments(userId)
                }
                .onFailure { _message.value = "创建失败: ${it.message}" }
            _isLoading.value = false
        }
    }

    /**
     * 7. 更新训练环境
     */
    fun updateEnvironment(id: Int, userId: Int, name: String, description: String?, equipmentIds: List<Int>) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.updateEnvironment(id, userId, name, description, equipmentIds)
                .onSuccess {
                    _message.value = "环境更新成功 ⚙️"
                    loadEnvironments(userId)
                }
                .onFailure { _message.value = "更新失败: ${it.message}" }
            _isLoading.value = false
        }
    }

    /**
     * 8. 删除训练环境
     */
    fun deleteEnvironment(id: Int, userId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.deleteEnvironment(id)
                .onSuccess {
                    _message.value = "环境已删除 🗑️"
                    loadEnvironments(userId)
                }
                .onFailure { _message.value = "删除失败: ${it.message}" }
            _isLoading.value = false
        }
    }

    /**
     * 9. 在特定环境内创建器材
     */
    fun createEquipment(userId: Int, environmentId: Int, name: String, type: String, weight: Double) {
        viewModelScope.launch {
            _isLoading.value = true
            // 创建器材
            repository.createEquipment(userId, name, type, weight)
                .onSuccess { equipment ->
                    // 自动关联到当前环境
                    val env = _environments.value.find { it.id == environmentId }
                    if (env != null) {
                        val currentEquipIds = env.equipments.map { it.id }.toMutableList()
                        currentEquipIds.add(equipment.id)
                        repository.updateEnvironment(environmentId, userId, env.name, env.description, currentEquipIds)
                            .onSuccess {
                                _message.value = "器材添加并关联成功 🏋️"
                                loadEnvironments(userId)
                                loadAllEquipments(userId)
                            }
                    } else {
                        _message.value = "器材创建成功，但关联环境失败"
                    }
                }
                .onFailure { _message.value = "添加失败: ${it.message}" }
            _isLoading.value = false
        }
    }

    /**
     * 10. 删除器材
     */
    fun deleteEquipment(equipmentId: Int, userId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.deleteEquipment(equipmentId)
                .onSuccess {
                    _message.value = "器材已删除"
                    loadEnvironments(userId)
                    loadAllEquipments(userId)
                }
                .onFailure { _message.value = "删除失败: ${it.message}" }
            _isLoading.value = false
        }
    }

    /**
     * 11. AI 智能拍照识别导入器材
     */
    fun importAiRecognizedEquipments(userId: Int, environmentId: Int, recognizedNames: List<String>) {
        viewModelScope.launch {
            _isLoading.value = true
            var successCount = 0
            val env = _environments.value.find { it.id == environmentId }
            if (env != null) {
                val currentEquipIds = env.equipments.map { it.id }.toMutableList()
                
                recognizedNames.forEach { name ->
                    // 默认识别到的物品重量为 0 (自重或辅助器材)
                    repository.createEquipment(userId, name, "AI识别", 0.0)
                        .onSuccess { equip ->
                            currentEquipIds.add(equip.id)
                            successCount++
                        }
                }
                
                if (successCount > 0) {
                    repository.updateEnvironment(environmentId, userId, env.name, env.description, currentEquipIds)
                        .onSuccess {
                            _message.value = "AI 识别成功：成功导入 $successCount 个器材 🦆"
                            loadEnvironments(userId)
                            loadAllEquipments(userId)
                        }
                } else {
                    _message.value = "导入识别器材失败"
                }
            }
            _isLoading.value = false
        }
    }

    /**
     * 12. AI 智能生成训练计划
     */
    fun generateWorkoutPlan(userId: Int, environmentId: Int, focus: String) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.generateWorkoutPlan(userId, environmentId, focus)
                .onSuccess {
                    _message.value = "AI 已为你量身定制新计划！🎉"
                    loadWorkoutLogs(userId)
                    refreshDashboard(userId)
                }
                .onFailure { _message.value = "生成计划失败: ${it.message}" }
            _isLoading.value = false
        }
    }
}
