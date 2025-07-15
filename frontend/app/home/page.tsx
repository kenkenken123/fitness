"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Target, Flame, Clock, Play, Award } from "lucide-react"
import { useAuth } from "../../src/context/AuthContext" // 导入 useAuth

import { useRouter } from "next/navigation"

const Home = () => {
  const auth = useAuth(); // 先获取 auth
  const user = auth?.user;
  const isLoading = auth?.isLoading;
  const router = useRouter();

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  // 如果加载完成但用户为 null，则重定向到登录页面
  if (!user) {
    router.push("/"); // 重定向到登录页面
    return null; // 或者显示一个提示信息
  }

  // 模拟用户数据 (如果 user 存在，则使用真实数据，否则使用模拟数据作为备用)
  const displayUsername = user.username || "健身达人"; // 使用 user.username 或默认值
  const todayStats = {
    workouts: 2,
    calories: 450,
    duration: 75,
    streak: 7,
  }

  const weeklyGoal = {
    current: 4,
    target: 6,
    percentage: 67,
  }

  const recentWorkouts = [
    { id: 1, name: "胸部训练", date: "今天", duration: 45, calories: 280 },
    { id: 2, name: "有氧运动", date: "今天", duration: 30, calories: 170 },
    { id: 3, name: "腿部训练", date: "昨天", duration: 60, calories: 320 },
  ]

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
            <div className="text-2xl font-bold">{todayStats.workouts}</div>
            <div className="text-xs text-orange-100">训练</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{todayStats.calories}</div>
            <div className="text-xs text-orange-100">卡路里</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{todayStats.duration}</div>
            <div className="text-xs text-orange-100">分钟</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{todayStats.streak}</div>
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
            <p className="text-xs text-gray-500">还需要 {weeklyGoal.target - weeklyGoal.current} 次训练完成本周目标</p>
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
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{workout.name}</h4>
                    <p className="text-xs text-gray-500">{workout.date}</p>
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
            ))}
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
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                🔥 连续7天
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                💪 力量提升
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🎯 目标达成
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Home
