using fitness.Entities;
using Furion.DatabaseAccessor;
using Furion.FriendlyException;
using Furion.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;

namespace fitness.Services
{
    [Injection(Named = "UserService")]
    public class UserService : IUserService, ITransient
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<WorkoutLog> _workoutLogRepository;

        public UserService(IRepository<User> userRepository, IRepository<WorkoutLog> workoutLogRepository)
        {
            _userRepository = userRepository;
            _workoutLogRepository = workoutLogRepository;
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
                Email = userDto.Email, // 保存邮箱
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
                JoinDate = DateTime.UtcNow // 设置加入日期
            };

            _userRepository.Insert(user);
        }

        public User Login(UserLoginDto userDto)
        {
            var user = _userRepository.FirstOrDefault(u => u.Username == userDto.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(userDto.Password, user.PasswordHash))
            {
                throw Oops.Oh("Invalid username or password.");
            }

            return user;
        }

        public async Task<UserProfileDto> GetUserProfileAsync(int userId)
        {
            var user = await _userRepository.FindAsync(userId);
            if (user == null)
            {
                throw Oops.Oh("User not found.");
            }

            var userWorkoutLogs = await _workoutLogRepository
                .Where(log => log.UserId == userId && log.IsCompleted)
                .Include(log => log.WorkoutSets)
                .OrderBy(log => log.StartTime)
                .ToListAsync();

            var stats = CalculateUserStats(userWorkoutLogs);
            var achievements = GenerateAchievements(userWorkoutLogs, stats);

            return new UserProfileDto
            {
                Username = user.Username,
                Email = user.Email,
                JoinDate = user.JoinDate,
                Avatar = user.Avatar,
                Stats = stats,
                Achievements = achievements
            };
        }

        private UserStatsDto CalculateUserStats(List<WorkoutLog> logs)
        {
            if (logs == null || !logs.Any())
                return new UserStatsDto();

            var totalWorkouts = logs.Count;
            var totalCalories = logs.Sum(log => log.EstimatedCalories ?? 0);
            var totalHours = logs.Where(log => log.EndTime.HasValue).Sum(log => (log.EndTime.Value - log.StartTime).TotalHours);

            var favoriteWorkout = logs
                .SelectMany(log => log.WorkoutSets)
                .GroupBy(set => set.ActivityName)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefault() ?? "N/A";

            // 计算连续打卡天数逻辑 (简化版)
            var dates = logs.Select(log => log.StartTime.Date).Distinct().ToList();
            var longestStreak = 0;
            var currentStreak = 0;
            if (dates.Any())
            {
                longestStreak = 1;
                currentStreak = 1;
                for (int i = 1; i < dates.Count; i++)
                {
                    if (dates[i] == dates[i - 1].AddDays(1))
                    {
                        currentStreak++;
                    }
                    else
                    {
                        if (currentStreak > longestStreak)
                        {
                            longestStreak = currentStreak;
                        }
                        currentStreak = 1;
                    }
                }
                if (currentStreak > longestStreak) longestStreak = currentStreak;

                // 检查当前连续天数是否延续到今天或昨天
                if (dates.Last() < DateTime.UtcNow.Date.AddDays(-1)) {
                    currentStreak = 0;
                }
            }

            return new UserStatsDto
            {
                TotalWorkouts = totalWorkouts,
                TotalCalories = totalCalories,
                TotalHours = totalHours,
                FavoriteWorkout = favoriteWorkout,
                LongestStreak = longestStreak,
                CurrentStreak = currentStreak
            };
        }

        private List<AchievementDto> GenerateAchievements(List<WorkoutLog> logs, UserStatsDto stats)
        {
            var achievements = new List<AchievementDto>
            {
                new AchievementDto { Id = 1, Name = "新手上路", Icon = "🔥", Type = "streak", EarnedDate = DateTime.UtcNow.AddDays(-1) },
                new AchievementDto { Id = 2, Name = "力量提升", Icon = "💪", Type = "progress", EarnedDate = DateTime.UtcNow.AddDays(-3) },
                new AchievementDto { Id = 3, Name = "目标达成", Icon = "🎯", Type = "milestone", EarnedDate = DateTime.UtcNow.AddDays(-7) }
            };
            return achievements;
        }
    }
}
