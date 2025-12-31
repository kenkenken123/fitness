import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getEquipments } from '@/src/api/equipments';
import { createTrainingEnvironment } from '@/src/api/trainingEnvironments';
import { useAuth } from '@/src/context/AuthContext';

interface Equipment {
  id: number;
  name: string;
  type: string;
  weight: number | null;
}

interface AddEnvironmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddEnvironmentDialog: React.FC<AddEnvironmentDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [name, setName] = useState('');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<number[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      getEquipments(user.id).then(setEquipments).catch(console.error);
    }
  }, [open, user]);

  const handleCheckboxChange = (equipmentId: number) => {
    setSelectedEquipments(prev =>
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const handleSubmit = async () => {
    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      await createTrainingEnvironment({ name, equipmentIds: selectedEquipments }, user.id);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create environment', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-0 shadow-xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-black text-gray-800 text-center">添加新环境</DialogTitle>
          <p className="text-center text-sm text-gray-400 font-bold">创建你的专属训练基地 🏟️</p>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-600 ml-1">环境名称</Label>
            <Input
              placeholder="例如: 🏠 家庭健身房"
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:border-candy-mint focus:ring-candy-mint h-12 transition-all font-medium"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-600 ml-1">可用设备</Label>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {equipments.map(eq => (
                <div
                  key={eq.id}
                  className={`flex items-center space-x-3 p-3 rounded-2xl transition-all duration-200 border ${selectedEquipments.includes(eq.id)
                      ? 'bg-candy-mint/10 border-candy-mint/50 shadow-sm'
                      : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  onClick={() => handleCheckboxChange(eq.id)}
                >
                  <Checkbox
                    id={`equip-${eq.id}`}
                    checked={selectedEquipments.includes(eq.id)}
                    onCheckedChange={() => handleCheckboxChange(eq.id)}
                    className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 rounded-lg w-5 h-5 border-2 border-gray-300"
                  />
                  <Label htmlFor={`equip-${eq.id}`} className="flex-1 cursor-pointer font-bold text-gray-700">
                    {eq.name}
                  </Label>
                </div>
              ))}
              {equipments.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  暂无可用设备
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button
            onClick={handleSubmit}
            className="w-full h-12 rounded-2xl bg-candy-mint hover:bg-teal-200 text-teal-800 font-bold text-lg shadow-sm hover:shadow-md transition-all"
          >
            确认添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
