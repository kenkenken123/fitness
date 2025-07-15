
'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
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

  if (!environment) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">管理: {environment.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>器材列表</CardTitle>
          <Button onClick={handleAddEquipment} className="mt-2">
            <Plus className="mr-2 h-4 w-4" /> 添加器材
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {equipments.map(eq => (
              <div key={eq.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div>
                  <p className="font-semibold">{eq.name}</p>
                  <p className="text-sm text-gray-500">{eq.type} - {eq.weight ? `${eq.weight} kg` : 'N/A'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditEquipment(eq)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteEquipment(eq.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
