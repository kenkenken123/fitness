using fitness.DTOs;
using fitness.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace fitness.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkoutLogsController : ControllerBase
    {
        private readonly IWorkoutLogService _workoutLogService;

        public WorkoutLogsController(IWorkoutLogService workoutLogService)
        {
            _workoutLogService = workoutLogService;
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetWorkoutLogs(int userId)
        {
            var logs = _workoutLogService.GetWorkoutLogs(userId);
            return Ok(logs);
        }

        [HttpPost]
        public IActionResult CreateWorkoutLog(WorkoutLogDto logDto)
        {
            _workoutLogService.CreateWorkoutLog(logDto);
            return Ok();
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateWorkoutLog([FromBody] GenerateWorkoutLogRequest request)
        {
            var workoutLog = await _workoutLogService.GenerateWorkoutLogAsync(request.TrainingEnvironmentId, request.UserId);
            return Ok(workoutLog);
        }
    }

    public class GenerateWorkoutLogRequest
    {
        public int TrainingEnvironmentId { get; set; }
        public int UserId { get; set; }
    }
}
