'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/src/context/AuthContext"
import { useRouter } from 'next/navigation'
import axios from 'axios'

const Login = () => {
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  // 登录表单状态
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  })

  // 注册表单状态
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await axios.post('/api/users/login', loginData)
      const userData = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        avatar: response.data.avatar || '',
        joinDate: response.data.joinDate
      }
      login(userData)
      router.push('/home')
    } catch (error: any) {
      console.error('登录失败:', error)
      setError(error.response?.data?.message || '登录失败，请检查用户名和密码')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await axios.post('/api/users/register', registerData)
      // 注册成功后自动登录
      const loginResponse = await axios.post('/api/users/login', {
        username: registerData.username,
        password: registerData.password
      })
      const userData = {
        id: loginResponse.data.id,
        username: loginResponse.data.username,
        email: loginResponse.data.email,
        avatar: loginResponse.data.avatar || '',
        joinDate: loginResponse.data.joinDate
      }
      login(userData)
      router.push('/home')
    } catch (error: any) {
      console.error('注册失败:', error)
      setError(error.response?.data?.message || '注册失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-candy-blue/10 flex items-center justify-center px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-candy-pink/20 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-candy-mint/20 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>

      <Card className="w-full max-w-md border-0 shadow-sm rounded-[2.5rem] overflow-hidden relative z-10 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center bg-candy-blue/20 pb-8 pt-10">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-sm ring-4 ring-white/50">
            <div className="bg-candy-blue p-3 rounded-[1.5rem]">
              <div className="w-8 h-8 bg-white rounded-xl"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-black text-gray-800">健身助手</CardTitle>
          <p className="text-gray-500 text-sm font-bold mt-2">开启你的趣味健身之旅 🚀</p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1.5 rounded-[1.5rem] mb-6">
              <TabsTrigger
                value="login"
                className="rounded-[1.2rem] py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all duration-200"
              >
                登录
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-[1.2rem] py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600 transition-all duration-200"
              >
                注册
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6 mt-0">
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-500 text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <span>⚠️ {error}</span>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-sm font-bold text-gray-700 ml-1">用户名</Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="请输入用户名"
                    required
                    className="rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-candy-blue focus:ring-candy-blue h-12 transition-all duration-200 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-bold text-gray-700 ml-1">密码</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="请输入密码"
                    required
                    className="rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-candy-blue focus:ring-candy-blue h-12 transition-all duration-200 font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-candy-blue hover:bg-blue-300 text-blue-900 h-12 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 font-black text-lg mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-6 mt-0">
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-500 text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <span>⚠️ {error}</span>
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-sm font-bold text-gray-700 ml-1">用户名</Label>
                  <Input
                    id="register-username"
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    placeholder="请输入用户名"
                    required
                    className="rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-candy-mint focus:ring-candy-mint h-12 transition-all duration-200 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-bold text-gray-700 ml-1">邮箱</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="请输入邮箱"
                    required
                    className="rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-candy-mint focus:ring-candy-mint h-12 transition-all duration-200 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-bold text-gray-700 ml-1">密码</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="请输入密码"
                    required
                    className="rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-candy-mint focus:ring-candy-mint h-12 transition-all duration-200 font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-candy-mint hover:bg-teal-200 text-teal-900 h-12 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 font-black text-lg mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login 