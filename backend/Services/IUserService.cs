using backend.DTOs;
using fitness.Entities;

namespace fitness.Services
{
    public interface IUserService
    {
        void Register(UserRegisterDto userDto);
        User Login(UserLoginDto userDto);
        Task<UserProfileDto> GetUserProfileAsync(int userId);
    }
}
