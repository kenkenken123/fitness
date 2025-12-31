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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载您的个人数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Header with user info */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 text-white p-4 sm:p-6 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white/20 shadow-lg">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-white/20 text-white text-lg sm:text-xl font-bold">
                {profile.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold mb-1 truncate">{profile.username}</h1>
              <p className="text-purple-100 text-sm truncate">{profile.email}</p>
              <p className="text-purple-100 text-xs mt-1">加入于 {new Date(profile.joinDate).toLocaleDateString("zh-CN")}</p>
            </div>
          </div>

          {/* User stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold mb-1">{profile.stats.totalWorkouts}</div>
              <div className="text-xs text-purple-100">总训练</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold mb-1">{profile.stats.currentStreak}</div>
              <div className="text-xs text-purple-100">连续天数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold mb-1">{Math.round(profile.stats.totalHours)}h</div>
              <div className="text-xs text-purple-100">总时长</div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 -mt-6 relative z-10 space-y-6">
        {/* Detailed stats */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">训练统计</CardTitle>
                <p className="text-xs sm:text-sm text-gray-500">详细训练数据分析</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{profile.stats.totalCalories}</div>
                <div className="text-sm text-blue-600 font-medium">总消耗卡路里</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{profile.stats.longestStreak}</div>
                <div className="text-sm text-green-600 font-medium">最长连续天数</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 text-center">
              <div className="text-lg font-semibold text-purple-600 mb-1">最爱训练</div>
              <div className="text-sm text-purple-600 font-medium">{profile.stats.favoriteWorkout}</div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">我的成就</CardTitle>
                <p className="text-xs sm:text-sm text-gray-500">获得的训练成就</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {profile.achievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 ${
                    achievement.earned 
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm" 
                      : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className={`w-4 h-4 ${achievement.earned ? "text-yellow-500" : "text-gray-400"}`} />
                    <span className={`text-sm font-semibold ${achievement.earned ? "text-yellow-800" : "text-gray-500"}`}>
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
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index}>
                  <button
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200">
                        <IconComponent className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                  {index < menuItems.length - 1 && <Separator className="mx-4" />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout button */}
        <Button 
          variant="destructive" 
          onClick={handleLogout} 
          className="w-full h-12 sm:h-14 text-base font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
