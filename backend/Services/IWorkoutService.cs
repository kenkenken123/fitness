using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;

namespace fitness.Services
{
    public interface IWorkoutService
    {
        Task<List<WorkoutDto>> GetUserWorkoutsAsync(int userId);
        Task<List<WorkoutDto>> GetRecentWorkoutsAsync(int userId, int limit = 10);
        Task<WorkoutDto?> GetWorkoutByIdAsync(int id);
        Task<WorkoutDto> CreateWorkoutAsync(CreateWorkoutDto workoutDto, int userId);
        Task<WorkoutDto?> UpdateWorkoutAsync(int id, UpdateWorkoutDto workoutDto);
        Task<bool> DeleteWorkoutAsync(int id);
        Task<UserDashboardDto> GetUserDashboardAsync(int userId);
        Task<UserStatisticsDto> GetUserStatisticsAsync(int userId, string period = "all");
    }

    public class UserDashboardDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public TodayStatsDto TodayStats { get; set; } = new TodayStatsDto();
        public WeeklyGoalDto WeeklyGoal { get; set; } = new WeeklyGoalDto();
        public List<RecentWorkoutDto> RecentWorkouts { get; set; } = new List<RecentWorkoutDto>();
        public List<AchievementDto> Achievements { get; set; } = new List<AchievementDto>();
    }

    public class TodayStatsDto
    {
        public int WorkoutsCompleted { get; set; }
        public int CaloriesBurned { get; set; }
        public int TotalDuration { get; set; }
        public int CurrentStreak { get; set; }
    }

    public class WeeklyGoalDto
    {
        public int Current { get; set; }
        public int Target { get; set; }
        public int Percentage { get; set; }
    }

    public class RecentWorkoutDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int Duration { get; set; }
        public int Calories { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? EnvironmentName { get; set; }
    }

    public class AchievementDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime EarnedDate { get; set; }
    }

    public class UserStatisticsDto
    {
        public int TotalWorkouts { get; set; }
        public int TotalCalories { get; set; }
        public int TotalDuration { get; set; }
        public int LongestStreak { get; set; }
        public int CurrentStreak { get; set; }
    }
}