package com.fitnessduck.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitnessduck.app.data.model.User
import com.fitnessduck.app.ui.theme.*
import com.fitnessduck.app.viewmodel.AuthViewModel
import com.fitnessduck.app.viewmodel.MainViewModel

/**
 * 个人中心与游戏化成就徽章页面
 */
@Composable
fun ProfileScreen(
    user: User,
    authViewModel: AuthViewModel,
    mainViewModel: MainViewModel
) {
    val userProfile by mainViewModel.userProfile.collectAsState()

    LaunchedEffect(user.id) {
        mainViewModel.loadUserProfile(user.id)
    }

    val profile = userProfile ?: com.fitnessduck.app.data.model.UserProfileDto(
        id = user.id,
        username = user.username,
        displayName = user.displayName,
        level = 1,
        experiencePoints = 0,
        nextLevelExperience = 100,
        workoutCount = 0,
        environmentCount = 0,
        badges = listOf("🏆 健身萌新", "🦆 鸭鸭一号")
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 100.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "个人中心 👤",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }
            }

            // 1. 鸭子个人卡片 (包含头像，等级，经验进度条)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(28.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // 鸭子头像
                        Box(
                            modifier = Modifier
                                .size(90.dp)
                                .background(CandyBlue.copy(alpha = 0.2f), shape = RoundedCornerShape(32.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🦆", fontSize = 48.sp)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = profile.displayName ?: profile.username,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black
                        )
                        
                        Text(
                            text = "@${profile.username}",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // 等级指示器
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Box(
                                modifier = Modifier
                                    .background(CandyMint.copy(alpha = 0.2f), shape = RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text("Lv.${profile.level}", fontWeight = FontWeight.Black, fontSize = 12.sp, color = CandyMintDark)
                            }
                            
                            Text(
                                "经验值: ${profile.experiencePoints} / ${profile.nextLevelExperience} XP",
                                fontSize = 11.sp,
                                color = Color.Gray,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // 经验进度条
                        LinearProgressIndicator(
                            progress = (profile.experiencePoints.toFloat() / profile.nextLevelExperience.toFloat()).coerceIn(0f, 1f),
                            color = CandyMintDark,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp))
                        )
                    }
                }
            }

            // 2. 统计摘要
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        modifier = Modifier.weight(1f),
                        emoji = "💪",
                        title = "累计训练",
                        value = "${profile.workoutCount} 次",
                        color = CandyPink
                    )
                    StatCard(
                        modifier = Modifier.weight(1f),
                        emoji = "🏠",
                        title = "配置场所",
                        value = "${profile.environmentCount} 个",
                        color = CandyBlue
                    )
                }
            }

            // 3. 成就徽章卡片 (GamificationBadge 的安卓原生等价实现)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text(
                            text = "🏆 鸭鸭成就徽章",
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp,
                            modifier = Modifier.padding(bottom = 12.dp)
                        )
                        
                        if (profile.badges.isEmpty()) {
                            Text("暂无获得任何徽章，加油生成计划去锻炼鸭！", color = Color.Gray, fontSize = 12.sp)
                        } else {
                            // 环形排列显示所有的徽章
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                profile.badges.chunked(2).forEach { rowList ->
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        rowList.forEach { badge ->
                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .background(
                                                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                                        shape = RoundedCornerShape(14.dp)
                                                    )
                                                    .padding(10.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(
                                                    text = badge,
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 12.sp,
                                                    color = MaterialTheme.colorScheme.onSurface
                                                )
                                            }
                                        }
                                        // 补齐占位
                                        if (rowList.size < 2) {
                                            Spacer(modifier = Modifier.weight(1f))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 4. 退出登录
            item {
                Button(
                    onClick = { authViewModel.logout {} },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.1f)),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Default.ExitToApp, contentDescription = null, tint = Color.Red)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("退出登录鸭", color = Color.Red, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(
    modifier: Modifier = Modifier,
    emoji: String,
    title: String,
    value: String,
    color: Color
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(color.copy(alpha = 0.15f), shape = RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(emoji, fontSize = 16.sp)
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(title, fontSize = 11.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
            Text(value, fontSize = 18.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}
