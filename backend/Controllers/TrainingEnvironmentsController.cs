using fitness.DTOs;
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

        [HttpGet]
        public IActionResult GetEnvironments()
        {
            var environments = _trainingEnvironmentService.GetEnvironments();
            return Ok(environments);
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
            _trainingEnvironmentService.DeleteEnvironment(id);
            return Ok();
        }
    }
}
