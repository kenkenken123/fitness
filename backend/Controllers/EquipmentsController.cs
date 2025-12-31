using backend.DTOs;
using fitness.Entities;
using fitness.Services;
using Furion.DatabaseAccessor;
using Furion.FriendlyException;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace fitness.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipmentsController : ControllerBase
    {
        private readonly IRepository<Equipment> _equipmentRepository;
        private readonly IAiEquipmentRecognitionService _aiRecognitionService;

        public EquipmentsController(IRepository<Equipment> equipmentRepository, IAiEquipmentRecognitionService aiRecognitionService)
        {
            _equipmentRepository = equipmentRepository;
            _aiRecognitionService = aiRecognitionService;
        }

        [HttpGet("ByUserId/{userId}")]
        public IEnumerable<Equipment> GetEquipments(int userId)
        {
            return _equipmentRepository.AsQueryable().Where(e => e.UserId == userId).ToList();
        }

        [HttpPost]
        public IActionResult CreateEquipment([FromBody] EquipmentDto equipmentDto)
        {
            var equipment = new Equipment
            {
                Name = equipmentDto.Name,
                Type = equipmentDto.Type,
                Weight = equipmentDto.Weight,
                UserId = equipmentDto.UserId
            };
            _equipmentRepository.Insert(equipment);
            return Ok(equipment);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateEquipment(int id, [FromBody] EquipmentDto equipmentDto)
        {
            var equipment = _equipmentRepository.Find(id);
            if (equipment == null) throw Oops.Oh("Equipment not found.");

            equipment.Name = equipmentDto.Name;
            equipment.Type = equipmentDto.Type;
            equipment.Weight = equipmentDto.Weight;

            _equipmentRepository.Update(equipment);
            return Ok(equipment);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteEquipment(int id)
        {
            var equipment = _equipmentRepository.Find(id);
            if (equipment == null) throw Oops.Oh("Equipment not found.");

            _equipmentRepository.Delete(equipment);
            return Ok();
        }

        [HttpPost("recognize")]
        public async Task<IActionResult> RecognizeEquipments([FromBody] AiEquipmentRecognitionDto request)
        {
            try
            {
                var result = await _aiRecognitionService.RecognizeEquipmentsAsync(request.ImageBase64);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "AI识别失败: " + ex.Message });
            }
        }
    }
}
