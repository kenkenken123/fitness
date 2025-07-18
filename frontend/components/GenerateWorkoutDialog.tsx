'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getTrainingEnvironmentsByUserId } from '@/src/api/trainingEnvironments'
import axios from 'axios'

interface TrainingEnvironment {
  id: number;
  name: string;
}

interface GenerateWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newWorkoutLog: any) => void;
  userId: number; // Assuming you have the user's ID
}

export const GenerateWorkoutDialog = ({ open, onOpenChange, onSuccess, userId }: GenerateWorkoutDialogProps) => {
  const [environments, setEnvironments] = useState<TrainingEnvironment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | undefined>(undefined);
  const [trainingFocus, setTrainingFocus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchEnvironments = async () => {
        try {
          const data = await getTrainingEnvironmentsByUserId(userId);
          setEnvironments(data);
        } catch (error) {
          console.error("Failed to fetch environments", error);
        }
      };
      fetchEnvironments();
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!selectedEnvironment) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/workoutlogs/generate', {
        trainingEnvironmentId: parseInt(selectedEnvironment),
        userId: userId,
        trainingFocus: trainingFocus || undefined,
      });
      onSuccess(response.data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to generate workout log", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI 生成训练计划</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600">请选择一个训练环境，AI将根据该环境的可用器材为您量身定制一套训练计划。</p>
          
          <div>
            <Label className="mb-2 block">训练环境</Label>
            <Select onValueChange={setSelectedEnvironment} value={selectedEnvironment}>
              <SelectTrigger>
                <SelectValue placeholder="选择训练环境..." />
              </SelectTrigger>
              <SelectContent>
                {environments.map(env => (
                  <SelectItem key={env.id} value={String(env.id)}>
                    {env.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="training-focus" className="mb-2 block">训练重点（可选）</Label>
            <Input
              id="training-focus"
              placeholder="例如：胸部训练、腿部训练、核心力量..."
              value={trainingFocus}
              onChange={(e) => setTrainingFocus(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleGenerate} disabled={!selectedEnvironment || isLoading}>
            {isLoading ? '生成中...' : '生成计划'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
