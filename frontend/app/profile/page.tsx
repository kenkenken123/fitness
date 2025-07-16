'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Settings, Lock, Info, LogOut, Trophy, Target, TrendingUp, ChevronRight, Edit } from "lucide-react"
import { useAuth } from "../../src/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "axios"

// 定义从后端获取的数据类型
interface UserProfile {
  username: string;
  email: string;
  joinDate: string;
  avatar: string | null;
  stats: {
    totalWorkouts: number;
    totalCalories: number;
    currentStreak: number;
    longestStreak: number;
    favoriteWorkout: string;
    totalHours: number;
  };
  achievements: {
    id: number;
    name: string;
    description: string;
    earned: boolean;
  }[];
}

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<UserProfile>(`/api/users/${user.id}/profile`);
        setProfile(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setError("无法加载个人数据，请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">正在加载您的个人数据...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!profile) {
    return null; // 或者显示一个未找到配置文件的消息
  }

  const menuItems = [
    { icon: Edit, label: "编辑资料", action: () => console.log("编辑资料") },
    { icon: Lock, label: "修改密码", action: () => console.log("修改密码") },
    { icon: Target, label: "训练目标", action: () => console.log("训练目标") },
    { icon: Settings, label: "应用设置", action: () => console.log("应用设置") },
    { icon: Info, label: "关于应用", action: () => console.log("关于应用") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with user info */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-20 h-20 border-4 border-white/20">
            <AvatarImage src={profile.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
              {profile.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-purple-100">{profile.email}</p>
            <p className="text-purple-100 text-sm mt-1">加入于 {new Date(profile.joinDate).toLocaleDateString("zh-CN")}</p>
          </div>
        </div>

        {/* User stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{profile.stats.totalWorkouts}</div>
            <div className="text-xs text-purple-100">总训练</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{profile.stats.currentStreak}</div>
            <div className="text-xs text-purple-100">连续天数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(profile.stats.totalHours)}h</div>
            <div className="text-xs text-purple-100">总时长</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Detailed stats */}
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
                <div className="text-2xl font-bold text-blue-600">{profile.stats.totalCalories}</div>
                <div className="text-sm text-blue-600">总消耗卡路里</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{profile.stats.longestStreak}</div>
                <div className="text-sm text-green-600">最长连续天数</div>
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">最爱训练</div>
              <div className="text-sm text-purple-600">{profile.stats.favoriteWorkout}</div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              我的成就
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {profile.achievements.map((achievement) => (
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

        {/* Menu options */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
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
              );
            })}
          </CardContent>
        </Card>

        {/* Logout button */}
        <Button variant="destructive" onClick={handleLogout} className="w-full h-12 text-base font-medium">
          <LogOut className="w-5 h-5 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
