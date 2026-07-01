package com.fitnessduck.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.PlayArrow
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
import com.fitnessduck.app.ui.components.ActivityRings
import com.fitnessduck.app.ui.theme.*
import com.fitnessduck.app.viewmodel.MainViewModel

/**
 * 健身鸭首页仪表盘
 */
@Composable
fun HomeScreen(
    user: User,
    viewModel: MainViewModel,
    onNavigateToTab: (String) -> Unit,
    onQuickStartAction: (focus: String) -> Unit
) {
    val dashboardData by viewModel.dashboardData.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    // 页面加载或切换时刷新仪表盘
    LaunchedEffect(user.id) {
        viewModel.refreshDashboard(user.id)
    }

    val todayStats = dashboardData?.todayStats ?: com.fitnessduck.app.data.model.TodayStats()
    val weeklyGoal = dashboardData?.weeklyGoal ?: com.fitnessduck.app.data.model.WeeklyGoal()
    val recentWorkouts = dashboardData?.recentWorkouts ?: emptyList()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 100.dp), // 留出底部导航空间
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // 1. 顶部欢迎与 Logo 区域
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Box(
                            modifier = Modifier
                                .background(CandyBlue.copy(alpha = 0.2f), shape = RoundedCornerShape(20.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text("健身鸭 Fitness Duck 🦆", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = CandyBlueDark)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "你好, ${user.displayName ?: user.username}!",
                            fontSize = 26.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            text = "今天也要像鸭鸭一样强壮！💪",
                            fontSize = 13.sp,
                            color = Color.Gray
                        )
                    }

                    // 吉祥物萌鸭圆形图标
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .background(Color.White, shape = RoundedCornerShape(36.dp))
                            .clip(RoundedCornerShape(36.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🦆", fontSize = 40.sp) // 也可以展示本地的 3D 图标或者图片
                    }
                }
            }

            // 2. 今日活动圆环 (Canvas 组件)
            item {
                ActivityRings(
                    calories = todayStats.caloriesBurned,
                    duration = todayStats.totalDuration,
                    workouts = todayStats.workoutsCompleted,
                    streak = todayStats.currentStreak
                )
            }

            // 3. 本周目标 (带 ProgressBar)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("🎯", fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("本周目标", fontWeight = FontWeight.Black, fontSize = 16.sp)
                            }
                            Box(
                                modifier = Modifier
                                    .background(MaterialTheme.colorScheme.surfaceVariant, shape = RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    "${weeklyGoal.current} / ${weeklyGoal.target} 次",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(14.dp))
                        
                        // 进度条
                        LinearProgressIndicator(
                            progress = (weeklyGoal.percentage / 100f).toFloat().coerceIn(0f, 1f),
                            color = CandyBlueDark,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(10.dp)
                                .clip(RoundedCornerShape(5.dp))
                        )
                        
                        Spacer(modifier = Modifier.height(10.dp))
                        
                        Text(
                            text = if (weeklyGoal.current >= weeklyGoal.target) "🎉 太棒了！本周目标达成！"
                            else "加油！本周还需要 ${weeklyGoal.target - weeklyGoal.current} 次训练 💪",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (weeklyGoal.current >= weeklyGoal.target) CandyMintDark else Color.Gray,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }

            // 4. 快速开始 (力量/有氧 选择器)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("▶️", fontSize = 18.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("快速开始", fontWeight = FontWeight.Black, fontSize = 16.sp)
                        }
                        
                        Spacer(modifier = Modifier.height(14.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // 力量按钮
                            Button(
                                onClick = { onQuickStartAction("Strength") },
                                colors = ButtonDefaults.buttonColors(containerColor = CandyBlue),
                                shape = RoundedCornerShape(18.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .height(90.dp)
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("🏋️", fontSize = 24.sp)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("力量训练", color = Color(0xFF1E3A8A), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }

                            // 有氧按钮
                            Button(
                                onClick = { onQuickStartAction("Cardio") },
                                colors = ButtonDefaults.buttonColors(containerColor = CandyPink),
                                shape = RoundedCornerShape(18.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .height(90.dp)
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("🔥", fontSize = 24.sp)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("有氧心肺", color = Color(0xFF9D174D), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }

            // 5. 最近训练记录列表
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("⏱️", fontSize = 18.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("最近训练", fontWeight = FontWeight.Black, fontSize = 16.sp)
                            }
                            
                            Row(
                                modifier = Modifier.clickable { onNavigateToTab("training") },
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("查看全部", fontSize = 11.sp, color = CandyBlueDark, fontWeight = FontWeight.Bold)
                                Icon(Icons.Default.KeyboardArrowRight, contentDescription = null, tint = CandyBlueDark, modifier = Modifier.size(14.dp))
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(14.dp))
                        
                        if (recentWorkouts.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 24.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("🦆", fontSize = 32.sp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text("暂无运动记录，点击上方按钮开始打卡！", fontSize = 11.sp, color = Color.Gray)
                                }
                            }
                        } else {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                recentWorkouts.forEach { workout ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(
                                                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                                shape = RoundedCornerShape(16.dp)
                                            )
                                            .padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(40.dp)
                                                    .background(Color.White, shape = RoundedCornerShape(12.dp)),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(if (workout.type == "Strength") "🏋️" else "🏃", fontSize = 18.sp)
                                            }
                                            Spacer(modifier = Modifier.width(10.dp))
                                            Column {
                                                Text(
                                                    workout.name,
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 13.sp,
                                                    color = MaterialTheme.colorScheme.onSurface
                                                )
                                                Text(
                                                    "${workout.date} | 场所: ${workout.environmentName ?: "户外"}",
                                                    fontSize = 10.sp,
                                                    color = Color.Gray
                                                )
                                            }
                                        }
                                        
                                        // 持续时间标签
                                        Box(
                                            modifier = Modifier
                                                .background(Color.White, shape = CircleShape)
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                "${workout.duration}m",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Color.DarkGray
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
