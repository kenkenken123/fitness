# AI器材识别功能

## 功能概述

新增了基于AI的器材识别功能，用户可以通过拍照或上传图片来快速识别和添加器材到训练环境中。

## 功能特点

### 1. 多种输入方式
- **拍照识别**: 使用设备摄像头直接拍摄器材照片
- **上传图片**: 从相册选择已有图片进行识别

### 2. AI智能识别
- 支持识别多种健身器材类型
- 自动识别器材重量（适用于哑铃、杠铃等）
- 提供识别置信度评分

### 3. 批量添加
- 支持同时识别多个器材
- 通过多选框选择要添加的器材
- 一键批量添加到训练环境

## 使用方法

### 1. 进入训练环境详情页
1. 打开应用，进入"训练环境"页面
2. 点击任意训练环境进入详情页

### 2. 使用AI识别功能
1. 在器材列表页面，点击"AI识别"按钮
2. 选择拍照或上传图片
3. 等待AI识别完成（约2-3秒）
4. 查看识别结果，选择要添加的器材
5. 点击"添加选中器材"完成添加

## 技术实现

### 后端架构
- **控制器**: `EquipmentsController.cs` - 新增 `/api/Equipments/recognize` 接口
- **服务层**: `AiEquipmentRecognitionService.cs` - AI识别逻辑实现
- **DTO**: `AiEquipmentRecognitionDto.cs` - 数据传输对象

### 前端组件
- **主组件**: `AiEquipmentRecognitionDialog.tsx` - AI识别对话框
- **集成**: 在训练环境详情页添加AI识别按钮

### AI识别流程
1. 前端将图片转换为Base64格式
2. 发送到后端AI识别接口
3. 后端模拟AI识别（可替换为真实AI服务）
4. 返回识别结果和置信度
5. 前端展示结果供用户选择

## 支持的器材类型

目前支持识别以下器材类型：
- 哑铃、杠铃、壶铃、药球
- 跑步机、椭圆机、划船机、健身车
- 力量器械、史密斯机、龙门架
- 卧推架、深蹲架、引体向上器
- 腹轮机、战绳、弹力带
- 泡沫轴、瑜伽垫、平衡球

## 扩展说明

### 集成真实AI服务
当前使用模拟数据，可以轻松替换为真实的AI服务：

1. **Azure Computer Vision**
2. **Google Vision API**
3. **AWS Rekognition**
4. **自定义AI模型**

### 示例代码
```csharp
// 在AiEquipmentRecognitionService.cs中替换模拟逻辑
public async Task<AiRecognitionResponseDto> RecognizeEquipmentsAsync(string imageBase64)
{
    // 调用真实AI服务
    var aiResult = await _aiService.AnalyzeImage(imageBase64);
    
    // 处理AI返回结果
    var recognizedEquipments = aiResult.Objects
        .Where(obj => IsEquipment(obj.Label))
        .Select(obj => new RecognizedEquipmentDto
        {
            Name = obj.Label,
            Type = obj.Label,
            Weight = ExtractWeight(obj.Label),
            Confidence = obj.Confidence
        })
        .ToList();
    
    return new AiRecognitionResponseDto
    {
        RecognizedEquipments = recognizedEquipments,
        Message = $"成功识别到 {recognizedEquipments.Count} 个器材"
    };
}
```

## 注意事项

1. **隐私保护**: 图片数据仅用于AI识别，不会永久存储
2. **网络要求**: 需要稳定的网络连接进行AI识别
3. **图片质量**: 清晰的图片能提高识别准确率
4. **权限要求**: 需要摄像头和相册访问权限

## 未来改进

1. **离线识别**: 支持本地AI模型进行离线识别
2. **多语言支持**: 支持英文等其他语言的器材识别
3. **自定义训练**: 允许用户训练自定义器材识别模型
4. **批量处理**: 支持一次识别多张图片
5. **历史记录**: 保存识别历史，提高重复识别效率 