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

namespace fitness.Services
{
    [Injection(Named = "WorkoutService")]
    public class WorkoutService : IWorkoutService, ITransient
    {
        private readonly IRepository<Workout> _workoutRepository;
        private readonly IRepository<Exercise> _exerciseRepository;
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<TrainingEnvironment> _environmentRepository;

        public WorkoutService(
            IRepository<Workout> workoutRepository,
            IRepository<Exercise> exerciseRepository,
            IRepository<User> userRepository,
            IRepository<TrainingEnvironment> environmentRepository)
        {
            _workoutRepository = workoutRepository;
            _exerciseRepository = exerciseRepository;
            _userRepository = userRepository;
            _environmentRepository = environmentRepository;
        }

        public async Task<List<WorkoutDto>> GetUserWorkoutsAsync(int userId)
        {
            return await _workoutRepository.AsQueryable()
                .Where(w => w.UserId == userId)
                .Include(w => w.Environment)
                .Include(w => w.Exercises)
                .OrderByDescending(w => w.StartTime)
                .Select(w => new WorkoutDto
                {
                    Id = w.Id,
                    UserId = w.UserId,
                    EnvironmentId = w.EnvironmentId,
                    Name = w.Name,
                    Type = w.Type,
                    StartTime = w.StartTime,
                    EndTime = w.EndTime,
                    Duration = w.Duration,
                    CaloriesBurned = w.CaloriesBurned,
                    IsCompleted = w.IsCompleted,
                    EnvironmentName = w.Environment != null ? w.Environment.Name : null,
                    Exercises = w.Exercises.Select(e => new ExerciseDto
                    {
                        Id = e.Id,
                        WorkoutId = e.WorkoutId,
                        Name = e.Name,
                        Sets = e.Sets,
                        Reps = e.Reps,
                        Weight = e.Weight,
                        Duration = e.Duration,
                        Distance = e.Distance,
                        Notes = e.Notes,
                        OrderIndex = e.OrderIndex
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<List<WorkoutDto>> GetRecentWorkoutsAsync(int userId, int limit = 10)
        {
            return await _workoutRepository.AsQueryable()
                .Where(w => w.UserId == userId)
                .Include(w => w.Environment)
                .Include(w => w.Exercises)
                .OrderByDescending(w => w.StartTime)
                .Take(limit)
                .Select(w => new WorkoutDto
                {
                    Id = w.Id,
                    UserId = w.UserId,
                    EnvironmentId = w.EnvironmentId,
                    Name = w.Name,
                    Type = w.Type,
                    StartTime = w.StartTime,
                    EndTime = w.EndTime,
                    Duration = w.Duration,
                    CaloriesBurned = w.CaloriesBurned,
                    IsCompleted = w.IsCompleted,
                    EnvironmentName = w.Environment != null ? w.Environment.Name : null,
                    Exercises = w.Exercises.Select(e => new ExerciseDto
                    {
                        Id = e.Id,
                        WorkoutId = e.WorkoutId,
                        Name = e.Name,
                        Sets = e.Sets,
                        Reps = e.Reps,
                        Weight = e.Weight,
                        Duration = e.Duration,
                        Distance = e.Distance,
                        Notes = e.Notes,
                        OrderIndex = e.OrderIndex
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<WorkoutDto?> GetWorkoutByIdAsync(int id)
        {
            var workout = await _workoutRepository.AsQueryable()
                .Include(w => w.Environment)
                .Include(w => w.Exercises)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (workout == null) return null;

            return new WorkoutDto
            {
                Id = workout.Id,
                UserId = workout.UserId,
                EnvironmentId = workout.EnvironmentId,
                Name = workout.Name,
                Type = workout.Type,
                StartTime = workout.StartTime,
                EndTime = workout.EndTime,
                Duration = workout.Duration,
                CaloriesBurned = workout.CaloriesBurned,
                IsCompleted = workout.IsCompleted,
                EnvironmentName = workout.Environment != null ? workout.Environment.Name : null,
                Exercises = workout.Exercises.Select(e => new ExerciseDto
                {
                    Id = e.Id,
                    WorkoutId = e.WorkoutId,
                    Name = e.Name,
                    Sets = e.Sets,
                    Reps = e.Reps,
                    Weight = e.Weight,
                    Duration = e.Duration,
                    Distance = e.Distance,
                    Notes = e.Notes,
                    OrderIndex = e.OrderIndex
                }).ToList()
            };
        }

        public async Task<WorkoutDto> CreateWorkoutAsync(CreateWorkoutDto workoutDto, int userId)
        {
            var workout = new Workout
            {
                UserId = userId,
                EnvironmentId = workoutDto.EnvironmentId,
                Name = workoutDto.Name,
                Type = workoutDto.Type,
                StartTime = workoutDto.StartTime,
                EndTime = workoutDto.EndTime,
                Duration = (int)(workoutDto.EndTime - workoutDto.StartTime).TotalMinutes,
                CaloriesBurned = CalculateCalories(workoutDto.Type, (int)(workoutDto.EndTime - workoutDto.StartTime).TotalMinutes),
                IsCompleted = true
            };

            _workoutRepository.Insert(workout);
            await _workoutRepository.SaveNowAsync();

            foreach (var exerciseDto in workoutDto.Exercises)
            {
                var exercise = new Exercise
                {
                    WorkoutId = workout.Id,
                    Name = exerciseDto.Name,
                    Sets = exerciseDto.Sets,
                    Reps = exerciseDto.Reps,
                    Weight = exerciseDto.Weight,
                    Duration = exerciseDto.Duration,
                    Distance = exerciseDto.Distance,
                    Notes = exerciseDto.Notes,
                    OrderIndex = exerciseDto.OrderIndex
                };
                _exerciseRepository.Insert(exercise);
            }

            await _exerciseRepository.SaveNowAsync();

            return await GetWorkoutByIdAsync(workout.Id) ?? throw Oops.Oh("Failed to create workout");
        }

        public async Task<WorkoutDto?> UpdateWorkoutAsync(int id, UpdateWorkoutDto workoutDto)
        {
            var workout = await _workoutRepository.FindAsync(id);
            if (workout == null) return null;

            workout.EnvironmentId = workoutDto.EnvironmentId;
            workout.Name = workoutDto.Name;
            workout.Type = workoutDto.Type;
            workout.StartTime = workoutDto.StartTime;
            workout.EndTime = workoutDto.EndTime;
            workout.Duration = (int)(workoutDto.EndTime - workoutDto.StartTime).TotalMinutes;
            workout.CaloriesBurned = CalculateCalories(workoutDto.Type, (int)(workoutDto.EndTime - workoutDto.StartTime).TotalMinutes);
            workout.UpdatedAt = DateTime.UtcNow;

            // Update exercises
            _exerciseRepository.Delete(_exerciseRepository.Where(e => e.WorkoutId == id));
            
            foreach (var exerciseDto in workoutDto.Exercises)
            {
                var exercise = new Exercise
                {
                    WorkoutId = workout.Id,
                    Name = exerciseDto.Name,
                    Sets = exerciseDto.Sets,
                    Reps = exerciseDto.Reps,
                    Weight = exerciseDto.Weight,
                    Duration = exerciseDto.Duration,
                    Distance = exerciseDto.Distance,
                    Notes = exerciseDto.Notes,
                    OrderIndex = exerciseDto.OrderIndex
                };
                _exerciseRepository.Insert(exercise);
            }

            await _workoutRepository.SaveNowAsync();
            await _exerciseRepository.SaveNowAsync();

            return await GetWorkoutByIdAsync(workout.Id);
        }

        public async Task<bool> DeleteWorkoutAsync(int id)
        {
            var workout = await _workoutRepository.FindAsync(id);
            if (workout == null) return false;

            _workoutRepository.Delete(workout);
            await _workoutRepository.SaveNowAsync();
            return true;
        }

        public async Task<UserDashboardDto> GetUserDashboardAsync(int userId)
        {
            var user = await _userRepository.FindAsync(userId);
            if (user == null) throw Oops.Oh("User not found");

            var today = DateTime.UtcNow.Date;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + 1);
            
            // 今日统计
            var todayWorkouts = await _workoutRepository.AsQueryable()
                .Where(w => w.UserId == userId && w.StartTime.Date == today)
                .ToListAsync();

            var todayStats = new TodayStatsDto
            {
                WorkoutsCompleted = todayWorkouts.Count,
                CaloriesBurned = todayWorkouts.Sum(w => w.CaloriesBurned),
                TotalDuration = todayWorkouts.Sum(w => w.Duration),
                CurrentStreak = CalculateCurrentStreak(userId)
            };

            // 本周目标
            var weekWorkouts = await _workoutRepository.AsQueryable()
                .Where(w => w.UserId == userId && w.StartTime >= startOfWeek && w.StartTime <= today.AddDays(7))
                .ToListAsync();

            var weeklyGoal = new WeeklyGoalDto
            {
                Current = weekWorkouts.Count,
                Target = 6,
                Percentage = weekWorkouts.Count >= 6 ? 100 : (weekWorkouts.Count * 100 / 6)
            };

            // 最近训练
            var recentWorkouts = await _workoutRepository.AsQueryable()
                .Where(w => w.UserId == userId)
                .Include(w => w.Environment)
                .OrderByDescending(w => w.StartTime)
                .Take(5)
                .Select(w => new RecentWorkoutDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Date = w.StartTime,
                    Duration = w.Duration,
                    Calories = w.CaloriesBurned,
                    Type = w.Type,
                    EnvironmentName = w.Environment != null ? w.Environment.Name : null
                })
                .ToListAsync();

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

        public async Task<UserStatisticsDto> GetUserStatisticsAsync(int userId, string period = "all")
        {
            var workouts = await _workoutRepository.AsQueryable()
                .Where(w => w.UserId == userId)
                .ToListAsync();

            return new UserStatisticsDto
            {
                TotalWorkouts = workouts.Count,
                TotalCalories = workouts.Sum(w => w.CaloriesBurned),
                TotalDuration = workouts.Sum(w => w.Duration),
                LongestStreak = CalculateLongestStreak(userId),
                CurrentStreak = CalculateCurrentStreak(userId)
            };
        }

        private int CalculateCurrentStreak(int userId)
        {
            // 简化实现：返回固定值，实际应该计算连续训练天数
            return 7;
        }

        private int CalculateLongestStreak(int userId)
        {
            // 简化实现：返回固定值，实际应该计算最长连续训练天数
            return 21;
        }

        private int CalculateCalories(string workoutType, int duration)
        {
            // 根据训练类型和时长估算卡路里消耗
            return workoutType.ToLower() switch
            {
                "strength" => duration * 6,
                "cardio" => duration * 8,
                "flexibility" => duration * 4,
                _ => duration * 6
            };
        }
    }
}