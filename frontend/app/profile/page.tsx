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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-28">
      {/* Header with user info */}
      <div className="relative overflow-hidden">
        <div className="bg-candy-lavender/40 px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)] sm:p-6 rounded-b-[3rem]">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-md ring-4 ring-candy-lavender/30 bg-white">
                <AvatarImage src={profile.avatar || "/icons/logo_muscle_duck.png"} className="object-cover" />
                <AvatarFallback className="bg-white p-2">
                  <img src="/icons/logo_muscle_duck.png" alt="Default Avatar" className="w-full h-full object-contain" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-candy-yellow text-orange-700 text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Lv.1
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-1 truncate">{profile.username}</h1>
              <p className="text-purple-600 text-sm truncate font-medium">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] bg-white/60 px-2 py-1 rounded-full text-purple-600 font-bold">
                  📅 {new Date(profile.joinDate).toLocaleDateString("zh-CN")} 加入
                </span>
              </div>
            </div>
          </div>

          {/* User stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-[1.5rem] p-3 sm:p-4 text-center shadow-sm border border-candy-blue/20">
              <div className="text-xl sm:text-2xl font-black text-gray-800 mb-1">{profile.stats.totalWorkouts}</div>
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">总训练</div>
            </div>
            <div className="bg-white rounded-[1.5rem] p-3 sm:p-4 text-center shadow-sm border border-candy-mint/20">
              <div className="text-xl sm:text-2xl font-black text-gray-800 mb-1">{profile.stats.currentStreak}</div>
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">连续天数</div>
            </div>
            <div className="bg-white rounded-[1.5rem] p-3 sm:p-4 text-center shadow-sm border border-candy-pink/20">
              <div className="text-xl sm:text-2xl font-black text-gray-800 mb-1">{Math.round(profile.stats.totalHours)}h</div>
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">总时长</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 relative z-10 -mt-6 space-y-6">
        {/* Detailed stats */}
        <Card className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-white border-b border-gray-50 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-candy-blue rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">训练统计</CardTitle>
                <p className="text-xs text-gray-400 font-medium">详细训练数据分析 📊</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-candy-blue/10 rounded-[1.5rem] p-4 border border-blue-100 text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-600 mb-1">{profile.stats.totalCalories}</div>
                <div className="text-xs text-blue-400 font-bold uppercase">总消耗卡路里</div>
              </div>
              <div className="bg-candy-mint/10 rounded-[1.5rem] p-4 border border-teal-100 text-center">
                <div className="text-2xl sm:text-3xl font-black text-teal-600 mb-1">{profile.stats.longestStreak}</div>
                <div className="text-xs text-teal-600 font-bold uppercase">最长连续天数</div>
              </div>
            </div>
            <div className="bg-candy-lavender/20 rounded-[1.5rem] p-4 border border-purple-100 text-center">
              <div className="text-lg font-black text-purple-600 mb-1">最爱训练</div>
              <div className="text-sm text-purple-500 font-bold">{profile.stats.favoriteWorkout || "暂无数据"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-white border-b border-gray-50 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-candy-yellow rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">我的成就</CardTitle>
                <p className="text-xs text-gray-400 font-medium">获得的训练成就 🏆</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {profile.achievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 ${achievement.earned
                    ? "bg-candy-yellow/10 border-candy-yellow/50 shadow-sm"
                    : "bg-gray-50 border-gray-100 grayscale opacity-70"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className={`w-4 h-4 ${achievement.earned ? "text-orange-500" : "text-gray-400"}`} />
                    <span className={`text-sm font-bold ${achievement.earned ? "text-orange-800" : "text-gray-500"}`}>
                      {achievement.name}
                    </span>
                  </div>
                  <p className={`text-xs ${achievement.earned ? "text-orange-600" : "text-gray-400"}`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu options */}
        <Card className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-2 space-y-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index}>
                  <button
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-candy-blue/20 transition-all duration-200">
                        <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <span className="font-bold text-gray-700 group-hover:text-gray-900">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </button>
                  {index < menuItems.length - 1 && <div className="h-px bg-gray-50 mx-4" />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full h-14 text-base font-bold bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-[1.5rem] transition-all duration-200 mb-6"
        >
          <LogOut className="w-5 h-5 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
