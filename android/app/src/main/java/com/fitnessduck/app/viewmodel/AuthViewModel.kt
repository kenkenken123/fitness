package com.fitnessduck.app.viewmodel

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.fitnessduck.app.data.model.User
import com.fitnessduck.app.data.network.RetrofitClient
import com.fitnessduck.app.data.repository.FitnessRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel(
    application: Application,
    private val repository: FitnessRepository
) : AndroidViewModel(application) {

    private val sharedPrefs = application.getSharedPreferences("fitness_duck_prefs", Context.MODE_PRIVATE)

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        // 初始化时，尝试从本地缓存恢复登录状态
        restoreSession()
    }

    private fun restoreSession() {
        val userId = sharedPrefs.getInt("user_id", 0)
        val username = sharedPrefs.getString("username", null)
        val displayName = sharedPrefs.getString("display_name", null)
        val token = sharedPrefs.getString("token", null)
        val isMock = sharedPrefs.getBoolean("is_mock_mode", false)

        if (userId > 0 && username != null) {
            val user = User(userId, username, displayName, token)
            _currentUser.value = user
            RetrofitClient.setToken(token)
            repository.setMockMode(isMock)
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }

    /**
     * 1. 登录逻辑
     */
    fun login(username: String, passwordHash: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            repository.login(username, passwordHash)
                .onSuccess { user ->
                    saveUserSession(user)
                    _currentUser.value = user
                    onSuccess()
                }
                .onFailure { exception ->
                    _errorMessage.value = exception.message ?: "登录失败，请检查网络"
                }
            _isLoading.value = false
        }
    }

    /**
     * 2. 注册逻辑
     */
    fun register(username: String, passwordHash: String, displayName: String?, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            repository.register(username, passwordHash, displayName)
                .onSuccess {
                    // 注册成功后，直接进行登录
                    login(username, passwordHash, onSuccess)
                }
                .onFailure { exception ->
                    _errorMessage.value = exception.message ?: "注册失败"
                }
            _isLoading.value = false
        }
    }

    /**
     * 3. 游客快速自动登录
     */
    fun guestLogin(onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            repository.setMockMode(true)
            repository.login("guest_duck", "guest123")
                .onSuccess { user ->
                    saveUserSession(user, isMock = true)
                    _currentUser.value = user
                    onSuccess()
                }
                .onFailure {
                    _errorMessage.value = "游客登录失败"
                }
            _isLoading.value = false
        }
    }

    /**
     * 4. 退出登录
     */
    fun logout(onSuccess: () -> Unit) {
        sharedPrefs.edit().clear().apply()
        _currentUser.value = null
        RetrofitClient.setToken(null)
        repository.setMockMode(false)
        onSuccess()
    }

    private fun saveUserSession(user: User, isMock: Boolean = false) {
        sharedPrefs.edit().apply {
            putInt("user_id", user.id)
            putString("username", user.username)
            putString("display_name", user.displayName)
            putString("token", user.token)
            putBoolean("is_mock_mode", isMock || repository.isMockMode())
            apply()
        }
        RetrofitClient.setToken(user.token)
    }
}
