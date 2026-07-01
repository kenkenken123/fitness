package com.fitnessduck.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitnessduck.app.data.model.TrainingEnvironment
import com.fitnessduck.app.data.model.User
import com.fitnessduck.app.ui.components.AddEnvironmentDialog
import com.fitnessduck.app.ui.theme.*
import com.fitnessduck.app.viewmodel.MainViewModel

/**
 * 训练环境列表页面
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocationsScreen(
    user: User,
    viewModel: MainViewModel,
    onNavigateToDetail: (environmentId: Int) -> Unit
) {
    val environments by viewModel.environments.collectAsState()
    val allEquipments by viewModel.allEquipments.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val message by viewModel.message.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }

    LaunchedEffect(user.id) {
        viewModel.loadEnvironments(user.id)
        viewModel.loadAllEquipments(user.id)
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
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "训练场所 📍",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onBackground
                )

                // 添加场所按钮
                IconButton(
                    onClick = { showAddDialog = true },
                    modifier = Modifier
                        .background(CandyBlueDark, shape = RoundedCornerShape(12.dp))
                        .size(40.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", tint = Color.White)
                }
            }

            if (isLoading && environments.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = CandyBlueDark)
                }
            } else if (environments.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🦆", fontSize = 48.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("还没有训练场所鸭！", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("点击右上角 [+] 创建你在家里或健身房的训练角落", fontSize = 12.sp, color = Color.Gray)
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(bottom = 100.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(environments, key = { it.id }) { env ->
                        EnvironmentCard(
                            env = env,
                            onClick = { onNavigateToDetail(env.id) },
                            onDelete = { viewModel.deleteEnvironment(env.id, user.id) }
                        )
                    }
                }
            }
        }

        // 添加环境 Dialog
        if (showAddDialog) {
            AddEnvironmentDialog(
                availableEquipments = allEquipments,
                onDismiss = { showAddDialog = false },
                onConfirm = { name, description, equipmentIds ->
                    viewModel.createEnvironment(user.id, name, description, equipmentIds)
                    showAddDialog = false
                }
            )
        }
    }
}

@Composable
fun EnvironmentCard(
    env: TrainingEnvironment,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    env.name,
                    fontWeight = FontWeight.Black,
                    fontSize = 18.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red.copy(alpha = 0.6f))
                }
            }
            
            if (!env.description.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(env.description, fontSize = 12.sp, color = Color.Gray)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // 器材概览
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // 显示包含的器材数
                Box(
                    modifier = Modifier
                        .background(CandyMint.copy(alpha = 0.15f), shape = RoundedCornerShape(8.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        "拥有器材: ${env.equipments.size} 个",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = CandyMintDark
                    )
                }
                
                Text(
                    "管理设备 & AI识别 ➔",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = CandyBlueDark
                )
            }
        }
    }
}
