using backend.DTOs;
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

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateWorkoutLog([FromBody] GenerateWorkoutLogRequest request)
        {
            var workoutLog = await _workoutLogService.GenerateWorkoutLogAsync(request.TrainingEnvironmentId, request.UserId, request.TrainingFocus);
            return Ok(workoutLog);
        }

        [HttpPut("{logId}/sets/{setId}/complete")]
        public IActionResult UpdateWorkoutSetCompletion(int logId, int setId, [FromBody] UpdateWorkoutSetCompletionRequest request)
        {
            _workoutLogService.UpdateWorkoutSetCompletion(setId, request.IsCompleted);
            return Ok();
        }

        [HttpPut("{logId}/complete")]
        public IActionResult UpdateWorkoutLogCompletion(int logId, [FromBody] UpdateWorkoutLogCompletionRequest request)
        {
            _workoutLogService.UpdateWorkoutLogCompletion(logId, request.IsCompleted);
            return Ok();
        }
    }

    public class GenerateWorkoutLogRequest
    {
        public int TrainingEnvironmentId { get; set; }
        public int UserId { get; set; }
        public string TrainingFocus { get; set; }
    }

    public class UpdateWorkoutSetCompletionRequest
    {
        public bool IsCompleted { get; set; }
    }

    public class UpdateWorkoutLogCompletionRequest
    {
        public bool IsCompleted { get; set; }
    }
}
