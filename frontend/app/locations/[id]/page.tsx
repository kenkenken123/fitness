
'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Dumbbell, Camera, ArrowLeft, Settings, BarChart3 } from "lucide-react";
import { EquipmentDialog } from '@/components/EquipmentDialog';
import { AiEquipmentRecognitionDialog } from '@/components/AiEquipmentRecognitionDialog';
import { useAuth } from "@/src/context/AuthContext"
import { useRouter } from 'next/navigation';

// 添加CSS动画样式
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-slide-in-right {
    animation: slideInRight 0.6s ease-out forwards;
  }
  
  .equipment-item {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
  }
`;

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
  const router = useRouter();
  const { id } = params;
  const [environment, setEnvironment] = useState<TrainingEnvironment | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isAiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isSelectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();

  const fetchEnvironmentDetails = async () => {
    if (id && user && !isAuthLoading) {
      try {
        const envResponse = await axios.get(`/api/trainingEnvironments/${id}`);
        setEnvironment(envResponse.data);
        // Assuming the equipment details need to be fetched separately
        const equipResponse = await axios.get(`/api/Equipments/ByUserId/${user.id}`);
        setEquipments(equipResponse.data.filter((eq: Equipment) => envResponse.data.equipmentIds.includes(eq.id)));
      } catch (error) {
        console.error("Failed to fetch environment details", error);
      }
    }
  };

  useEffect(() => {
    fetchEnvironmentDetails();
  }, [id, user, isAuthLoading]);

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setDialogOpen(true);
  };

  const handleAiRecognition = () => {
    setAiDialogOpen(true);
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

  // 显示加载状态
  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!environment) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">加载环境信息...</p>
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-28">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="bg-candy-mint/30 px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)] sm:p-6 sticky top-0 z-10 rounded-b-[3rem]">
            {/* Back Button */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="bg-white hover:bg-white/80 text-teal-700 p-2 rounded-full shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-white hover:bg-white/80 text-teal-700 p-2 rounded-full shadow-sm"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>



            {/* Environment Info */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-1 sm:mb-2 truncate">{environment.name}</h1>
                <p className="text-teal-700 font-bold text-xs sm:text-sm">管理您的训练器材 🛠️</p>
              </div>
              <div
                className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-lg ml-3 rotate-3 transform hover:rotate-6 transition-transform cursor-pointer hover:scale-105 active:scale-95"
                onClick={() => setSelectionDialogOpen(true)}
              >
                <div className="bg-candy-yellow rounded-xl p-2">
                  <Dumbbell className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>



          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-6 -mt-6 relative z-10">
          <Card className="border-0 shadow-sm rounded-[2.5rem] overflow-hidden bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-white/50 border-b border-gray-50 pb-4 sm:pb-6 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-candy-blue rounded-full flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-black text-gray-800">器材列表</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-400 font-bold">查看所有可用设备</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="space-y-3 sm:space-y-4">
                {equipments.map((eq, index) => (
                  <div
                    key={eq.id}
                    className="group flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-[1.5rem] hover:bg-candy-blue/10 transition-all duration-300 border-2 border-transparent hover:border-candy-blue/30 equipment-item"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                          <Dumbbell className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        {eq.weight && (
                          <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-candy-yellow text-orange-700 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-[10px] font-black">{eq.weight}kg</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-800 text-base sm:text-lg mb-1 truncate">{eq.name}</h4>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="text-gray-500 font-medium truncate bg-white px-2 py-0.5 rounded-md">{eq.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEquipment(eq)}
                        className="bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-xl w-8 h-8 p-0 border border-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEquipment(eq.id)}
                        className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl w-8 h-8 p-0 border border-gray-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {equipments.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Dumbbell className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-600 mb-2">暂无器材</h3>
                    <p className="text-gray-400 mb-6 text-sm font-medium">这里空空如也，快添加一些器材吧！📦</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={handleAiRecognition}
                        variant="outline"
                        size="sm"
                        className="border-2 border-candy-mint text-teal-600 hover:bg-candy-mint/20 rounded-xl font-bold h-10"
                      >
                        <Camera className="mr-2 h-4 w-4" /> AI 拍照识别
                      </Button>
                      <Button
                        onClick={handleAddEquipment}
                        size="sm"
                        className="bg-candy-blue hover:bg-blue-300 text-blue-900 rounded-xl font-bold h-10 shadow-sm"
                      >
                        <Plus className="mr-2 h-4 w-4" /> 手动添加
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div >

        <Dialog open={isSelectionDialogOpen} onOpenChange={setSelectionDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-[2rem] border-0 bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-black text-gray-800">添加新器材</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-6">
              <button
                onClick={() => {
                  setSelectionDialogOpen(false);
                  handleAiRecognition();
                }}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-[1.5rem] bg-candy-mint/20 hover:bg-candy-mint/40 transition-all duration-200 border-2 border-transparent hover:border-candy-mint group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-teal-600" />
                </div>
                <span className="font-bold text-teal-800">📷 拍照识别</span>
              </button>
              <button
                onClick={() => {
                  setSelectionDialogOpen(false);
                  handleAddEquipment();
                }}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-[1.5rem] bg-candy-pink/20 hover:bg-candy-pink/40 transition-all duration-200 border-2 border-transparent hover:border-candy-pink group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-pink-600" />
                </div>
                <span className="font-bold text-pink-800">➕ 手动添加</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <EquipmentDialog
          open={isDialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchEnvironmentDetails}
          equipment={selectedEquipment}
          environmentId={environment.id}
        />

        <AiEquipmentRecognitionDialog
          open={isAiDialogOpen}
          onOpenChange={setAiDialogOpen}
          onSuccess={fetchEnvironmentDetails}
          environmentId={environment.id}
        />
      </div >
    </>
  );
};

export default EnvironmentManagementPage;
