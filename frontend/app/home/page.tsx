"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Target, Flame, Clock, Play, Award } from "lucide-react"
import { useAuth } from "../../src/context/AuthContext"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import axios from "axios"

interface DashboardData {
  userId: number
  username: string
  displayName: string
  todayStats: {
    workoutsCompleted: number
    caloriesBurned: number
    totalDuration: number
    currentStreak: number
  }
  weeklyGoal: {
    current: number
    target: number
    percentage: number
  }
  recentWorkouts: {
    id: number
    name: string
    date: string
    duration: number
    calories: number
    type: string
    environmentName?: string
  }[]
  achievements: {
    id: number
    name: string
    icon: string
    type: string
    earnedDate: string
  }[]
}

const Home = () => {
  const auth = useAuth();
  const user = auth?.user;
  const isLoading = auth?.isLoading;
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`/api/workouts/users/${user?.id}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error("获取仪表盘数据失败", error);
    } finally {
      setLoadingData(false);
    }
  };

  // 如果正在加载，显示加载状态
  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果加载完成但用户为 null，则重定向到登录页面
  if (!user) {
    router.push("/");
    return null;
  }

  // 如果没有数据，使用默认值
  const todayStats = dashboardData?.todayStats || {
    workoutsCompleted: 0,
    caloriesBurned: 0,
    totalDuration: 0,
    currentStreak: 0
  };

  const weeklyGoal = dashboardData?.weeklyGoal || {
    current: 0,
    target: 6,
    percentage: 0
  };

  const recentWorkouts = dashboardData?.recentWorkouts || [];
  const achievements = dashboardData?.achievements || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "今天";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "昨天";
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* 头部欢迎区域 */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-4 sm:p-6 pb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">你好, {user.username}!</h1>
              <p className="text-blue-100 text-xs sm:text-sm">准备好今天的训练了吗？</p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ml-3">
              <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>

          {/* 今日统计 */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold mb-1">{todayStats.workoutsCompleted}</div>
              <div className="text-xs text-blue-100">训练</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold mb-1">{todayStats.caloriesBurned}</div>
              <div className="text-xs text-blue-100">卡路里</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold mb-1">{todayStats.totalDuration}</div>
              <div className="text-xs text-blue-100">分钟</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold mb-1">{todayStats.currentStreak}</div>
              <div className="text-xs text-blue-100">连续天</div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 -mt-6 relative z-10 space-y-6">
        {/* 本周目标 */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">本周目标</CardTitle>
                <p className="text-xs sm:text-sm text-gray-500">训练进度追踪</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">训练进度</span>
              <span className="text-sm font-medium">
                {weeklyGoal.current}/{weeklyGoal.target} 次
              </span>
            </div>
            <Progress value={weeklyGoal.percentage} className="h-2 mb-3" />
            <p className="text-xs text-gray-500">
              {weeklyGoal.current >= weeklyGoal.target 
                ? "恭喜完成本周目标！" 
                : `还需要 ${weeklyGoal.target - weeklyGoal.current} 次训练完成本周目标`
              }
            </p>
          </CardContent>
        </Card>

        {/* 快速开始 */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">快速开始</CardTitle>
                <p className="text-xs sm:text-sm text-gray-500">选择训练类型</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-16 flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
                <Dumbbell className="w-5 h-5" />
                <span className="text-xs font-medium">力量训练</span>
              </Button>
              <Button className="h-16 flex-col gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
                <Flame className="w-5 h-5" />
                <span className="text-xs font-medium">有氧运动</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 最近训练 */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">最近训练</CardTitle>
                <p className="text-xs sm:text-sm text-gray-500">训练历史记录</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {recentWorkouts.length > 0 ? (
                recentWorkouts.map((workout, index) => (
                  <div 
                    key={workout.id} 
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200 hover:border-blue-200 hover:shadow-lg"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Dumbbell className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate">{workout.name}</h4>
                        <p className="text-xs text-gray-500">{formatDate(workout.date)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        {workout.duration}分钟
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Flame className="w-3 h-3" />
                        {workout.calories}卡
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                    <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">暂无训练记录</h3>
                  <p className="text-gray-500 text-sm">开始您的第一次训练吧！</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 成就徽章 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-yellow-500" />
              最新成就
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {achievements.map((achievement) => (
                  <Badge 
                    key={achievement.id} 
                    variant="secondary" 
                    className="bg-yellow-100 text-yellow-800"
                  >
                    {achievement.icon} {achievement.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">暂无成就，加油训练吧！</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Home
