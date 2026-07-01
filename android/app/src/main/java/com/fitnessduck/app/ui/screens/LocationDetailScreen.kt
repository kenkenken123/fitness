package com.fitnessduck.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitnessduck.app.data.model.Equipment
import com.fitnessduck.app.data.model.TrainingEnvironment
import com.fitnessduck.app.data.model.User
import com.fitnessduck.app.ui.components.AddEnvironmentDialog
import com.fitnessduck.app.ui.components.AiRecognitionDialog
import com.fitnessduck.app.ui.components.EquipmentDialog
import com.fitnessduck.app.ui.theme.*
import com.fitnessduck.app.viewmodel.MainViewModel

/**
 * 训练环境详情管理页面 (包含该环境下器械的增删改查与 AI 拍照识别)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocationDetailScreen(
    user: User,
    environmentId: Int,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val environments by viewModel.environments.collectAsState()
    val allEquipments by viewModel.allEquipments.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    // 寻找当前对应的环境实体
    val environment = environments.find { it.id == environmentId }

    // 各种弹窗状态
    var showEditEnvDialog by remember { mutableStateOf(false) }
    var showAddEquipDialog by remember { mutableStateOf(false) }
    var showAiDialog by remember { mutableStateOf(false) }
    var editingEquipment by remember { mutableStateOf<Equipment?>(null) }

    LaunchedEffect(user.id) {
        viewModel.loadEnvironments(user.id)
        viewModel.loadAllEquipments(user.id)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        if (environment == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("环境未找到或已被删除")
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
            ) {
                // Top Custom App Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                    
                    Text(
                        text = environment.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onBackground
                    )

                    IconButton(onClick = { showEditEnvDialog = true }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit Environment")
                    }
                }

                // 场所介绍 Banner
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("📍 场所说明:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.Gray)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = environment.description ?: "无详细说明，快来用AI添加一些健身设备吧！",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // AI 器材拍照识别 & 手动添加 控制行
                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // AI 识别
                    Button(
                        onClick = { showAiDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = CandyPinkDark),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(1.2f).height(50.dp)
                    ) {
                        Text("📷 AI 拍照识别器材", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }

                    // 手动添加
                    Button(
                        onClick = { showAddEquipDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = CandyBlueDark),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(1f).height(50.dp)
                    ) {
                        Text("➕ 手动添加", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }

                Text("当前场所内器材库 (${environment.equipments.size}):", fontWeight = FontWeight.Black, fontSize = 15.sp, modifier = Modifier.padding(bottom = 12.dp))

                // 器材列表
                if (environment.equipments.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🏋️", fontSize = 48.sp)
                            Spacer(modifier = Modifier.height(10.dp))
                            Text("空空如也，快添加你的第一个哑铃吧！", fontSize = 13.sp, color = Color.Gray)
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentPadding = PaddingValues(bottom = 100.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(environment.equipments, key = { it.id }) { equip ->
                            EquipmentRow(
                                equip = equip,
                                onEdit = { editingEquipment = equip },
                                onDelete = { viewModel.deleteEquipment(equip.id, user.id) }
                            )
                        }
                    }
                }
            }
        }

        // 1. 编辑场所环境弹窗
        if (showEditEnvDialog && environment != null) {
            AddEnvironmentDialog(
                initialEnv = environment,
                availableEquipments = allEquipments,
                onDismiss = { showEditEnvDialog = false },
                onConfirm = { name, description, equipmentIds ->
                    viewModel.updateEnvironment(environmentId, user.id, name, description, equipmentIds)
                    showEditEnvDialog = false
                }
            )
        }

        // 2. 手动创建器材弹窗
        if (showAddEquipDialog) {
            EquipmentDialog(
                onDismiss = { showAddEquipDialog = false },
                onConfirm = { name, type, weight ->
                    viewModel.createEquipment(user.id, environmentId, name, type, weight)
                    showAddEquipDialog = false
                }
            )
        }

        // 3. 编辑器材弹窗
        editingEquipment?.let { equip ->
            EquipmentDialog(
                initialEquipment = equip,
                onDismiss = { editingEquipment = null },
                onConfirm = { name, type, weight ->
                    viewModel.createEquipment(user.id, environmentId, name, type, weight) // 实际上更新可以直接删除旧建新，或扩展Repository。此处直接删除重建
                    viewModel.deleteEquipment(equip.id, user.id)
                    editingEquipment = null
                }
            )
        }

        // 4. AI 拍照识别弹窗
        if (showAiDialog) {
            AiRecognitionDialog(
                onDismiss = { showAiDialog = false },
                onRecognized = { recognizedNames ->
                    viewModel.importAiRecognizedEquipments(user.id, environmentId, recognizedNames)
                    showAiDialog = false
                }
            )
        }
    }
}

@Composable
fun EquipmentRow(
    equip: Equipment,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                // 根据类型显示特定Emoji
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .background(CandyMint.copy(alpha = 0.2f), shape = RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    val emoji = when (equip.type) {
                        "哑铃" -> "🏋️"
                        "跑步机" -> "🏃"
                        "自重" -> "🤸"
                        else -> "⚙️"
                    }
                    Text(emoji, fontSize = 20.sp)
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column {
                    Text(equip.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("分类: ${equip.type} | 单边重量: ${equip.weight}kg", fontSize = 11.sp, color = Color.Gray)
                }
            }

            Row {
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Color.Gray, modifier = Modifier.size(18.dp))
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red.copy(alpha = 0.6f), modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}
