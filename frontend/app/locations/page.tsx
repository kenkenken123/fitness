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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-green-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-6 pb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">训练环境</h1>
                <p className="text-green-100 text-xs sm:text-sm">管理您的训练场所和设备</p>
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 -mt-6 relative z-10">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">您的训练环境</h2>
              <p className="text-sm text-gray-500">共 {environments.length} 个训练场所</p>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{environments.length}</div>
              <div className="text-xs text-gray-500">个环境</div>
            </div>
          </div>
        </div>
        
        {/* Environments List */}
        <div className="space-y-6 mb-8">
          {environments.map((env, index) => (
            <Link href={`/locations/${env.id}`} key={env.id}>
              <Card className="border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <Dumbbell className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{env.equipmentIds.length}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl sm:text-2xl text-gray-800 mb-3 truncate">{env.name}</h3>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {env.equipmentIds.map(equipmentId => {
                            const equipment = equipments.find(e => e.id === equipmentId);
                            return equipment ? (
                              <Badge 
                                key={equipment.id} 
                                variant="secondary"
                                className="text-sm bg-gradient-to-r from-green-50 to-teal-50 text-green-700 border border-green-200 hover:from-green-100 hover:to-teal-100 transition-all duration-200 font-medium"
                              >
                                {equipment.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.preventDefault(); handleDelete(env.id); }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {environments.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-3">还没有训练环境</h3>
            <p className="text-gray-500 text-base mb-8">点击右下角按钮，添加您的第一个训练环境吧！</p>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              添加训练环境
            </Button>
          </div>
        )}

        {/* Add Button */}
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="fixed bottom-24 right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-2xl hover:shadow-3xl text-white transition-all duration-300 hover:scale-110 border-4 border-white"
        >
          <Plus className="w-7 h-7 sm:w-8 sm:h-8" />
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