"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios" // 导入 axios
import { useAuth } from "./src/context/AuthContext" // 导入 useAuth
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dumbbell, User, Lock, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // 导入 useToast

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth() // 获取 AuthContext 的 login 方法
  const { toast } = useToast() // 获取 toast 方法

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername")
    if (rememberedUsername) {
      setUsername(rememberedUsername)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/Users/login", {
        username,
        password,
      })
      if (response.status === 200) {
        login(response.data) // 将用户信息存储到 AuthContext
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        })
        router.push("/home")
      }
    } catch (error: any) {
      console.error("登录失败:", error)
      toast({
        title: "登录失败",
        description: error.response?.data?.Message || "用户名或密码错误。",
        variant: "destructive",
      })
    }
  }

  const handleRegister = async () => {
    try {
      const response = await axios.post("/api/Users/register", {
        username,
        password,
      })
      if (response.status === 200) {
        toast({
          title: "注册成功",
          description: "账户已创建，请登录。",
        })
        setIsRegistering(false) // 注册成功后切换到登录界面
      }
    } catch (error: any) {
      console.error("注册失败:", error)
      toast({
        title: "注册失败",
        description: error.response?.data?.Message || "注册失败，请稍后再试。",
        variant: "destructive",
      })
    }
  }

  const handleGuestLogin = async () => {
    // 游客登录逻辑保持不变
    console.log("游客登录")
    router.push("/home")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {isRegistering ? "创建账户" : "欢迎回来"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isRegistering ? "开始您的健身之旅" : "继续您的健身计划"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                用户名
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                密码
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isRegistering && (
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={setRememberMe} />
                <Label htmlFor="remember" className="text-sm">
                  记住我
                </Label>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {isRegistering ? (
              <>
                <Button
                  onClick={handleRegister}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
                >
                  创建账户
                </Button>
                <Button onClick={handleGuestLogin} variant="outline" className="w-full h-12 bg-transparent">
                  游客体验
                </Button>
                <p className="text-center text-sm text-gray-600">
                  已有账户？
                  <button
                    onClick={() => setIsRegistering(false)}
                    className="text-orange-600 hover:text-orange-700 font-medium ml-1"
                  >
                    立即登录
                  </button>
                </p>
              </>
            ) : (
              <>
                <Button
                  onClick={handleLogin}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
                >
                  登录
                </Button>
                <p className="text-center text-sm text-gray-600">
                  还没有账户？
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="text-orange-600 hover:text-orange-700 font-medium ml-1"
                  >
                    立即注册
                  </button>
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
