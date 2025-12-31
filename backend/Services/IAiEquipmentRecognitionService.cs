using backend.DTOs;
using System.Threading.Tasks;

namespace fitness.Services
{
    public interface IAiEquipmentRecognitionService
    {
        Task<AiRecognitionResponseDto> RecognizeEquipmentsAsync(string imageBase64);
    }
} 