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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部欢迎区域 */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">你好, {user.username}!</h1>
            <p className="text-orange-100 mt-1">准备好今天的训练了吗？</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
        </div>

        {/* 今日统计 */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{todayStats.workoutsCompleted}</div>
            <div className="text-xs text-orange-100">训练</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{todayStats.caloriesBurned}</div>
            <div className="text-xs text-orange-100">卡路里</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{todayStats.totalDuration}</div>
            <div className="text-xs text-orange-100">分钟</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{todayStats.currentStreak}</div>
            <div className="text-xs text-orange-100">连续天</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 本周目标 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-orange-500" />
              本周目标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">训练进度</span>
              <span className="text-sm font-medium">
                {weeklyGoal.current}/{weeklyGoal.target} 次
              </span>
            </div>
            <Progress value={weeklyGoal.percentage} className="h-2 mb-2" />
            <p className="text-xs text-gray-500">
              {weeklyGoal.current >= weeklyGoal.target 
                ? "恭喜完成本周目标！" 
                : `还需要 ${weeklyGoal.target - weeklyGoal.current} 次训练完成本周目标`
              }
            </p>
          </CardContent>
        </Card>

        {/* 快速开始 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Play className="w-5 h-5 text-green-500" />
              快速开始
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-16 flex-col gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Dumbbell className="w-5 h-5" />
                <span className="text-xs">力量训练</span>
              </Button>
              <Button className="h-16 flex-col gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                <Flame className="w-5 h-5" />
                <span className="text-xs">有氧运动</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 最近训练 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-purple-500" />
              最近训练
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{workout.name}</h4>
                      <p className="text-xs text-gray-500">{formatDate(workout.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
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
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">暂无训练记录，开始您的第一次训练吧！</p>
              </div>
            )}
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
