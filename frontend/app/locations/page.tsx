'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Edit, Trash2, Dumbbell } from "lucide-react"
import { AddEnvironmentDialog } from '@/components/AddEnvironmentDialog';
import { getTrainingEnvironmentsByUserId } from '@/src/api/trainingEnvironments';
import axios from 'axios';
import { useAuth } from "@/src/context/AuthContext"

// Define the types for our data
interface TrainingEnvironment {
  id: number;
  name: string;
  equipmentIds: number[];
}

interface Equipment {
  id: number;
  name: string;
}

const LocationsPage = () => {
  const [environments, setEnvironments] = useState<TrainingEnvironment[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();;

  const fetchEnvironments = async (userId: number) => {
    try {
      const data = await getTrainingEnvironmentsByUserId(userId);
      setEnvironments(data);
    } catch (error) {
      console.error("Failed to fetch environments", error);
    }
  };

  const fetchEquipments = async (userId: number) => {
    try {
      const data = await axios.get(`/api/Equipments/ByUserId/${userId}`);
      setEquipments(data.data);
    } catch (error) {
      console.error("Failed to fetch equipments", error);
    }
  };

  useEffect(() => {
    if (user && !isAuthLoading) {
      fetchEnvironments(user.id);
      fetchEquipments(user.id);
    }
  }, [user, isAuthLoading]);

  const handleDelete = async (id: number) => {
    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      await axios.delete(`/api/trainingEnvironments/${id}`);
      fetchEnvironments(user.id); // Refresh the list
    } catch (error) {
      console.error("Failed to delete environment", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">训练环境</h1>
            <p className="text-green-100 mt-1">管理您的训练场所和设备</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Environments List */}
        <div className="space-y-4 mb-6">
          {environments.map((env) => (
            <Link href={`/locations/${env.id}`} key={env.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{env.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {env.equipmentIds.map(equipmentId => {
                            const equipment = equipments.find(e => e.id === equipmentId);
                            return equipment ? <Badge key={equipment.id} variant="secondary">{equipment.name}</Badge> : null;
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.preventDefault(); handleDelete(env.id); }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {environments.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">还没有训练环境</h3>
            <p className="text-gray-500">点击右下角按钮，添加您的第一个训练环境吧！</p>
          </div>
        )}

        {/* Add Button */}
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>

        <AddEnvironmentDialog
          open={isAddDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={() => user && fetchEnvironments(user.id)}
        />
      </div>
    </div>
  )
}

export default LocationsPage