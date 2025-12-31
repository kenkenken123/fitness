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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-full translate-y-24 -translate-x-24"></div>
      
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden relative z-10">
        <CardHeader className="text-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white pb-8">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold">健身助手</CardTitle>
          <p className="text-blue-100 text-sm">登录或注册您的账户</p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-2xl">
              <TabsTrigger 
                value="login" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all duration-200"
              >
                登录
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 transition-all duration-200"
              >
                注册
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-6 mt-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-sm font-medium text-gray-700">用户名</Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    placeholder="请输入用户名"
                    required
                    className="rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">密码</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="请输入密码"
                    required
                    className="rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-12"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-6 mt-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-sm font-medium text-gray-700">用户名</Label>
                  <Input
                    id="register-username"
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                    placeholder="请输入用户名"
                    required
                    className="rounded-2xl border-gray-200 focus:border-green-500 focus:ring-green-500 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">邮箱</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    placeholder="请输入邮箱"
                    required
                    className="rounded-2xl border-gray-200 focus:border-green-500 focus:ring-green-500 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">密码</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    placeholder="请输入密码"
                    required
                    className="rounded-2xl border-gray-200 focus:border-green-500 focus:ring-green-500 h-12"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
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