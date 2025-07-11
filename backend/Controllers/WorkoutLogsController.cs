using fitness.DTOs;
using fitness.Services;
using Microsoft.AspNetCore.Mvc;

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
    }
}
