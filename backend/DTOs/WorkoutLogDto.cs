using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace fitness.DTOs
{
    public class WorkoutLogDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        public List<WorkoutSetDto> Sets { get; set; } = new List<WorkoutSetDto>();
    }

    public class WorkoutSetDto
    {
        [Required]
        public string ActivityName { get; set; } = string.Empty;

        public double Weight { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
    }
}
