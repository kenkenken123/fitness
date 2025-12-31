using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using fitness.Entities;
using Furion.DatabaseAccessor;
using Furion.FriendlyException;
using Furion.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using backend.Services;

namespace backend.Services
{
    [Injection(Named = "WorkoutService")]
    public class WorkoutService : IWorkoutService, ITransient
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<WorkoutLog> _workoutLogRepository;

        public WorkoutService(
            IRepository<User> userRepository,
            IRepository<WorkoutLog> workoutLogRepository)
        {
            _userRepository = userRepository;
            _workoutLogRepository = workoutLogRepository;
        }

        // 获取用户仪表盘数据
        public async Task<UserDashboardDto> GetUserDashboardAsync(int userId)
        {
            var user = await _userRepository.FindAsync(userId);
            if (user == null) throw Oops.Oh("User not found");

            var today = DateTime.UtcNow.Date;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + 1);

            // 今日统计 - 从 WorkoutLog 查询
            var todayWorkoutLogs = await _workoutLogRepository.AsQueryable()
                .Where(w => w.UserId == userId && w.StartTime.Date == today && w.IsCompleted)
                .Include(w => w.WorkoutSets)
                .ToListAsync();

            var todayStats = new TodayStatsDto
            {
                WorkoutsCompleted = todayWorkoutLogs.Count,
                CaloriesBurned = todayWorkoutLogs.Sum(w => w.EstimatedCalories ?? 0),
                TotalDuration = todayWorkoutLogs.Sum(w => w.EstimatedDuration ?? 0),
                CurrentStreak = await CalculateCurrentStreakAsync(userId)
            };

            // 本周目标 - 从 WorkoutLog 查询
            var weekWorkoutLogs = await _workoutLogRepository.AsQueryable()
                .Where(w => w.UserId == userId && w.StartTime >= startOfWeek && w.StartTime <= today.AddDays(7) && w.IsCompleted)
                .ToListAsync();

            var weeklyGoal = new WeeklyGoalDto
            {
                Current = weekWorkoutLogs.Count,
                Target = 6,
                Percentage = weekWorkoutLogs.Count >= 6 ? 100 : (weekWorkoutLogs.Count * 100 / 6)
            };

            // 最近训练 - 从 WorkoutLog 查询
            var recentWorkoutLogs = await _workoutLogRepository.AsQueryable()
                .Where(w => w.UserId == userId && w.IsCompleted)
                .Include(w => w.WorkoutSets)
                .OrderByDescending(w => w.StartTime)
                .Take(5)
                .ToListAsync();

            var recentWorkouts = recentWorkoutLogs.Select(w => new RecentWorkoutDto
            {
                Id = w.Id,
                Name = w.Name ?? "训练",
                Date = w.StartTime,
                Duration = w.EstimatedDuration ?? 0,
                Calories = w.EstimatedCalories ?? 0,
                Type = "综合训练",
                EnvironmentName = null
            }).ToList();

            // 成就（简化版本）
            var achievements = new List<AchievementDto>
            {
                new AchievementDto { Id = 1, Name = "连续7天", Icon = "🔥", Type = "streak", EarnedDate = DateTime.UtcNow.AddDays(-1) },
                new AchievementDto { Id = 2, Name = "力量提升", Icon = "💪", Type = "progress", EarnedDate = DateTime.UtcNow.AddDays(-3) },
                new AchievementDto { Id = 3, Name = "目标达成", Icon = "🎯", Type = "milestone", EarnedDate = DateTime.UtcNow.AddDays(-7) }
            };

            return new UserDashboardDto
            {
                UserId = user.Id,
                Username = user.Username,
                DisplayName = user.Username,
                TodayStats = todayStats,
                WeeklyGoal = weeklyGoal,
                RecentWorkouts = recentWorkouts,
                Achievements = achievements
            };
        }

        // 计算当前连续训练天数
        private async Task<int> CalculateCurrentStreakAsync(int userId)
        {
            var workoutLogs = await _workoutLogRepository.AsQueryable()
                .Where(w => w.UserId == userId && w.IsCompleted)
                .OrderByDescending(w => w.StartTime)
                .Select(w => w.StartTime.Date)
                .Distinct()
                .ToListAsync();

            if (!workoutLogs.Any()) return 0;

            var today = DateTime.UtcNow.Date;
            var streak = 0;
            var currentDate = today;

            // 如果今天没有训练，从昨天开始计算
            if (!workoutLogs.Contains(today))
            {
                currentDate = today.AddDays(-1);
            }

            foreach (var date in workoutLogs)
            {
                if (date == currentDate)
                {
                    streak++;
                    currentDate = currentDate.AddDays(-1);
                }
                else if (date < currentDate)
                {
                    break;
                }
            }

            return streak;
        }
    }
}