using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public class WorkoutDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? EnvironmentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Duration { get; set; }
        public int CaloriesBurned { get; set; }
        public bool IsCompleted { get; set; }
        public List<ExerciseDto> Exercises { get; set; } = new List<ExerciseDto>();
        public string? EnvironmentName { get; set; }
    }

    public class CreateWorkoutDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int? EnvironmentId { get; set; }
        public List<CreateExerciseDto> Exercises { get; set; } = new List<CreateExerciseDto>();
    }

    public class UpdateWorkoutDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int? EnvironmentId { get; set; }
        public List<CreateExerciseDto> Exercises { get; set; } = new List<CreateExerciseDto>();
    }
}