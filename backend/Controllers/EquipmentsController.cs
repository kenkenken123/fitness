using backend.DTOs;
using fitness.Entities;
using Furion.DatabaseAccessor;
using Furion.FriendlyException;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace fitness.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipmentsController : ControllerBase
    {
        private readonly IRepository<Equipment> _equipmentRepository;

        public EquipmentsController(IRepository<Equipment> equipmentRepository)
        {
            _equipmentRepository = equipmentRepository;
        }

        [HttpGet]
        public IEnumerable<Equipment> GetEquipments()
        {
            return _equipmentRepository.AsQueryable().ToList();
        }

        [HttpPost]
        public IActionResult CreateEquipment([FromBody] EquipmentDto equipmentDto)
        {
            var equipment = new Equipment
            {
                Name = equipmentDto.Name,
                Type = equipmentDto.Type,
                Weight = equipmentDto.Weight
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
    }
}
