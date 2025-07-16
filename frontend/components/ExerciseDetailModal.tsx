'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Target, CheckCircle, AlertTriangle } from "lucide-react"
import axios from 'axios'

interface ExerciseDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseName: string
  weight: number
  sets: number
  reps: number
}

interface ExerciseInstruction {
  description: string
  keyPoints: string[]
  commonMistakes: string[]
  safetyTips: string[]
  muscles: string[]
}

export const ExerciseDetailModal = ({ 
  open, 
  onOpenChange, 
  exerciseName, 
  weight, 
  sets, 
  reps 
}: ExerciseDetailModalProps) => {
  const [instruction, setInstruction] = useState<ExerciseInstruction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExerciseInstruction = async () => {
    if (!exerciseName) return

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.post('/api/exercises/instructions', {
        exerciseName,
        weight,
        sets,
        reps
      })
      setInstruction(response.data)
    } catch (error) {
      console.error('Failed to fetch exercise instructions:', error)
      setError('获取训练指导失败，请稍后再试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (newOpen) {
      fetchExerciseInstruction()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">
            {exerciseName}
          </DialogTitle>
          <DialogDescription className="text-base">
            重量: {weight}kg × {sets}组 × {reps}次
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : instruction ? (
            <div className="space-y-6">
              {/* 动作描述 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  动作描述
                </h3>
                <p className="text-gray-700 leading-relaxed">{instruction.description}</p>
              </div>

              {/* 目标肌肉 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  目标肌肉
                </h3>
                <div className="flex flex-wrap gap-2">
                  {instruction.muscles.map((muscle, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {/* 关键要点 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  关键要点
                </h3>
                <ul className="space-y-2">
                  {instruction.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 常见错误 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  常见错误
                </h3>
                <ul className="space-y-2">
                  {instruction.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 安全提示 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  安全提示
                </h3>
                <ul className="space-y-2">
                  {instruction.safetyTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}