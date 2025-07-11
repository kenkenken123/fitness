using fitness.DTOs;
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
            return Ok();
        }

        [HttpPost("login")]
        public IActionResult Login(UserLoginDto userDto)
        {
            var result = _userService.Login(userDto);
            return Ok(result);
        }
    }
}
