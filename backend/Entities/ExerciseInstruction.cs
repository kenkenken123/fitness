using System;
using System.ComponentModel.DataAnnotations;

namespace fitness.Entities
{
    public class ExerciseInstruction
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string ExerciseName { get; set; }
        
        public decimal Weight { get; set; }
        
        public int Sets { get; set; }
        
        public int Reps { get; set; }
        
        [Required]
        [MaxLength(1000)]
        public string Description { get; set; }
        
        [MaxLength(2000)]
        public string KeyPointsJson { get; set; }
        
        [MaxLength(2000)]
        public string CommonMistakesJson { get; set; }
        
        [MaxLength(2000)]
        public string SafetyTipsJson { get; set; }
        
        [MaxLength(1000)]
        public string MusclesJson { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 