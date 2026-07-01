package com.fitnessduck.app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.fitnessduck.app.data.repository.FitnessRepository
import com.fitnessduck.app.ui.screens.*
import com.fitnessduck.app.ui.theme.*
import com.fitnessduck.app.viewmodel.AuthViewModel
import com.fitnessduck.app.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 统一的手动依赖注入
        val repository = FitnessRepository()

        setContent {
            val context = LocalContext.current
            
            // 使用简易的 Factory 实例化 ViewModel
            val authViewModel: AuthViewModel = ViewModelProvider(
                this,
                ViewModelFactory(application, repository)
            )[AuthViewModel::class.java]

            val mainViewModel: MainViewModel = ViewModelProvider(
                this,
                ViewModelFactory(application, repository)
            )[MainViewModel::class.java]

            // 监听全局业务提示 Toast 消息
            val message by mainViewModel.message.collectAsState()
            LaunchedEffect(message) {
                message?.let {
                    Toast.makeText(context, it, Toast.LENGTH_SHORT).show()
                    mainViewModel.clearMessage()
                }
            }

            FitnessDuckTheme {
                val currentUser by authViewModel.currentUser.collectAsState()
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    if (currentUser == null) {
                        // 未登录，展示登录页面
                        LoginScreen(
                            viewModel = authViewModel,
                            onLoginSuccess = {
                                Toast.makeText(context, "欢迎回来, 鸭鸭打卡成功！🦆", Toast.LENGTH_SHORT).show()
                            }
                        )
                    } else {
                        // 已登录，进入主导航页面
                        MainAppContent(
                            user = currentUser!!,
                            authViewModel = authViewModel,
                            mainViewModel = mainViewModel
                        )
                    }
                }
            }
        }
    }
}

/**
 * 主页面导航外壳 (包含 BottomBar)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppContent(
    user: com.fitnessduck.app.data.model.User,
    authViewModel: AuthViewModel,
    mainViewModel: MainViewModel
) {
    val navController = rememberNavController()
    
    // 用于处理首页的快速开始动作中继
    var quickStartFocus by remember { mutableStateOf<String?>(null) }

    // 底部导航栏定义
    val navigationItems = listOf(
        NavigationItem.Home,
        NavigationItem.Training,
        NavigationItem.Locations,
        NavigationItem.Profile
    )

    Scaffold(
        bottomBar = {
            NavigationBar(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
                    .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)),
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                navigationItems.forEach { item ->
                    val isSelected = currentRoute?.startsWith(item.route) == true
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = {
                            Icon(
                                imageVector = if (isSelected) item.selectedIcon else item.unselectedIcon,
                                contentDescription = item.title,
                                tint = if (isSelected) CandyBlueDark else Color.Gray
                            )
                        },
                        label = {
                            Text(
                                text = item.title,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) CandyBlueDark else Color.Gray
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = CandyBlue.copy(alpha = 0.2f)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = NavigationItem.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            // Tab 1: 首页
            composable(NavigationItem.Home.route) {
                HomeScreen(
                    user = user,
                    viewModel = mainViewModel,
                    onNavigateToTab = { tab ->
                        navController.navigate(tab) {
                            popUpTo(navController.graph.findStartDestination().id)
                            launchSingleTop = true
                        }
                    },
                    onQuickStartAction = { focus ->
                        quickStartFocus = focus
                        navController.navigate(NavigationItem.Training.route) {
                            popUpTo(navController.graph.findStartDestination().id)
                            launchSingleTop = true
                        }
                    }
                )
            }

            // Tab 2: 历史训练记录
            composable(NavigationItem.Training.route) {
                TrainingScreen(
                    user = user,
                    viewModel = mainViewModel,
                    quickStartFocus = quickStartFocus,
                    onClearQuickStart = { quickStartFocus = null }
                )
            }

            // Tab 3: 环境管理 (带详情路由嵌套)
            composable(NavigationItem.Locations.route) {
                LocationsScreen(
                    user = user,
                    viewModel = mainViewModel,
                    onNavigateToDetail = { id ->
                        navController.navigate("location_detail/$id")
                    }
                )
            }

            // 环境详情页面路由
            composable(
                route = "location_detail/{id}",
                arguments = listOf(navArgument("id") { type = NavType.IntType })
            ) { backStackEntry ->
                val id = backStackEntry.arguments?.getInt("id") ?: 0
                LocationDetailScreen(
                    user = user,
                    environmentId = id,
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            // Tab 4: 个人中心
            composable(NavigationItem.Profile.route) {
                ProfileScreen(
                    user = user,
                    authViewModel = authViewModel,
                    mainViewModel = mainViewModel
                )
            }
        }
    }
}

/**
 * 底部导航元素模型
 */
sealed class NavigationItem(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    object Home : NavigationItem("home", "首页", Icons.Default.Home, Icons.Default.Home)
    object Training : NavigationItem("training", "训练", Icons.Default.PlayArrow, Icons.Default.PlayArrow)
    object Locations : NavigationItem("locations", "场所", Icons.Default.Place, Icons.Default.Place)
    object Profile : NavigationItem("profile", "我", Icons.Default.Person, Icons.Default.Person)
}

/**
 * 通用 ViewModel 实例化工厂 (手动 DI 封装)
 */
class ViewModelFactory(
    private val application: android.app.Application,
    private val repository: FitnessRepository
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(AuthViewModel::class.java) -> {
                AuthViewModel(application, repository) as T
            }
            modelClass.isAssignableFrom(MainViewModel::class.java) -> {
                MainViewModel(repository) as T
            }
            else -> throw IllegalArgumentException("未知 ViewModel 类型: ${modelClass.name}")
        }
    }
}
