using fitness.DTOs;
using fitness.Entities;
using Furion.DatabaseAccessor;
using System.Linq;
using BCrypt.Net;
using Furion.FriendlyException;
using Furion.DependencyInjection;

namespace fitness.Services
{
    [Injection(Named = "UserService")]
    public class UserService : IUserService, ITransient
    {
        private readonly IRepository<User> _userRepository;

        public UserService(IRepository<User> userRepository)
        {
            _userRepository = userRepository;
        }

        public void Register(UserRegisterDto userDto)
        {
            if (_userRepository.Any(u => u.Username == userDto.Username))
            {
                throw Oops.Oh("Username already exists.");
            }

            var user = new User
            {
                Username = userDto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password)
            };

            _userRepository.Insert(user);
        }

        public User Login(UserLoginDto userDto)
        {
            var user = _userRepository.FirstOrDefault(u => u.Username == userDto.Username);

            if (user == null)
            {
                throw Oops.Oh("Invalid username or password.");
            }

            var passwordMatch = BCrypt.Net.BCrypt.Verify(userDto.Password, user.PasswordHash);
            if (!passwordMatch)
            {
                throw Oops.Oh("Invalid username or password.");
            }

            return user;
        }
    }
}
