using backend.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace fitness.Services
{
    public class AiEquipmentRecognitionService : IAiEquipmentRecognitionService
    {
        private readonly List<string> _equipmentTypes = new List<string>
        {
            "哑铃", "杠铃", "跑步机", "椭圆机", "划船机", "健身车", "力量器械", 
            "史密斯机", "龙门架", "卧推架", "深蹲架", "引体向上器", "腹轮机", 
            "壶铃", "药球", "战绳", "弹力带", "泡沫轴", "瑜伽垫", "平衡球"
        };

        public async Task<AiRecognitionResponseDto> RecognizeEquipmentsAsync(string imageBase64)
        {
            // 模拟AI识别延迟
            await Task.Delay(2000);

            // 这里应该调用真实的AI服务，比如Azure Computer Vision、Google Vision API等
            // 目前使用模拟数据作为示例
            
            var random = new Random();
            var recognizedCount = random.Next(1, 4); // 随机识别1-3个器材
            var recognizedEquipments = new List<RecognizedEquipmentDto>();

            for (int i = 0; i < recognizedCount; i++)
            {
                var equipmentType = _equipmentTypes[random.Next(_equipmentTypes.Count)];
                var confidence = random.NextDouble() * 0.3 + 0.7; // 70%-100%的置信度
                
                var equipment = new RecognizedEquipmentDto
                {
                    Name = equipmentType,
                    Type = equipmentType,
                    Weight = equipmentType.Contains("哑铃") || equipmentType.Contains("杠铃") || equipmentType.Contains("壶铃") || equipmentType.Contains("药球") 
                        ? random.Next(5, 50) 
                        : null,
                    Confidence = Math.Round(confidence, 2)
                };
                
                recognizedEquipments.Add(equipment);
            }

            return new AiRecognitionResponseDto
            {
                RecognizedEquipments = recognizedEquipments,
                Message = $"成功识别到 {recognizedCount} 个器材"
            };
        }
    }
} 