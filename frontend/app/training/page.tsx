'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Flame, Clock, Dumbbell, Filter, Plus, CheckCircle, Radio, ChevronDown, ChevronUp } from "lucide-react"
import { getWorkoutLogsByUserId, updateWorkoutSetCompletion, updateWorkoutLogCompletion } from "@/src/api/workoutLogs"
import { getTrainingEnvironmentsByUserId } from "@/src/api/trainingEnvironments"
import { GenerateWorkoutDialog } from "@/components/GenerateWorkoutDialog"
import { ExerciseDetailModal } from "@/components/ExerciseDetailModal"


interface Equipment {
  id: number;
  name: string;
}

interface TrainingEnvironment {
  id: number;
  name: string;
  userId: number;
  equipmentIds: number[];
}

const TrainingPage = () => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [exerciseModal, setExerciseModal] = useState({
    open: false,
    exerciseName: '',
    weight: 0,
    sets: 0,
    reps: 0
  });
  const [environments, setEnvironments] = useState<TrainingEnvironment[]>([]);
  const [expandedEnvironments, setExpandedEnvironments] = useState<Set<number>>(new Set());
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const userId = 1; // 假设当前用户ID为1 (游客)

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const [logsData, envsData] = await Promise.all([
        getWorkoutLogsByUserId(userId),
        getTrainingEnvironmentsByUserId()
      ]);
      
      // Fetch equipment details for environments
      const eqpsData = [];
      try {
        const equipmentResponse = await fetch('/api/equipments');
        const equipmentData = await equipmentResponse.json();
        setEquipments(equipmentData);
      } catch (error) {
        console.error("Failed to fetch equipments", error);
        setEquipments([]);
      }
      
      // 按开始时间降序排序
      const sortedData = logsData.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setLogs(sortedData);
      setEnvironments(envsData);
      setEquipments(eqpsData);
      
      // 默认展开第一个环境
      if (envsData.length > 0) {
        setExpandedEnvironments(new Set([envsData[0].id]));
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSetCompletionToggle = async (logId: number, setId: number, isCompleted: boolean) => {
    try {
      await updateWorkoutSetCompletion(logId, setId, isCompleted);
      setLogs(prevLogs => 
        prevLogs.map(log => {
          if (log.id === logId) {
            const updatedSets = log.workoutSets.map(set => 
              set.id === setId ? { ...set, isCompleted } : set
            );
            return { ...log, workoutSets: updatedSets };
          }
          return log;
        })
      );
    } catch (error) {
      console.error("Failed to update set completion", error);
    }
  };

  const handleLogCompletionToggle = async (logId: number, isCompleted: boolean) => {
    try {
      await updateWorkoutLogCompletion(logId, isCompleted);
      setLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === logId ? { ...log, isCompleted } : log
        )
      );
    } catch (error) {
      console.error("Failed to update log completion", error);
    }
  };

  const handleGenerationSuccess = (newLog: WorkoutLog) => {
    setLogs(prevLogs => [newLog, ...prevLogs]);
  };

  const handleExerciseClick = (exerciseName: string, weight: number, sets: number, reps: number) => {
    setExerciseModal({
      open: true,
      exerciseName,
      weight,
      sets,
      reps
    });
  };

  const toggleEnvironment = (envId: number) => {
    setExpandedEnvironments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(envId)) {
        newSet.delete(envId);
      } else {
        newSet.add(envId);
      }
      return newSet;
    });
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

      {/* Training Environments */}
      <div className="p-4 md:p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">训练环境</h2>
        {environments.length === 0 ? (
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">暂无训练环境，请先添加训练环境</p>
          </div>
        ) : (
          <div className="space-y-3">
            {environments.map((env) => (
              <Card key={env.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 hover:bg-gray-50"
                    onClick={() => toggleEnvironment(env.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-lg">{env.name}</span>
                    </div>
                    {expandedEnvironments.has(env.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </Button>
                  
                  {expandedEnvironments.has(env.id) && (
                    <div className="px-4 pb-4 border-t">
                      <p className="text-sm text-gray-600 mb-3 mt-3">可用器材:</p>
                      <div className="flex flex-wrap gap-2">
                        {env.equipmentIds.map((equipmentId) => {
                          const equipment = equipments.find((e: any) => e.id === equipmentId);
                          return equipment ? (
                            <Badge key={equipment.id} variant="outline" className="bg-blue-50">
                              {equipment.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
                  <Button
                    variant={log.isCompleted ? "default" : "secondary"}
                    size="sm"
                    onClick={() => handleLogCompletionToggle(log.id, !log.isCompleted)}
                    className="cursor-pointer"
                  >
                    {log.isCompleted ? '已完成' : '标记完成'}
                  </Button>
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
                        <div key={exercise.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-2 p-0 h-auto font-normal hover:bg-transparent"
                              onClick={() => handleSetCompletionToggle(log.id, exercise.id, !exercise.isCompleted)}
                            >
                              {exercise.isCompleted ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Radio className="w-5 h-5 text-gray-400"/>}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto font-medium hover:bg-transparent text-left"
                              onClick={() => handleExerciseClick(exercise.activityName, exercise.weight, exercise.sets, exercise.reps)}
                            >
                              <span className={`${exercise.isCompleted ? 'text-green-600 line-through' : ''}`}>{exercise.activityName}</span>
                            </Button>
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

      <ExerciseDetailModal
        open={exerciseModal.open}
        onOpenChange={(open) => setExerciseModal(prev => ({ ...prev, open }))}
        exerciseName={exerciseModal.exerciseName}
        weight={exerciseModal.weight}
        sets={exerciseModal.sets}
        reps={exerciseModal.reps}
      />
    </div>
  )
}

export default TrainingPage

