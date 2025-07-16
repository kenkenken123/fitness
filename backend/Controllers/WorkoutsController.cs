using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace fitness.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkoutsController : ControllerBase
    {
        private readonly IWorkoutService _workoutService;

        public WorkoutsController(IWorkoutService workoutService)
        {
            _workoutService = workoutService;
        }

        /// <summary>
        /// 获取用户的所有训练记录
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>训练记录列表</returns>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserWorkouts(int userId)
        {
            var workouts = await _workoutService.GetUserWorkoutsAsync(userId);
            return Ok(workouts);
        }

        /// <summary>
        /// 获取用户最近训练记录
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="limit">返回记录数量限制</param>
        /// <returns>最近训练记录列表</returns>
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentWorkouts([FromQuery] int userId, [FromQuery] int limit = 10)
        {
            var workouts = await _workoutService.GetRecentWorkoutsAsync(userId, limit);
            return Ok(workouts);
        }

        /// <summary>
        /// 获取用户仪表盘数据
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>仪表盘数据</returns>
        [HttpGet("users/{userId}/dashboard")]
        public async Task<IActionResult> GetUserDashboard(int userId)
        {
            var dashboard = await _workoutService.GetUserDashboardAsync(userId);
            return Ok(dashboard);
        }

        /// <summary>
        /// 获取用户统计数据
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="period">统计周期</param>
        /// <returns>统计数据</returns>
        [HttpGet("users/{userId}/statistics")]
        public async Task<IActionResult> GetUserStatistics(int userId, [FromQuery] string period = "all")
        {
            var statistics = await _workoutService.GetUserStatisticsAsync(userId, period);
            return Ok(statistics);
        }

        /// <summary>
        /// 根据ID获取训练记录
        /// </summary>
        /// <param name="id">训练记录ID</param>
        /// <returns>训练记录详情</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkoutById(int id)
        {
            var workout = await _workoutService.GetWorkoutByIdAsync(id);
            if (workout == null)
                return NotFound();

            return Ok(workout);
        }

        /// <summary>
        /// 创建新的训练记录
        /// </summary>
        /// <param name="workoutDto">训练数据</param>
        /// <returns>创建的训练记录</returns>
        [HttpPost]
        public async Task<IActionResult> CreateWorkout([FromBody] CreateWorkoutDto workoutDto)
        {
            // 这里应该从认证信息中获取用户ID，暂时使用固定值
            int userId = 1;
            var workout = await _workoutService.CreateWorkoutAsync(workoutDto, userId);
            return CreatedAtAction(nameof(GetWorkoutById), new { id = workout.Id }, workout);
        }

        /// <summary>
        /// 更新训练记录
        /// </summary>
        /// <param name="id">训练记录ID</param>
        /// <param name="workoutDto">更新数据</param>
        /// <returns>更新后的训练记录</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkout(int id, [FromBody] UpdateWorkoutDto workoutDto)
        {
            var workout = await _workoutService.UpdateWorkoutAsync(id, workoutDto);
            if (workout == null)
                return NotFound();

            return Ok(workout);
        }

        /// <summary>
        /// 删除训练记录
        /// </summary>
        /// <param name="id">训练记录ID</param>
        /// <returns>删除结果</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkout(int id)
        {
            var result = await _workoutService.DeleteWorkoutAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}