"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Flame, Clock, Dumbbell, Filter } from "lucide-react"

const Training = () => {
  const [logs, setLogs] = useState([
    {
      id: 1,
      startTime: "2024-01-15T10:00:00Z",
      locationName: "健身房A",
      caloriesBurned: 320,
      duration: 60,
      workoutType: "力量训练",
      exercises: ["卧推", "深蹲", "硬拉"],
    },
    {
      id: 2,
      startTime: "2024-01-14T18:30:00Z",
      locationName: "家里",
      caloriesBurned: 180,
      duration: 30,
      workoutType: "有氧运动",
      exercises: ["跑步机", "动感单车"],
    },
    {
      id: 3,
      startTime: "2024-01-13T09:00:00Z",
      locationName: "健身房B",
      caloriesBurned: 280,
      duration: 45,
      workoutType: "功能训练",
      exercises: ["俯卧撑", "引体向上", "平板支撑"],
    },
  ])

  const getWorkoutTypeColor = (type) => {
    switch (type) {
      case "力量训练":
        return "bg-blue-100 text-blue-800"
      case "有氧运动":
        return "bg-green-100 text-green-800"
      case "功能训练":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "今天"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "昨天"
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
        weekday: "short",
      })
    }
  }

  const totalStats = {
    totalWorkouts: logs.length,
    totalCalories: logs.reduce((sum, log) => sum + log.caloriesBurned, 0),
    totalDuration: logs.reduce((sum, log) => sum + log.duration, 0),
    avgCalories: Math.round(logs.reduce((sum, log) => sum + log.caloriesBurned, 0) / logs.length),
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部统计 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">训练历史</h1>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalStats.totalWorkouts}</div>
            <div className="text-xs text-blue-100">总训练</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalStats.totalCalories}</div>
            <div className="text-xs text-blue-100">总卡路里</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(totalStats.totalDuration / 60)}h</div>
            <div className="text-xs text-blue-100">总时长</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalStats.avgCalories}</div>
            <div className="text-xs text-blue-100">平均卡路里</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {logs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{log.workoutType}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(log.startTime)}
                    </div>
                  </div>
                </div>
                <Badge className={getWorkoutTypeColor(log.workoutType)}>{log.workoutType}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{log.duration} 分钟</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span>{log.caloriesBurned} 卡</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>{log.locationName}</span>
                </div>
              </div>

              {log.exercises && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-2">训练项目:</p>
                  <div className="flex flex-wrap gap-2">
                    {log.exercises.map((exercise, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {exercise}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">还没有训练记录</h3>
            <p className="text-gray-500">开始您的第一次训练吧！</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Training
