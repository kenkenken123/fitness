
'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Dumbbell } from "lucide-react";
import { EquipmentDialog } from '@/components/EquipmentDialog';

interface Equipment {
  id: number;
  name: string;
  type: string;
  weight: number | null;
}

interface TrainingEnvironment {
  id: number;
  name: string;
  equipmentIds: number[];
}

const EnvironmentManagementPage = () => {
  const params = useParams();
  const { id } = params;
  const [environment, setEnvironment] = useState<TrainingEnvironment | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const fetchEnvironmentDetails = async () => {
    if (id) {
      try {
        const envResponse = await axios.get(`/api/trainingEnvironments/${id}`);
        setEnvironment(envResponse.data);
        // Assuming the equipment details need to be fetched separately
        const equipResponse = await axios.get(`/api/equipments`);
        setEquipments(equipResponse.data.filter((eq: Equipment) => envResponse.data.equipmentIds.includes(eq.id)));
      } catch (error) {
        console.error("Failed to fetch environment details", error);
      }
    }
  };

  useEffect(() => {
    fetchEnvironmentDetails();
  }, [id]);

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setDialogOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogOpen(true);
  };

  const handleDeleteEquipment = async (equipmentId: number) => {
    try {
      await axios.delete(`/api/equipments/${equipmentId}`);
      fetchEnvironmentDetails(); // Refresh list
    } catch (error) {
      console.error('Failed to delete equipment', error);
    }
  };

  if (!environment) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{environment.name}</h1>
            <p className="text-blue-100 mt-1">管理您的训练器材</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{equipments.length}</div>
            <div className="text-xs text-blue-100">器材数量</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{new Set(equipments.map(eq => eq.type)).size}</div>
            <div className="text-xs text-blue-100">器材种类</div>
          </div>
        </div>
      </div>

      <div className="p-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              器材列表
            </CardTitle>
            <Button onClick={handleAddEquipment} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> 添加器材
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {equipments.map(eq => (
              <div key={eq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{eq.name}</h4>
                    <p className="text-xs text-gray-500">{eq.type} • {eq.weight ? `${eq.weight} kg` : '无重量'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditEquipment(eq)}
                    className="hover:bg-blue-100 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteEquipment(eq.id)}
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {equipments.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">暂无器材，请添加您的第一个器材</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      </div>

      <EquipmentDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchEnvironmentDetails}
        equipment={selectedEquipment}
        environmentId={environment.id}
      />
    </div>
  );
};

export default EnvironmentManagementPage;
