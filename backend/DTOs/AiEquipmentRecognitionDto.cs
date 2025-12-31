using System.Collections.Generic;

namespace backend.DTOs
{
    public class AiEquipmentRecognitionDto
    {
        public string ImageBase64 { get; set; } = string.Empty;
        public int UserId { get; set; }
    }

    public class RecognizedEquipmentDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public double? Weight { get; set; }
        public double Confidence { get; set; }
    }

    public class AiRecognitionResponseDto
    {
        public List<RecognizedEquipmentDto> RecognizedEquipments { get; set; } = new List<RecognizedEquipmentDto>();
        public string Message { get; set; } = string.Empty;
    }
} 