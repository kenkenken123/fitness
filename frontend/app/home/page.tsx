"use client"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Target, Flame, Clock, Play, Award } from "lucide-react"
import ActivityRings from "@/components/ActivityRings"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-28">
      {/* 头部欢迎区域 */}
      {/* 头部欢迎区域 */}
      <div className="relative overflow-hidden">
        <div className="bg-candy-pink/20 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)] sm:p-6 rounded-b-[3rem]">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-candy-blue bg-white px-2 py-0.5 rounded-full shadow-sm">健身鸭 Fitness Duck 🦆</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-2">你好, {user.username}!</h1>
              <p className="text-gray-600 text-base">今天也要像鸭鸭一样强壮！💪</p>
            </div>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg ml-3 ring-4 ring-white/50 rotate-6 hover:rotate-12 transition-transform duration-300">
              <div className="rounded-full p-2 w-full h-full flex items-center justify-center overflow-hidden">
                <Image src="/icons/logo_muscle_duck_v2.png" alt="Fitness Duck Logo" width={70} height={70} className="object-contain" />
              </div>
            </div>
          </div>

          {/* 今日活动圆环 */}
          <div className="px-4 pb-2">
            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 shadow-sm border border-white/50 ring-4 ring-white/20">
              <ActivityRings
                calories={todayStats.caloriesBurned}
                duration={todayStats.totalDuration}
                workouts={todayStats.workoutsCompleted}
                streak={todayStats.currentStreak}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 mt-6 relative z-10 space-y-6">
        {/* 本周目标 */}
        <Card className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-white pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-candy-blue shadow-sm">
                <Image src="/icons/icon_target_cute.png" alt="Goal" width={32} height={32} className="object-cover" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">本周目标</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-bold">训练进度</span>
              <span className="text-sm font-black text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                {weeklyGoal.current}/{weeklyGoal.target} 次
              </span>
            </div>
            <Progress value={weeklyGoal.percentage} className="h-4 rounded-full bg-gray-100 [&>div]:bg-candy-blue" />
            <p className="text-xs text-gray-400 mt-3 font-medium text-center">
              {weeklyGoal.current >= weeklyGoal.target
                ? "🎉 太棒了！本周目标达成！"
                : `加油！还需要 ${weeklyGoal.target - weeklyGoal.current} 次训练 💪`
              }
            </p>
          </CardContent>
        </Card>

        {/* 快速开始 */}
        <Card className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-white pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-candy-mint shadow-sm">
                <Image src="/icons/icon_play_cute.png" alt="Quick Start" width={32} height={32} className="object-cover" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">快速开始</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => router.push('/training?action=generate&focus=Strength')} className="h-28 flex-col gap-2 bg-candy-blue hover:bg-candy-blue/80 text-blue-800 shadow-none hover:shadow-sm transition-all duration-200 rounded-[1.5rem] border-2 border-transparent hover:border-blue-200 p-0 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Dumbbell className="w-20 h-20" />
                </div>
                <div className="z-10 bg-white rounded-full p-1 shadow-sm w-12 h-12 flex items-center justify-center">
                  <Image src="/icons/icon_dumbbell_cute.png" alt="Strength" width={36} height={36} className="object-contain" />
                </div>
                <span className="text-sm font-bold z-10">力量训练</span>
              </Button>
              <Button onClick={() => router.push('/training?action=generate&focus=Cardio')} className="h-28 flex-col gap-2 bg-candy-pink hover:bg-candy-pink/80 text-pink-800 shadow-none hover:shadow-sm transition-all duration-200 rounded-[1.5rem] border-2 border-transparent hover:border-pink-200 p-0 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Flame className="w-20 h-20" />
                </div>
                <div className="z-10 bg-white rounded-full p-1 shadow-sm w-12 h-12 flex items-center justify-center">
                  <Image src="/icons/icon_fire_cute.png" alt="Cardio" width={36} height={36} className="object-contain" />
                </div>
                <span className="text-sm font-bold z-10">有氧运动</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 最近训练 */}
        <Card className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-white pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-candy-lavender shadow-sm">
                <Image src="/icons/icon_clock_cute.png" alt="Recent" width={32} height={32} className="object-cover" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">最近训练</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="space-y-3">
              {recentWorkouts.length > 0 ? (
                recentWorkouts.map((workout, index) => (
                  <div
                    key={workout.id}
                    className="group flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] hover:bg-candy-peach/20 transition-all duration-300 border border-transparent hover:border-candy-peach/50"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-gray-100 flex-shrink-0">
                        <Image src="/icons/icon_dumbbell_cute.png" alt="Workout" width={36} height={36} className="object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-700 text-sm mb-1 truncate">{workout.name}</h4>
                        <p className="text-xs text-gray-400 font-medium">{formatDate(workout.date)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-bold bg-white px-2 py-1 rounded-full shadow-sm">
                        <Clock className="w-3 h-3" />
                        {workout.duration}m
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Dumbbell className="w-6 h-6 text-gray-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-400">暂无记录</h3>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 成就徽章 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image src="/icons/icon_trophy_cute.png" alt="Trophy" width={32} height={32} className="object-cover" />
              </div>
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
