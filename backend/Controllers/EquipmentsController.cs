using fitness.Entities;
using Furion.DatabaseAccessor;
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
    }
}
