using Furion.DatabaseAccessor;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fitness.Entities
{
    // 锻炼日志实体，记录用户的锻炼历史
    public class WorkoutLog : IEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        public string Name { get; set; } // AI生成的训练名称

        [Required]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int? EstimatedDuration { get; set; } // AI预估时长

        public int? EstimatedCalories { get; set; } // AI预估卡路里

        public bool IsCompleted { get; set; } = false;

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        public virtual ICollection<WorkoutSet> WorkoutSets { get; set; } = new List<WorkoutSet>();
    }
}
