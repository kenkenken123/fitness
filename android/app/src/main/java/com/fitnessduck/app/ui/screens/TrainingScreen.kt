package com.fitnessduck.app.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitnessduck.app.data.model.User
import com.fitnessduck.app.data.model.WorkoutLog
import com.fitnessduck.app.data.model.WorkoutSet
import com.fitnessduck.app.ui.components.GenerateWorkoutDialog
import com.fitnessduck.app.ui.theme.*
import com.fitnessduck.app.viewmodel.MainViewModel
import kotlinx.coroutines.launch

/**
 * 训练记录列表页面 (包含 AI 计划生成)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TrainingScreen(
    user: User,
    viewModel: MainViewModel,
    quickStartFocus: String? = null,
    onClearQuickStart: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    val workoutLogs by viewModel.workoutLogs.collectAsState()
    val environments by viewModel.environments.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var showGenerateDialog by remember { mutableStateOf(false) }
    var expandedLogId by remember { mutableStateOf<Int?>(null) }
    
    // 动作详情指南 Dialog 状态
    var activeExerciseName by remember { mutableStateOf<String?>(null) }
    var exerciseInstruction by remember { mutableStateOf<String?>(null) }
    var loadingInstruction by remember { mutableStateOf(false) }

    // 监听首页快捷跳转
    LaunchedEffect(quickStartFocus) {
        if (quickStartFocus != null) {
            viewModel.loadEnvironments(user.id)
            showGenerateDialog = true
        }
    }

    LaunchedEffect(user.id) {
        viewModel.loadWorkoutLogs(user.id)
        viewModel.loadEnvironments(user.id)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            // 顶部 Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "训练日志 📝",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onBackground
                )

                // 呼唤 AI 悬浮按钮
                Button(
                    onClick = { showGenerateDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = CandyLavenderDark),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🧠 AI 生成", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            if (isLoading && workoutLogs.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = CandyLavenderDark)
                }
            } else if (workoutLogs.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🦆", fontSize = 48.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("还没有健身记录鸭！", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("点击右上角 [AI 生成] 基于你现有的器材定制计划", fontSize = 12.sp, color = Color.Gray)
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(bottom = 100.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(workoutLogs, key = { it.id }) { log ->
                        WorkoutLogCard(
                            log = log,
                            isExpanded = expandedLogId == log.id,
                            onToggleExpand = {
                                expandedLogId = if (expandedLogId == log.id) null else log.id
                            },
                            onExerciseClick = { actName ->
                                activeExerciseName = actName
                                loadingInstruction = true
                                coroutineScope.launch {
                                    // 模拟网络请求获取动作说明
                                    val repo = com.fitnessduck.app.data.repository.FitnessRepository()
                                    repo.getExerciseInstruction(actName).onSuccess { text ->
                                        exerciseInstruction = text
                                    }
                                    loadingInstruction = false
                                }
                            }
                        )
                    }
                }
            }
        }

        // AI 生成计划对话框
        if (showGenerateDialog) {
            GenerateWorkoutDialog(
                environments = environments,
                onDismiss = {
                    showGenerateDialog = false
                    onClearQuickStart()
                },
                onConfirm = { envId, focus ->
                    viewModel.generateWorkoutPlan(user.id, envId, focus)
                    showGenerateDialog = false
                    onClearQuickStart()
                }
            )
        }

        // 动作说明指南 Dialog
        if (activeExerciseName != null) {
            AlertDialog(
                onDismissRequest = {
                    activeExerciseName = null
                    exerciseInstruction = null
                },
                title = { Text("鸭鸭健身指南: $activeExerciseName 🦆", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
                text = {
                    if (loadingInstruction) {
                        Box(modifier = Modifier.fillMaxWidth().height(60.dp), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = CandyBlueDark)
                        }
                    } else {
                        Text(exerciseInstruction ?: "暂无此动作指南，多做有氧，注意安全鸭！", fontSize = 14.sp, lineHeight = 20.sp)
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            activeExerciseName = null
                            exerciseInstruction = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = CandyBlueDark)
                    ) {
                        Text("知道了", color = Color.White)
                    }
                },
                shape = RoundedCornerShape(20.dp)
            )
        }
    }
}

/**
 * 训练日志卡片 (带折叠与展开 WorkoutSet)
 */
@Composable
fun WorkoutLogCard(
    log: WorkoutLog,
    isExpanded: Boolean,
    onToggleExpand: () -> Unit,
    onExerciseClick: (String) -> Unit
) {
    val totalVolume = log.workoutSets.sumOf { (it.weight * it.sets * it.reps).toDouble() }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .clickable { onToggleExpand() },
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        log.name,
                        fontWeight = FontWeight.Black,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "打卡时间: ${log.startTime.substringBefore(" ")}",
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                }

                IconButton(onClick = onToggleExpand) {
                    Icon(
                        imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = Color.Gray
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 快捷指标 Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // 预估时长
                IndicatorTag(text = "⏱️ ${log.estimatedDuration ?: 40}分钟", color = CandyBlue)
                // 消耗卡路里
                IndicatorTag(text = "🔥 ${log.estimatedCalories ?: 300}kcal", color = CandyPink)
                // 容量统计
                if (totalVolume > 0) {
                    IndicatorTag(text = "🏋️ ${totalVolume.toInt()}kg 总量", color = CandyMint)
                }
            }

            // 展开的 WorkoutSets 动作组详情
            AnimatedVisibility(
                visible = isExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp)
                ) {
                    Divider(color = MaterialTheme.colorScheme.surfaceVariant, modifier = Modifier.padding(bottom = 12.dp))
                    
                    Text("锻炼组明细:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
                    
                    Spacer(modifier = Modifier.height(8.dp))

                    if (log.workoutSets.isEmpty()) {
                        Text("本训练暂无具体动作组数据", fontSize = 11.sp, color = Color.Gray)
                    } else {
                        log.workoutSets.forEachIndexed { index, set ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 6.dp)
                                    .background(
                                        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .clickable { onExerciseClick(set.activityName) }
                                    .padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                    Text(
                                        "${index + 1}. ${set.activityName}",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(
                                        imageVector = Icons.Default.Info,
                                        contentDescription = "查看指南",
                                        modifier = Modifier.size(12.dp),
                                        tint = CandyBlueDark
                                    )
                                }
                                
                                Text(
                                    text = if (set.weight > 0) "${set.weight}kg x ${set.sets}组 x ${set.reps}次" 
                                           else "${set.sets}组 x ${set.reps}次",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.Gray
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun IndicatorTag(text: String, color: Color) {
    Box(
        modifier = Modifier
            .background(color.copy(alpha = 0.15f), shape = RoundedCornerShape(8.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(text = text, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
    }
}
