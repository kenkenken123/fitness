using backend.DTOs;
using fitness.Services;
using Microsoft.AspNetCore.Mvc;

namespace fitness.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrainingEnvironmentsController : ControllerBase
    {
        private readonly ITrainingEnvironmentService _trainingEnvironmentService;

        public TrainingEnvironmentsController(ITrainingEnvironmentService trainingEnvironmentService)
        {
            _trainingEnvironmentService = trainingEnvironmentService;
        }

        /// <summary>
        /// 根据用户ID获取训练环境列表
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>该用户的训练环境列表</returns>
        [HttpGet("user/{userId}")]
        public IActionResult GetEnvironmentsByUserId(int userId)
        {
            var environments = _trainingEnvironmentService.GetAllForUser(userId);
            return Ok(environments);
        }

        [HttpGet("{id}")]
        public IActionResult GetEnvironmentById(int id)
        {
            var environment = _trainingEnvironmentService.GetById(id);
            if (environment == null)
            {
                return NotFound();
            }
            return Ok(environment);
        }

        [HttpPost]
        public IActionResult CreateEnvironment(TrainingEnvironmentDto envDto)
        {
            _trainingEnvironmentService.CreateEnvironment(envDto);
            return Ok();
        }

        [HttpPut("{id}")]
        public IActionResult UpdateEnvironment(int id, TrainingEnvironmentDto envDto)
        {
            _trainingEnvironmentService.UpdateEnvironment(id, envDto);
            return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteEnvironment(int id)
        {
            Console.WriteLine($"Attempting to delete environment with ID: {id}");
            _trainingEnvironmentService.DeleteEnvironment(id);
            return Ok();
        }
    }
}
