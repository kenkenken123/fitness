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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">训练历史</h1>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={openCalendar}>
            <CalendarDays className="w-4 h-4 mr-2" />
            训练日历
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant={log.isCompleted ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleLogCompletionToggle(log.id, !log.isCompleted)}
                      className="cursor-pointer"
                    >
                      {log.isCompleted ? '已完成' : '标记完成'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(log.id, log.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
                              className="p-0 h-auto font-medium hover:bg-transparent text-left hover:text-blue-500"
                              onClick={() => {
                                console.log('运动名称被点击，运动名称:', exercise.activityName);
                                getExerciseInstructions(exercise.activityName, exercise.weight, exercise.sets, exercise.reps);
                              }}
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

