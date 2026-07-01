package com.fitnessduck.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.fitnessduck.app.data.model.Equipment
import com.fitnessduck.app.data.model.TrainingEnvironment
import com.fitnessduck.app.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * 1. 添加/编辑训练环境对话框
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEnvironmentDialog(
    initialEnv: TrainingEnvironment? = null,
    availableEquipments: List<Equipment>,
    onDismiss: () -> Unit,
    onConfirm: (name: String, description: String?, equipmentIds: List<Int>) -> Unit
) {
    var name by remember { mutableStateOf(initialEnv?.name ?: "") }
    var description by remember { mutableStateOf(initialEnv?.description ?: "") }
    val selectedIds = remember { mutableStateListOf<Int>().apply { 
        initialEnv?.equipments?.map { it.id }?.let { addAll(it) }
    }}

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (initialEnv == null) "添加新环境 🏠" else "编辑环境 ⚙️",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("环境名称 (如: 家里、健身房)") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("环境说明 (选填)") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                Text("选择已有关联器材:", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                
                if (availableEquipments.isEmpty()) {
                    Text("暂无可用器材，可在环境详情内单独添加", color = Color.Gray, fontSize = 12.sp)
                } else {
                    Box(modifier = Modifier.height(150.dp)) {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(availableEquipments) { equip ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            if (selectedIds.contains(equip.id)) {
                                                selectedIds.remove(equip.id)
                                            } else {
                                                selectedIds.add(equip.id)
                                            }
                                        }
                                        .background(
                                            if (selectedIds.contains(equip.id)) CandyBlue.copy(alpha = 0.2f) else Color.Transparent,
                                            shape = RoundedCornerShape(8.dp)
                                        )
                                        .padding(8.dp)
                                ) {
                                    Checkbox(
                                        checked = selectedIds.contains(equip.id),
                                        onCheckedChange = { checked ->
                                            if (checked == true) selectedIds.add(equip.id) else selectedIds.remove(equip.id)
                                        }
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(equip.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text("类型: ${equip.type} | 重量: ${equip.weight}kg", fontSize = 11.sp, color = Color.Gray)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { if (name.isNotBlank()) onConfirm(name, description, selectedIds.toList()) },
                colors = ButtonDefaults.buttonColors(containerColor = CandyBlueDark),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("确定", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        },
        shape = RoundedCornerShape(28.dp)
    )
}

/**
 * 2. 添加/编辑器材对话框
 */
@Composable
fun EquipmentDialog(
    initialEquipment: Equipment? = null,
    onDismiss: () -> Unit,
    onConfirm: (name: String, type: String, weight: Double) -> Unit
) {
    var name by remember { mutableStateOf(initialEquipment?.name ?: "") }
    var type by remember { mutableStateOf(initialEquipment?.type ?: "哑铃") }
    var weightStr by remember { mutableStateOf(initialEquipment?.weight?.toString() ?: "0.0") }

    val types = listOf("哑铃", "杠铃", "跑步机", "自重", "辅助器材", "其它")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (initialEquipment == null) "添加器材 🏋️" else "编辑器材 ✏️",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("器材名称 (如: 10kg哑铃)") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                
                Text("器材类型:", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // 简易 Dropdown 模拟，使用 Scrollable Row 供快速选择
                    Box(modifier = Modifier.height(40.dp)) {
                        LazyColumn(modifier = Modifier.fillMaxWidth()) {
                            // 为了界面整洁，直接使用简易 Selectable Text
                        }
                    }
                }
                
                // 选择分类的单选框集合
                Column {
                    types.chunked(3).forEach { rowList ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            rowList.forEach { t ->
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .padding(vertical = 4.dp)
                                        .background(
                                            if (type == t) CandyMint.copy(alpha = 0.2f) else Color.Transparent,
                                            shape = RoundedCornerShape(8.dp)
                                        )
                                        .border(
                                            width = 1.dp,
                                            color = if (type == t) CandyMintDark else Color.LightGray,
                                            shape = RoundedCornerShape(8.dp)
                                        )
                                        .clickable { type = t }
                                        .padding(8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(t, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (type == t) CandyMintDark else Color.Gray)
                                }
                            }
                        }
                    }
                }

                OutlinedTextField(
                    value = weightStr,
                    onValueChange = { weightStr = it },
                    label = { Text("重量 (kg)") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val weight = weightStr.toDoubleOrNull() ?: 0.0
                    if (name.isNotBlank()) onConfirm(name, type, weight)
                },
                colors = ButtonDefaults.buttonColors(containerColor = CandyMintDark),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("保存", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        },
        shape = RoundedCornerShape(28.dp)
    )
}

/**
 * 3. AI 拍照识别器材对话框 (离线/在线模拟)
 */
@Composable
fun AiRecognitionDialog(
    onDismiss: () -> Unit,
    onRecognized: (List<String>) -> Unit
) {
    var step by remember { mutableStateOf(1) } // 1: 准备拍照, 2: 正在AI识别中, 3: 识别成功
    val coroutineScope = rememberCoroutineScope()
    var resultList by remember { mutableStateOf<List<String>>(emptyList()) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(28.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                if (step == 1) {
                    Text("📷 AI 器材拍照识别", fontSize = 20.sp, fontWeight = FontWeight.Black, color = CandyPinkDark)
                    Spacer(modifier = Modifier.height(16.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .background(Color.DarkGray.copy(alpha = 0.1f), shape = RoundedCornerShape(16.dp))
                            .border(2.dp, CandyPink.copy(alpha = 0.5f), shape = RoundedCornerShape(16.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("点击下方按钮拍摄或上传\n一张健身器材的照片\n(健身鸭AI会自动识别器材与配置)", color = Color.Gray, textAlign = TextAlign.Center, fontSize = 13.sp)
                    }
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = {
                            step = 2
                            coroutineScope.launch {
                                delay(2000) // 模拟 AI 识别网络耗时
                                resultList = listOf("哑铃", "多功能仰卧板", "壶铃").shuffled().take(2)
                                step = 3
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = CandyPinkDark),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("模拟拍摄/上传图片 📸", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                } else if (step == 2) {
                    Text("🧠 健身鸭 AI 正在识别中...", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(24.dp))
                    CircularProgressIndicator(color = CandyPinkDark, strokeWidth = 5.dp)
                    Spacer(modifier = Modifier.height(24.dp))
                    Text("正在提取图片特征并匹配器材库\n请稍候鸭...", color = Color.Gray, textAlign = TextAlign.Center, fontSize = 12.sp)
                } else if (step == 3) {
                    Text("🎉 AI 识别成功！", fontSize = 20.sp, fontWeight = FontWeight.Black, color = CandyMintDark)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("健身鸭 AI 识别到以下器材：", fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    resultList.forEach { item ->
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .background(CandyMint.copy(alpha = 0.15f), shape = RoundedCornerShape(12.dp))
                                .padding(12.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Text("🦆 器材：$item (推荐导入)", fontWeight = FontWeight.Bold, color = CandyMintDark)
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        TextButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                            Text("取消")
                        }
                        Button(
                            onClick = {
                                onRecognized(resultList)
                                onDismiss()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = CandyMintDark),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1.5f)
                        ) {
                            Text("一键导入器材库", color = Color.White)
                        }
                    }
                }
            }
        }
    }
}

/**
 * 4. AI 智能生成训练计划对话框
 */
@Composable
fun GenerateWorkoutDialog(
    environments: List<TrainingEnvironment>,
    onDismiss: () -> Unit,
    onConfirm: (environmentId: Int, focus: String) -> Unit
) {
    var selectedEnvId by remember { mutableStateOf(environments.firstOrNull()?.id ?: 0) }
    var focus by remember { mutableStateOf("Strength") } // Strength 或 Cardio

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("🧠 AI 生成专属训练计划", fontWeight = FontWeight.Black, fontSize = 20.sp, color = CandyLavenderDark)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text("健身鸭 AI 会根据你所选择环境内的可用器械，针对性生成当天的训练内容与组数设计。", fontSize = 13.sp, color = Color.Gray)
                
                Text("1. 选择训练环境:", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                if (environments.isEmpty()) {
                    Text("⚠️ 没有检测到环境，请先去 [场所] 页面创建环境！", color = Color.Red, fontSize = 12.sp)
                } else {
                    // 环境选择卡片
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        environments.forEach { env ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        if (selectedEnvId == env.id) CandyLavender.copy(alpha = 0.2f) else Color.Transparent,
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .border(
                                        width = 1.dp,
                                        color = if (selectedEnvId == env.id) CandyLavenderDark else Color.LightGray,
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .clickable { selectedEnvId = env.id }
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = selectedEnvId == env.id,
                                    onClick = { selectedEnvId = env.id }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(env.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text("拥有器材数: ${env.equipments.size}", fontSize = 11.sp, color = Color.Gray)
                                }
                            }
                        }
                    }
                }

                Text("2. 选择训练偏好/焦点:", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .background(
                                if (focus == "Strength") CandyBlue.copy(alpha = 0.2f) else Color.Transparent,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .border(
                                width = 1.5.dp,
                                color = if (focus == "Strength") CandyBlueDark else Color.LightGray,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .clickable { focus = "Strength" }
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🏋️", fontSize = 24.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("力量训练", fontWeight = FontWeight.Black, fontSize = 13.sp, color = if (focus == "Strength") CandyBlueDark else Color.Gray)
                        }
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .background(
                                if (focus == "Cardio") CandyPink.copy(alpha = 0.2f) else Color.Transparent,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .border(
                                width = 1.5.dp,
                                color = if (focus == "Cardio") CandyPinkDark else Color.LightGray,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .clickable { focus = "Cardio" }
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🏃", fontSize = 24.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("有氧心肺", fontWeight = FontWeight.Black, fontSize = 13.sp, color = if (focus == "Cardio") CandyPinkDark else Color.Gray)
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (selectedEnvId > 0) {
                        onConfirm(selectedEnvId, focus)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = CandyLavenderDark),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("开始鸭 🚀", color = Color.White, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        },
        shape = RoundedCornerShape(28.dp)
    )
}
