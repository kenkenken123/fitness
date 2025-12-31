
'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-4 sm:p-6 pb-8">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
          
          {/* Environment Info */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 truncate">{environment.name}</h1>
              <p className="text-blue-100 text-xs sm:text-sm">管理您的训练器材</p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ml-3">
              <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="text-2xl sm:text-3xl font-bold mb-1">{equipments.length}</div>
              <div className="text-xs text-blue-100">器材数量</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="text-2xl sm:text-3xl font-bold mb-1">{new Set(equipments.map(eq => eq.type)).size}</div>
              <div className="text-xs text-blue-100">器材种类</div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 -mt-6 relative z-10">
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">器材列表</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-500">管理您的训练器材</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button 
                  onClick={handleAiRecognition} 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 transition-all duration-200 shadow-sm text-xs sm:text-sm"
                >
                  <Camera className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> AI识别
                </Button>
                <Button 
                  onClick={handleAddEquipment} 
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
                >
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 添加器材
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {equipments.map((eq, index) => (
                <div 
                  key={eq.id} 
                  className="group flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200 hover:border-blue-200 hover:shadow-lg equipment-item"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      {eq.weight && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{eq.weight}</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-800 text-base sm:text-lg mb-1 truncate">{eq.name}</h4>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-500 truncate">{eq.type}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 truncate">{eq.weight ? `${eq.weight} kg` : '无重量'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditEquipment(eq)}
                      className="hover:bg-blue-100 hover:text-blue-600 rounded-xl p-2"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteEquipment(eq.id)}
                      className="hover:bg-red-100 hover:text-red-600 rounded-xl p-2"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {equipments.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                    <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">暂无器材</h3>
                  <p className="text-gray-500 mb-4 sm:mb-6 text-sm">开始添加您的第一个训练器材吧！</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={handleAiRecognition}
                      variant="outline" 
                      size="sm"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <Camera className="mr-2 h-4 w-4" /> AI识别添加
                    </Button>
                    <Button 
                      onClick={handleAddEquipment}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      <Plus className="mr-2 h-4 w-4" /> 手动添加
                    </Button>
                  </div>
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

      <AiEquipmentRecognitionDialog
        open={isAiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onSuccess={fetchEnvironmentDetails}
        environmentId={environment.id}
      />
    </div>
    </>
  );
};

export default EnvironmentManagementPage;
