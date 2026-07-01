package com.fitnessduck.app.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitnessduck.app.ui.theme.*

/**
 * 健身鸭特色的活动圆环组件
 * 使用 Canvas 绘制三个同心渐进圆环：
 * 外环 - 卡路里 (CandyPink)
 * 中环 - 锻炼时长 (CandyMint)
 * 内环 - 训练次数 (CandyBlue)
 */
@Composable
fun ActivityRings(
    calories: Int,
    duration: Int,
    workouts: Int,
    streak: Int,
    modifier: Modifier = Modifier
) {
    // 动画状态
    val caloriesAnim = remember { Animatable(0f) }
    val durationAnim = remember { Animatable(0f) }
    val workoutsAnim = remember { Animatable(0f) }

    // 目标比例（假设卡路里目标 500kcal，时长 30分钟，训练次数 1次）
    val caloriesTarget = 500f
    val durationTarget = 30f
    val workoutsTarget = 1f

    val caloriesProgress = (calories / caloriesTarget).coerceIn(0f, 1.5f) // 允许超额完成，最多画到 1.5 圈
    val durationProgress = (duration / durationTarget).coerceIn(0f, 1.5f)
    val workoutsProgress = (workouts / workoutsTarget).coerceIn(0f, 1.5f)

    LaunchedEffect(caloriesProgress, durationProgress, workoutsProgress) {
        caloriesAnim.animateTo(caloriesProgress, animationSpec = tween(1200))
    }
    LaunchedEffect(durationProgress) {
        durationAnim.animateTo(durationProgress, animationSpec = tween(1200))
    }
    LaunchedEffect(workoutsProgress) {
        workoutsAnim.animateTo(workoutsProgress, animationSpec = tween(1200))
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(
                color = if (MaterialTheme.colorScheme.background == BackgroundDark) SurfaceDark else Color.White,
                shape = RoundedCornerShape(32.dp)
            )
            .padding(20.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        // Left: 仪表盘圆环绘制
        Box(
            modifier = Modifier
                .size(150.dp)
                .padding(4.dp),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val strokeWidth = 12.dp.toPx()
                val spacing = 4.dp.toPx()
                val centerOffset = Offset(size.width / 2, size.height / 2)

                // 1. 最外环：卡路里环 (Radius: Max)
                val r1 = (size.width / 2) - strokeWidth / 2
                // 背景轨道
                drawCircle(
                    color = CandyPink.copy(alpha = 0.15f),
                    radius = r1,
                    center = centerOffset,
                    style = Stroke(width = strokeWidth)
                )
                // 进度弧
                drawArc(
                    color = CandyPinkDark,
                    startAngle = -90f,
                    sweepAngle = caloriesAnim.value * 360f,
                    useCenter = false,
                    topLeft = Offset(centerOffset.x - r1, centerOffset.y - r1),
                    size = Size(r1 * 2, r1 * 2),
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )

                // 2. 中环：时长环 (Radius: R1 - strokeWidth - spacing)
                val r2 = r1 - strokeWidth - spacing
                // 背景轨道
                drawCircle(
                    color = CandyMint.copy(alpha = 0.15f),
                    radius = r2,
                    center = centerOffset,
                    style = Stroke(width = strokeWidth)
                )
                // 进度弧
                drawArc(
                    color = CandyMintDark,
                    startAngle = -90f,
                    sweepAngle = durationAnim.value * 360f,
                    useCenter = false,
                    topLeft = Offset(centerOffset.x - r2, centerOffset.y - r2),
                    size = Size(r2 * 2, r2 * 2),
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )

                // 3. 内环：次数环 (Radius: R2 - strokeWidth - spacing)
                val r3 = r2 - strokeWidth - spacing
                // 背景轨道
                drawCircle(
                    color = CandyBlue.copy(alpha = 0.15f),
                    radius = r3,
                    center = centerOffset,
                    style = Stroke(width = strokeWidth)
                )
                // 进度弧
                drawArc(
                    color = CandyBlueDark,
                    startAngle = -90f,
                    sweepAngle = workoutsAnim.value * 360f,
                    useCenter = false,
                    topLeft = Offset(centerOffset.x - r3, centerOffset.y - r3),
                    size = Size(r3 * 2, r3 * 2),
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
            }
            // 鸭子吉祥物或数据指示
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("🔥 $streak 天", fontSize = 16.sp, fontWeight = FontWeight.Black, color = GoldYellow)
                Text("连续打卡", fontSize = 9.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.width(16.dp))

        // Right: 属性数据说明
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.Center
        ) {
            // 卡路里
            StatRow(
                icon = "🔥",
                label = "卡路里",
                value = "$calories / 500 kcal",
                color = CandyPinkDark
            )
            Spacer(modifier = Modifier.height(10.dp))
            // 时长
            StatRow(
                icon = "⏱️",
                label = "运动时长",
                value = "$duration / 30 分钟",
                color = CandyMintDark
            )
            Spacer(modifier = Modifier.height(10.dp))
            // 次数
            StatRow(
                icon = "🏋️",
                label = "训练次数",
                value = "$workouts / 1 次",
                color = CandyBlueDark
            )
        }
    }
}

@Composable
private fun StatRow(
    icon: String,
    label: String,
    value: String,
    color: Color
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .background(color.copy(alpha = 0.15f), shape = RoundedCornerShape(6.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(icon, fontSize = 12.sp)
        }
        Spacer(modifier = Modifier.width(8.dp))
        Column {
            Text(label, fontSize = 10.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
            Text(value, fontSize = 13.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}
