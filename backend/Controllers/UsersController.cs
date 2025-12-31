using backend.DTOs;
using backend.Services;
using fitness.Services;
using Microsoft.AspNetCore.Mvc;

namespace fitness.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public IActionResult Register(UserRegisterDto userDto)
        {
            try
            {
                _userService.Register(userDto);
                return Ok(new { message = "注册成功" });
            }
            catch (Exception ex)
            {
                // 返回友好的中文错误信息
                return BadRequest(new { message = ex.Message.Contains("already exists") ? "用户名已存在" : "注册失败，请稍后重试" });
            }
        }

        [HttpPost("login")]
        public IActionResult Login(UserLoginDto userDto)
        {
            try
            {
                var user = _userService.Login(userDto);
                // 返回更多用户信息，但排除密码哈希
                return Ok(new { user.Id, user.Username, user.Email, user.JoinDate, user.Avatar });
            }
            catch (Exception ex)
            {
                // 返回友好的中文错误信息
                return BadRequest(new { message = ex.Message.Contains("Invalid") ? "用户名或密码错误" : "登录失败，请稍后重试" });
            }
        }

        [HttpGet("{id}/profile")]
        public async Task<IActionResult> GetUserProfile(int id)
        {
            var userProfile = await _userService.GetUserProfileAsync(id);
            return Ok(userProfile);
        }
    }
}
