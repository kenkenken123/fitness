
'use client'

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

interface Equipment {
  id: number;
  name: string;
  type: string;
  weight: number | null;
}

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
  }, [equipment]);

  const handleSubmit = async () => {
    const equipmentData = {
      name,
      type,
      weight: weight ? parseFloat(weight) : null,
    };

    try {
      if (equipment) {
        await axios.put(`/api/equipments/${equipment.id}`, equipmentData);
      } else {
        const response = await axios.post('/api/equipments', equipmentData);
        // Now, we need to associate this new equipment with the environment
        const environmentResponse = await axios.get(`/api/trainingEnvironments/${environmentId}`);
        const currentEquipmentIds = environmentResponse.data.equipmentIds;
        await axios.put(`/api/trainingEnvironments/${environmentId}`, { 
            ...environmentResponse.data, 
            equipmentIds: [...currentEquipmentIds, response.data.id] 
        });
      }
      onSuccess();
      onOpenChange(false);
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
            <Label htmlFor="name">名称</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="type">类型</Label>
            <Input id="type" value={type} onChange={e => setType(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="weight">重量 (kg)</Label>
            <Input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
