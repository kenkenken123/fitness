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
        /// 获取用户仪表盘数据
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>仪表盘数据</returns>
        [HttpGet("users/{userId}/dashboard")]
        public async Task<IActionResult> GetUserDashboard(int userId)
        {
            try
            {
                var dashboard = await _workoutService.GetUserDashboardAsync(userId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}