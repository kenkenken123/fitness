"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Settings, Lock, Info, LogOut, Trophy, Target, TrendingUp, ChevronRight, Edit } from "lucide-react"

import { useAuth } from "../../src/context/AuthContext" // 导入 useAuth

import { useRouter } from "next/navigation"

const Profile = () => {
  const { user, logout, isLoading } = useAuth(); // 使用 useAuth 钩子获取 user, logout 和 isLoading
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

  // 使用从 AuthContext 获取的 user 数据
  const displayUser = {
    username: user.username || "健身达人",
    email: user.email || "fitness@example.com",
    joinDate: user.joinDate || "2024-01-01",
    avatar: user.avatar || null,
  }

  const userStats = {
    totalWorkouts: 45,
    totalCalories: 12500,
    currentStreak: 7,
    longestStreak: 15,
    favoriteWorkout: "力量训练",
    totalHours: 67,
  }

  const achievements = [
    { id: 1, name: "新手上路", description: "完成第一次训练", earned: true },
    { id: 2, name: "坚持不懈", description: "连续训练7天", earned: true },
    { id: 3, name: "卡路里杀手", description: "单次训练消耗500+卡路里", earned: false },
    { id: 4, name: "月度冠军", description: "单月训练20次", earned: false },
  ]

  const menuItems = [
    { icon: Edit, label: "编辑资料", action: () => console.log("编辑资料") },
    { icon: Lock, label: "修改密码", action: () => console.log("修改密码") },
    { icon: Target, label: "训练目标", action: () => console.log("训练目标") },
    { icon: Settings, label: "应用设置", action: () => console.log("应用设置") },
    { icon: Info, label: "关于应用", action: () => console.log("关于应用") },
  ]

  const handleLogout = () => {
    logout(); // 调用 AuthContext 中的 logout 方法
    console.log("退出登录");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部用户信息 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-20 h-20 border-4 border-white/20">
            <AvatarImage src={displayUser.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
              {displayUser.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{displayUser.username}</h1>
            <p className="text-purple-100">{displayUser.email}</p>
            <p className="text-purple-100 text-sm mt-1">加入于 {new Date(displayUser.joinDate).toLocaleDateString("zh-CN")}</p>
          </div>
        </div>

        {/* 用户统计 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{userStats.totalWorkouts}</div>
            <div className="text-xs text-purple-100">总训练</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userStats.currentStreak}</div>
            <div className="text-xs text-purple-100">连续天数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(userStats.totalHours)}h</div>
            <div className="text-xs text-purple-100">总时长</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 详细统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              训练统计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalCalories}</div>
                <div className="text-sm text-blue-600">总消耗卡路里</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.longestStreak}</div>
                <div className="text-sm text-green-600">最长连续天数</div>
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">最爱训练</div>
              <div className="text-sm text-purple-600">{userStats.favoriteWorkout}</div>
            </div>
          </CardContent>
        </Card>

        {/* 成就系统 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              我的成就
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border-2 ${
                    achievement.earned ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className={`w-4 h-4 ${achievement.earned ? "text-yellow-500" : "text-gray-400"}`} />
                    <span className={`text-sm font-medium ${achievement.earned ? "text-yellow-800" : "text-gray-500"}`}>
                      {achievement.name}
                    </span>
                  </div>
                  <p className={`text-xs ${achievement.earned ? "text-yellow-600" : "text-gray-400"}`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 菜单选项 */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon
              return (
                <div key={index}>
                  <button
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* 退出登录 */}
        <Button variant="destructive" onClick={handleLogout} className="w-full h-12 text-base font-medium">
          <LogOut className="w-5 h-5 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  )
}

export default Profile
