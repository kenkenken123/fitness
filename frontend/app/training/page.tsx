'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Flame, Clock, Dumbbell, Filter, Plus, CheckCircle, Radio } from "lucide-react"
import { getWorkoutLogsByUserId } from "@/src/api/workoutLogs"
import { GenerateWorkoutDialog } from "@/components/GenerateWorkoutDialog"

// 定义数据类型
interface WorkoutSet {
  id: number;
  activityName: string;
  weight: number;
  sets: number;
  reps: number;
  isCompleted: boolean;
}

interface WorkoutLog {
  id: number;
  name: string; // AI生成的训练名称
  startTime: string;
  estimatedDuration?: number;
  estimatedCalories?: number;
  isCompleted: boolean;
  workoutSets: WorkoutSet[];
}

const TrainingPage = () => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerateDialogOpen, setGenerateDialogOpen] = useState(false);
  const userId = 1; // 假设当前用户ID为1 (游客)

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getWorkoutLogsByUserId(userId);
      // 按开始时间降序排序
      const sortedData = data.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setLogs(sortedData);
    } catch (error) {
      console.error("Failed to fetch workout logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleGenerationSuccess = (newLog: WorkoutLog) => {
    setLogs(prevLogs => [newLog, ...prevLogs]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: 'numeric',
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">训练历史</h1>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
        </div>
      </div>

      {/* Logs List */}
      <div className="p-4 md:p-6 space-y-4">
        {isLoading ? (
          <p className="text-center text-gray-500">加载中...</p>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">还没有训练记录</h3>
            <p className="text-gray-500">点击右下角按钮，让AI为你生成第一个训练计划吧！</p>
          </div>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className={`hover:shadow-lg transition-shadow border-l-4 ${log.isCompleted ? 'border-green-500' : 'border-yellow-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${log.isCompleted ? 'bg-gradient-to-r from-green-400 to-cyan-400' : 'bg-gradient-to-r from-yellow-400 to-orange-400'}`}>
                      <Dumbbell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{log.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(log.startTime)}
                      </div>
                    </div>
                  </div>
                  <Badge variant={log.isCompleted ? 'default' : 'secondary'}>
                    {log.isCompleted ? '已完成' : '待完成'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>预估时长: {log.estimatedDuration} 分钟</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>预估热量: {log.estimatedCalories} 卡</span>
                  </div>
                </div>

                {log.workoutSets && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">训练项目:</p>
                    <div className="space-y-2">
                      {log.workoutSets.map((exercise) => (
                        <div key={exercise.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                           <div className="flex items-center">
                            {exercise.isCompleted ? <CheckCircle className="w-5 h-5 text-green-500 mr-3" /> : <Radio className="w-5 h-5 text-gray-400 mr-3"/>}
                            <span className="font-medium">{exercise.activityName}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span>{exercise.weight}kg</span> x <span>{exercise.sets}组</span> x <span>{exercise.reps}次</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Button */}
      <Button
        onClick={() => setGenerateDialogOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg text-white"
      >
        <Plus className="w-8 h-8" />
      </Button>

      <GenerateWorkoutDialog
        open={isGenerateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onSuccess={handleGenerationSuccess}
        userId={userId}
      />
    </div>
  )
}

export default TrainingPage

