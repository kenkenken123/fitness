using System.Collections.Generic;

namespace backend.DTOs
{
    // 用户公开信息的数据传输对象
    public class UserProfileDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public DateTime JoinDate { get; set; }
        public string Avatar { get; set; }
        public UserStatsDto Stats { get; set; }
        public List<AchievementDto> Achievements { get; set; }
    }

    // 用户统计数据
    public class UserStatsDto
    {
        public int TotalWorkouts { get; set; }
        public int TotalCalories { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public string FavoriteWorkout { get; set; }
        public double TotalHours { get; set; }
    }

    // 成就数据
    public class AchievementDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Icon { get; set; }
        public DateTime EarnedDate { get; set; }
        public string Type { get; set; }
    }
}
