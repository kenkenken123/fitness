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
            _userService.Register(userDto);
            return Ok(new { message = "Registration successful" });
        }

        [HttpPost("login")]
        public IActionResult Login(UserLoginDto userDto)
        {
            var user = _userService.Login(userDto);
            // 返回更多用户信息，但排除密码哈希
            return Ok(new { user.Id, user.Username, user.Email, user.JoinDate, user.Avatar });
        }

        [HttpGet("{id}/profile")]
        public async Task<IActionResult> GetUserProfile(int id)
        {
            var userProfile = await _userService.GetUserProfileAsync(id);
            return Ok(userProfile);
        }
    }
}
