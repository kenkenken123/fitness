
'use client'

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

interface Equipment {
  id: number;
  name: string;
  type: string;
  weight: number | null;
}

const EQUIPMENT_TYPES = [
  '哑铃',
  '杠铃',
  '跑步机',
  '椭圆机',
  '划船机',
  '健身车',
  '力量器械',
  '史密斯机',
  '龙门架',
  '卧推架',
  '深蹲架',
  '引体向上器',
  '腹轮机',
  '壶铃',
  '药球',
  '战绳',
  '弹力带',
  '泡沫轴',
  '瑜伽垫',
  '平衡球'
];

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  equipment: Equipment | null;
  environmentId: number;
}

export const EquipmentDialog: React.FC<EquipmentDialogProps> = ({ open, onOpenChange, onSuccess, equipment, environmentId }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [weight, setWeight] = useState<string>('');

  useEffect(() => {
    if (equipment) {
      setName(equipment.name);
      setType(equipment.type);
      setWeight(equipment.weight?.toString() || '');
    } else {
      setName('');
      setType('');
      setWeight('');
    }
  }, [equipment, open]); // 依赖 open 确保每次打开都重置

  // 当类型改变时，如果是新增状态，则自动填充名称
  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (!equipment) {
      setName(newType);
    }
  };

  const handleSubmit = async () => {
    const equipmentData = {
      name,
      type,
      weight: weight ? parseFloat(weight) : null,
    };

    try {
      if (equipment) {
        // 更新现有器材
        await axios.put(`/api/equipments/${equipment.id}`, equipmentData);
      } else {
        // 创建新器材并关联到环境
        const response = await axios.post('/api/equipments', equipmentData);
        const environmentResponse = await axios.get(`/api/trainingEnvironments/${environmentId}`);
        const currentEquipmentIds = environmentResponse.data.equipmentIds;
        await axios.put(`/api/trainingEnvironments/${environmentId}`, { 
            ...environmentResponse.data, 
            equipmentIds: [...currentEquipmentIds, response.data.id] 
        });
        // 成功添加后清空表单，以便连续添加
        setName('');
        setType('');
        setWeight('');
      }
      onSuccess(); // 调用回调函数刷新列表
      onOpenChange(false); // 关闭对话框
    } catch (error) {
      console.error('Failed to save equipment', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{equipment ? '编辑器材' : '添加器材'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="type">器材类型</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="请选择器材类型" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((equipmentType) => (
                  <SelectItem key={equipmentType} value={equipmentType}>
                    {equipmentType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="name">器材名称</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="请输入器材名称"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="weight">重量 (kg)</Label>
            <Input 
              id="weight" 
              type="number" 
              value={weight} 
              onChange={e => setWeight(e.target.value)} 
              placeholder="可选：输入重量"
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
            {equipment ? '更新' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
