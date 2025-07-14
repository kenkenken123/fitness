import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getEquipments, createTrainingEnvironment, Equipment } from '@/api/trainingEnvironments';

interface AddEnvironmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddEnvironmentDialog: React.FC<AddEnvironmentDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [name, setName] = useState('');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      getEquipments().then(setEquipments).catch(console.error);
    }
  }, [open]);

  const handleCheckboxChange = (equipmentId: number) => {
    setSelectedEquipments(prev =>
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const handleSubmit = async () => {
    try {
      await createTrainingEnvironment({ name, equipmentIds: selectedEquipments });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create environment', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加新的训练环境</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="环境名称 (例如: 家庭健身房)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className="space-y-2">
            <Label>选择你拥有的设备:</Label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {equipments.map(eq => (
                <div key={eq.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`equip-${eq.id}`}
                    checked={selectedEquipments.includes(eq.id)}
                    onCheckedChange={() => handleCheckboxChange(eq.id)}
                  />
                  <Label htmlFor={`equip-${eq.id}`}>{eq.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>确认添加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
