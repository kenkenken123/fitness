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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-28">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="bg-candy-blue/20 px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)] sm:p-6 rounded-b-[3rem]">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="bg-candy-blue rounded-full p-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-800">训练环境</h1>
                <p className="text-gray-500 text-sm font-bold">管理您的训练场所 🏠</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center shadow-none">
              <MapPin className="w-8 h-8 text-blue-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 relative z-10 -mt-4">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">您的场所</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">共 {environments.length} 个环境</p>
          </div>
          <div className="w-10 h-10 bg-candy-mint rounded-full flex items-center justify-center">
            <span className="text-lg font-black text-teal-700">{environments.length}</span>
          </div>
        </div>

        {/* Environments List */}
        <div className="space-y-4 mb-8">
          {environments.map((env, index) => (
            <Link href={`/locations/${env.id}`} key={env.id} className="block group">
              <Card className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white hover:shadow-md transition-all duration-300 relative">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative">
                        <div className="w-16 h-16 bg-candy-blue/20 rounded-[1.5rem] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <Dumbbell className="w-8 h-8 text-blue-500" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-candy-pink rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-xs text-white font-bold">{env.equipmentIds.length}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="font-black text-xl text-gray-800 truncate">{env.name}</h3>
                        <div className="flex flex-wrap gap-1">
                          {env.equipmentIds.slice(0, 3).map(equipmentId => {
                            const equipment = equipments.find(e => e.id === equipmentId);
                            return equipment ? (
                              <Badge
                                key={equipment.id}
                                variant="secondary"
                                className="text-[10px] bg-gray-100 text-gray-500 border-0 hover:bg-gray-200"
                              >
                                {equipment.name}
                              </Badge>
                            ) : null;
                          })}
                          {env.equipmentIds.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500 border-0">+{env.equipmentIds.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.preventDefault(); handleDelete(env.id); }}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full w-10 h-10 p-0"
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
            <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-none">
              <MapPin className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">还没有训练环境</h3>
            <p className="text-gray-400 text-sm font-bold mb-8">点击右下角按钮，添加您的第一个训练环境吧！✨</p>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-candy-mint hover:bg-teal-300 text-teal-800 px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-bold text-lg"
            >
              <Plus className="w-6 h-6 mr-2" />
              添加训练环境
            </Button>
          </div>
        )}

        {/* Add Button */}
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-candy-blue hover:bg-blue-300 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-4 border-white"
        >
          <Plus className="w-8 h-8" />
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