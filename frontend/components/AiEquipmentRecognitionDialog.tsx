'use client'

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/src/context/AuthContext';

interface RecognizedEquipment {
  name: string;
  type: string;
  weight?: number;
  confidence: number;
}

interface AiRecognitionResponse {
  recognizedEquipments: RecognizedEquipment[];
  message: string;
}

interface AiEquipmentRecognitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  environmentId: number;
}

export const AiEquipmentRecognitionDialog: React.FC<AiEquipmentRecognitionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  environmentId
}) => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<AiRecognitionResponse | null>(null);
  const [selectedEquipments, setSelectedEquipments] = useState<Set<number>>(new Set());
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { user } = useAuth();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('无法访问摄像头:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const recognizeEquipments = async () => {
    if (!capturedImage || !user) return;

    setIsRecognizing(true);
    try {
      // 移除data:image/jpeg;base64,前缀
      const base64Data = capturedImage.split(',')[1];
      
      const response = await axios.post('/api/Equipments/recognize', {
        imageBase64: base64Data,
        userId: user.id
      });
      
      setRecognitionResult(response.data);
    } catch (error) {
      console.error('AI识别失败:', error);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleEquipmentToggle = (index: number) => {
    const newSelected = new Set(selectedEquipments);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedEquipments(newSelected);
  };

  const handleAddSelectedEquipments = async () => {
    if (!recognitionResult || !user || selectedEquipments.size === 0) return;

    try {
      const selectedEquipmentsList = Array.from(selectedEquipments).map(index => 
        recognitionResult.recognizedEquipments[index]
      );

      // 为每个选中的器材创建记录
      for (const equipment of selectedEquipmentsList) {
        const equipmentData = {
          name: equipment.name,
          type: equipment.type,
          weight: equipment.weight,
          userId: user.id,
        };

        const response = await axios.post('/api/equipments', equipmentData);
        
        // 将器材添加到环境中
        const environmentResponse = await axios.get(`/api/trainingEnvironments/${environmentId}`);
        const currentEquipmentIds = environmentResponse.data.equipmentIds;
        await axios.put(`/api/trainingEnvironments/${environmentId}`, { 
          ...environmentResponse.data, 
          equipmentIds: [...currentEquipmentIds, response.data.id] 
        });
      }

      onSuccess();
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error('添加器材失败:', error);
    }
  };

  const resetDialog = () => {
    setCapturedImage(null);
    setRecognitionResult(null);
    setSelectedEquipments(new Set());
    stopCamera();
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            AI器材识别
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 拍照/上传区域 */}
          {!capturedImage && !recognitionResult && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  拍照或上传图片来识别器材
                </p>
              </div>

              {/* 摄像头预览 */}
              {stream && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <Button
                    onClick={capturePhoto}
                    className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-black"
                    size="sm"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                {!stream ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    拍照
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="outline" className="flex-1">
                    取消拍照
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  上传
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* 已拍摄的图片 */}
          {capturedImage && !recognitionResult && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="拍摄的器材"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  onClick={() => setCapturedImage(null)}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/90"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                onClick={recognizeEquipments}
                disabled={isRecognizing}
                className="w-full"
              >
                {isRecognizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    识别中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    开始识别
                  </>
                )}
              </Button>
            </div>
          )}

          {/* 识别结果 */}
          {recognitionResult && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-green-600 mb-2">
                  {recognitionResult.message}
                </p>
              </div>

              <div className="space-y-2">
                {recognitionResult.recognizedEquipments.map((equipment, index) => (
                  <Card key={index} className="p-3">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedEquipments.has(index)}
                          onCheckedChange={() => handleEquipmentToggle(index)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{equipment.name}</h4>
                            <Badge variant="secondary">
                              {Math.round(equipment.confidence * 100)}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{equipment.type}</span>
                            {equipment.weight && (
                              <span className="text-sm text-gray-500">
                                {equipment.weight}kg
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          {recognitionResult && selectedEquipments.size > 0 && (
            <Button onClick={handleAddSelectedEquipments}>
              添加选中器材 ({selectedEquipments.size})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 