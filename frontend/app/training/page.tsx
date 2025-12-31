'use client'

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Flame, Clock, Dumbbell, Filter, Plus, CheckCircle, Radio, ChevronDown, ChevronUp, HelpCircle, Loader2, CalendarDays, Trash2 } from "lucide-react"
import { getWorkoutLogsByUserId, updateWorkoutSetCompletion, updateWorkoutLogCompletion } from "@/src/api/workoutLogs"
import { getTrainingEnvironmentsByUserId } from "@/src/api/trainingEnvironments"
import { GenerateWorkoutDialog } from "@/components/GenerateWorkoutDialog"
import { ExerciseDetailModal } from "@/components/ExerciseDetailModal"
import { WorkoutLog } from "@/src/api/workoutLogs"
import { useAuth } from "@/src/context/AuthContext"


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
  
  // AI指导相关状态
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState("");
  const [exerciseInstructions, setExerciseInstructions] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // 日历相关状态
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<number[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  
  // 删除相关状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const fetchLogs = async (userId: number) => {
    setIsLoading(true);
    console.log("userId", userId);
    try {
      const [logsData, envsData] = await Promise.all([
        getWorkoutLogsByUserId(userId),
        getTrainingEnvironmentsByUserId(userId)
      ]);
      
      // Fetch equipment details for environments
      const eqpsData: Equipment[] = [];
      try {
        const equipmentResponse = await fetch(`/api/Equipments/ByUserId/${userId}`);
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
    if (!isAuthLoading) {
      if (user) {
        console.log(user);
        fetchLogs(user.id);
      } else {
        // 用户未登录，跳转到登录页
        router.push('/');
      }
    }
  }, [user, isAuthLoading, router]);

  const handleSetCompletionToggle = async (logId: number, setId: number, isCompleted: boolean) => {
    try {
      await updateWorkoutSetCompletion(logId, setId, isCompleted);
      
      // 更新本地状态
      setLogs(prevLogs => 
        prevLogs.map(log => {
          if (log.id === logId) {
            const updatedSets = log.workoutSets.map(set => 
              set.id === setId ? { ...set, isCompleted } : set
            );
            
            // 检查是否所有训练项目都完成了
            const allSetsCompleted = updatedSets.every(set => set.isCompleted);
            
            return { 
              ...log, 
              workoutSets: updatedSets,
              // 如果所有项目都完成，自动标记整个训练计划为完成
              isCompleted: allSetsCompleted
            };
          }
          return log;
        })
      );
      
      // 如果所有项目都完成了，自动更新后端的训练计划完成状态
      const updatedLog = logs.find(log => log.id === logId);
      if (updatedLog) {
        const updatedSets = updatedLog.workoutSets.map(set => 
          set.id === setId ? { ...set, isCompleted } : set
        );
        const allSetsCompleted = updatedSets.every(set => set.isCompleted);
        
        if (allSetsCompleted && !updatedLog.isCompleted) {
          // 自动将整个训练计划标记为完成
          await handleLogCompletionToggle(logId, true);
        }
      }
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

  // 获取AI运动指导
  const getExerciseInstructions = async (exerciseName: string, weight: number, sets: number, reps: number) => {
    setIsAiLoading(true);
    setCurrentExercise(exerciseName);
    setIsAiDialogOpen(true);

    try {
      console.log('开始请求AI指导:', exerciseName);
      const requestBody = {
        ExerciseName: exerciseName,
        Weight: weight,
        Sets: sets,
        Reps: reps
      };
      console.log('请求体:', requestBody);

      const response = await fetch('/api/exercises/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('响应状态:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('AI指导数据:', data);
        setExerciseInstructions(data);
      } else {
        console.error('获取运动指导失败，状态码:', response.status);
        const errorText = await response.text();
        console.error('错误响应:', errorText);
        setExerciseInstructions({
          description: "暂时无法获取该运动的详细指导，请稍后再试。",
          keyPoints: [],
          commonMistakes: [],
          safetyTips: [],
          muscles: []
        });
      }
    } catch (error) {
      console.error('请求失败:', error);
      setExerciseInstructions({
        description: "网络错误，请检查网络连接后重试。",
        keyPoints: [],
        commonMistakes: [],
        safetyTips: [],
        muscles: []
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // 获取训练日期
  const fetchWorkoutDays = async (year: number, month: number) => {
    if (!user) return;
    
    setIsCalendarLoading(true);
    try {
      const response = await fetch(`/api/workoutlogs/user/${user.id}/calendar/${year}/${month}`);
      if (response.ok) {
        const days = await response.json();
        setWorkoutDays(days);
      } else {
        console.error('获取训练日期失败');
        setWorkoutDays([]);
      }
    } catch (error) {
      console.error('请求训练日期失败:', error);
      setWorkoutDays([]);
    } finally {
      setIsCalendarLoading(false);
    }
  };

  // 打开日历
  const openCalendar = () => {
    setIsCalendarOpen(true);
    fetchWorkoutDays(currentDate.getFullYear(), currentDate.getMonth() + 1);
  };

  // 切换月份
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    fetchWorkoutDays(newDate.getFullYear(), newDate.getMonth() + 1);
  };

  // 删除训练计划
  const handleDeleteClick = (logId: number, logName: string) => {
    setDeleteTarget({ id: logId, name: logName });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workoutlogs/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // 从列表中移除被删除的训练计划
        setLogs(prevLogs => prevLogs.filter(log => log.id !== deleteTarget.id));
        setIsDeleteDialogOpen(false);
        setDeleteTarget(null);
      } else {
        console.error('删除失败');
      }
    } catch (error) {
      console.error('删除请求失败:', error);
    } finally {
      setIsDeleting(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-4 sm:p-6 pb-8 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">训练历史</h1>
                <p className="text-blue-100 text-xs sm:text-sm">查看和管理您的训练记录</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2" 
              onClick={openCalendar}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">训练日历</span>
            </Button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 -mt-6 relative z-10 space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">还没有训练记录</h3>
            <p className="text-gray-500 text-sm">点击右下角按钮，让AI为你生成第一个训练计划吧！</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <Card key={log.id} className={`border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${log.isCompleted ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg ${log.isCompleted ? 'bg-gradient-to-br from-green-500 to-cyan-500' : 'bg-gradient-to-br from-yellow-500 to-orange-500'}`}>
                      <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-1 truncate">{log.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(log.startTime)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant={log.isCompleted ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleLogCompletionToggle(log.id, !log.isCompleted)}
                      className={`cursor-pointer rounded-xl shadow-sm ${
                        log.isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600' 
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                      }`}
                    >
                      {log.isCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">已完成</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">标记完成</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(log.id, log.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-3 sm:p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">预估时长</span>
                    </div>
                    <span className="text-lg font-bold text-blue-900">{log.estimatedDuration} 分钟</span>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-3 sm:p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">预估热量</span>
                    </div>
                    <span className="text-lg font-bold text-red-900">{log.estimatedCalories} 卡</span>
                  </div>
                </div>

                {log.workoutSets && (
                  <div className="border-t border-gray-200 pt-4 sm:pt-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Dumbbell className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">训练项目</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // 快速完成所有未完成的项目
                            log.workoutSets.forEach(exercise => {
                              if (!exercise.isCompleted) {
                                handleSetCompletionToggle(log.id, exercise.id, true);
                              }
                            });
                          }}
                          className="text-xs px-3 py-1 h-auto text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl shadow-sm"
                        >
                          一键完成
                        </Button>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium">
                            {log.workoutSets.filter(set => set.isCompleted).length}/{log.workoutSets.length} 已完成
                          </span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-300"
                              style={{ 
                                width: `${(log.workoutSets.filter(set => set.isCompleted).length / log.workoutSets.length) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {log.workoutSets.map((exercise, exerciseIndex) => (
                        <div 
                          key={exercise.id} 
                          className={`group flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all duration-300 border ${
                            exercise.isCompleted 
                              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm' 
                              : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 hover:shadow-lg'
                          }`}
                          style={{ animationDelay: `${exerciseIndex * 50}ms` }}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-2 p-0 h-auto font-normal hover:bg-transparent"
                              onClick={() => handleSetCompletionToggle(log.id, exercise.id, !exercise.isCompleted)}
                            >
                              {exercise.isCompleted ? 
                                <CheckCircle className="w-5 h-5 text-green-500" /> : 
                                <Radio className="w-5 h-5 text-gray-400"/>
                              }
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto font-medium hover:bg-transparent text-left hover:text-blue-500 min-w-0 flex-1"
                              onClick={() => {
                                console.log('运动名称被点击，运动名称:', exercise.activityName);
                                getExerciseInstructions(exercise.activityName, exercise.weight, exercise.sets, exercise.reps);
                              }}
                            >
                              <span className={`truncate ${exercise.isCompleted ? 'text-green-600 line-through' : 'text-gray-800'}`}>
                                {exercise.activityName}
                              </span>
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className={`text-sm font-medium ${exercise.isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                              {exercise.weight > 0 ? (
                                <>
                                  <span className="font-bold">{exercise.weight}kg</span> x <span>{exercise.sets}组</span> x <span>{exercise.reps}次</span>
                                </>
                              ) : (
                                <>
                                  <span>{exercise.sets}组</span> x <span>{exercise.reps}次</span>
                                </>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetCompletionToggle(log.id, exercise.id, !exercise.isCompleted)}
                              className={`text-xs px-3 py-1 h-auto rounded-xl shadow-sm ${
                                exercise.isCompleted 
                                  ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {exercise.isCompleted ? '已完成' : '标记完成'}
                            </Button>
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
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl text-white transition-all duration-300 hover:scale-110"
      >
        <Plus className="w-8 h-8" />
      </Button>

      <GenerateWorkoutDialog
        open={isGenerateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onSuccess={handleGenerationSuccess}
        userId={user?.id ?? 0 }
      />

      <ExerciseDetailModal
        open={exerciseModal.open}
        onOpenChange={(open) => setExerciseModal(prev => ({ ...prev, open }))}
        exerciseName={exerciseModal.exerciseName}
        weight={exerciseModal.weight}
        sets={exerciseModal.sets}
        reps={exerciseModal.reps}
      />

      {/* AI指导弹框 */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              {currentExercise} - 动作要领
            </DialogTitle>
          </DialogHeader>
          
          {isAiLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">AI正在为你解答...</span>
            </div>
          ) : exerciseInstructions ? (
            <div className="space-y-4">
              {/* 动作描述 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">动作描述</h4>
                <p className="text-sm text-gray-600">{exerciseInstructions.description}</p>
              </div>

              {/* 关键要点 */}
              {exerciseInstructions.keyPoints && exerciseInstructions.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">关键要点</h4>
                  <ul className="space-y-1">
                    {exerciseInstructions.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 目标肌肉 */}
              {exerciseInstructions.muscles && exerciseInstructions.muscles.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">目标肌肉</h4>
                  <div className="flex flex-wrap gap-1">
                    {exerciseInstructions.muscles.map((muscle: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 常见错误 */}
              {exerciseInstructions.commonMistakes && exerciseInstructions.commonMistakes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">常见错误</h4>
                  <ul className="space-y-1">
                    {exerciseInstructions.commonMistakes.map((mistake: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 安全提示 */}
              {exerciseInstructions.safetyTips && exerciseInstructions.safetyTips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">安全提示</h4>
                  <ul className="space-y-1">
                    {exerciseInstructions.safetyTips.map((tip: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* 训练日历弹框 */}
      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              训练日历
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 月份导航 */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeMonth('prev')}
                className="p-2"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </Button>
              <h3 className="font-semibold text-lg">
                {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeMonth('next')}
                className="p-2"
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </Button>
            </div>

            {/* 日历网格 */}
            {isCalendarLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* 星期标题 */}
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                
                {/* 日历日期 */}
                {(() => {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const days = [];
                  for (let i = 0; i < 42; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    
                    const isCurrentMonth = date.getMonth() === month;
                    const isWorkoutDay = workoutDays.includes(date.getDate()) && isCurrentMonth;
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    days.push(
                      <div
                        key={i}
                        className={`
                          text-center py-2 text-sm rounded-md cursor-pointer
                          ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                          ${isWorkoutDay ? 'bg-green-100 text-green-800 font-medium' : ''}
                          ${isToday ? 'bg-blue-100 text-blue-800 font-medium' : ''}
                          ${isWorkoutDay && isToday ? 'bg-green-200 text-green-900' : ''}
                          hover:bg-gray-100
                        `}
                      >
                        {date.getDate()}
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>
            )}

            {/* 图例 */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>训练日</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>今天</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              删除训练计划
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              确定要删除训练计划 <span className="font-semibold">"{deleteTarget?.name}"</span> 吗？
            </p>
            <p className="text-sm text-gray-500">
              此操作无法撤销，删除后将无法恢复。
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                '确认删除'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TrainingPage

