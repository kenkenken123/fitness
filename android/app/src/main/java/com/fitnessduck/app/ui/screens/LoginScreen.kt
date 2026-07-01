package com.fitnessduck.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitnessduck.app.data.network.RetrofitClient
import com.fitnessduck.app.ui.theme.*
import com.fitnessduck.app.viewmodel.AuthViewModel

/**
 * 健身鸭登录与注册页面
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onLoginSuccess: () -> Unit
) {
    var isRegisterMode by remember { mutableStateOf(false) }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var displayName by remember { mutableStateOf("") }

    // 调试后台 IP 的配置面板状态
    var showIpSettings by remember { mutableStateOf(false) }
    var tempIp by remember { mutableStateOf(RetrofitClient.getBaseUrl()) }

    val currentUser by viewModel.currentUser.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    // 若已经登录，直接触发回调
    LaunchedEffect(currentUser) {
        if (currentUser != null) {
            onLoginSuccess()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .align(Alignment.Center),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // 吉祥物 Logo (用Emoji和背景模拟)
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .background(CandyPink.copy(alpha = 0.2f), shape = RoundedCornerShape(32.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("🦆", fontSize = 52.sp)
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "健身鸭 Fitness Duck",
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onBackground
            )

            Text(
                text = "今天也要像鸭鸭一样强壮！💪",
                fontSize = 14.sp,
                color = Color.Gray,
                modifier = Modifier.padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // 错误提示框
            errorMessage?.let { msg ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = CandyPinkBg),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.Info, contentDescription = "Error", tint = Color.Red)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(msg, color = Color.Red, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
                // 自动消失或点击重置
                LaunchedEffect(msg) {
                    // 保留提示，但可以手动清空
                }
            }

            // 输入框
            OutlinedTextField(
                value = username,
                onValueChange = { 
                    username = it
                    viewModel.clearError()
                },
                label = { Text("用户名") },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            if (isRegisterMode) {
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = displayName,
                    onValueChange = { displayName = it },
                    label = { Text("昵称 (选填)") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { 
                    password = it
                    viewModel.clearError()
                },
                label = { Text("密码") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                visualTransformation = PasswordVisualTransformation(),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (isLoading) {
                CircularProgressIndicator(color = CandyBlueDark)
            } else {
                // 登录/注册按钮
                Button(
                    onClick = {
                        if (username.isNotBlank() && password.isNotBlank()) {
                            if (isRegisterMode) {
                                viewModel.register(username, password, displayName.ifBlank { null }, onLoginSuccess)
                            } else {
                                viewModel.login(username, password, onLoginSuccess)
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = if (isRegisterMode) CandyPinkDark else CandyBlueDark),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    Text(
                        text = if (isRegisterMode) "创建账号 & 开启打卡" else "授权登录",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // 游客自动登录 (离线/Mock 演示)
                Button(
                    onClick = { viewModel.guestLogin(onLoginSuccess) },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                ) {
                    Text(
                        text = "🦆 游客一键试用 (离线数据模式)",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 模式切换
                Text(
                    text = if (isRegisterMode) "已有账号？去登录" else "没有账号？点击注册新鸭子",
                    color = CandyBlueDark,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    modifier = Modifier
                        .clickable { 
                            isRegisterMode = !isRegisterMode
                            viewModel.clearError()
                        }
                        .padding(8.dp)
                )
            }
        }

        // 底部：API IP 修改调试区域 (对本地部署联调极其方便)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { showIpSettings = !showIpSettings }
                    .padding(8.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Settings, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.Gray)
                Spacer(modifier = Modifier.width(4.dp))
                Text("配置后端 API 基准地址", color = Color.Gray, fontSize = 11.sp)
            }

            AnimatedVisibility(
                visible = showIpSettings,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .background(MaterialTheme.colorScheme.surfaceVariant, shape = RoundedCornerShape(16.dp))
                        .padding(12.dp)
                ) {
                    Text("当前服务地址: ${RetrofitClient.getBaseUrl()}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = tempIp,
                            onValueChange = { tempIp = it },
                            label = { Text("API IP / Host") },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp),
                            textStyle = TextStyle(fontSize = 12.sp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                RetrofitClient.updateBaseUrl(tempIp)
                                viewModel.clearError()
                                showIpSettings = false
                            },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.height(50.dp)
                        ) {
                            Text("修改", fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
