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
        // 日志主键ID
        public int Id { get; set; }

        [Required]
        // 用户ID
        public int UserId { get; set; }

        [Required]
        // 活动ID
        public int ActivityId { get; set; }

        [Required]
        // 开始时间
        public DateTime StartTime { get; set; }

        // 结束时间
        public DateTime? EndTime { get; set; }

        // 锻炼时长（分钟）
        public double? DurationMinutes { get; set; }

        // 消耗的卡路里
        public double? CaloriesBurned { get; set; }

        [ForeignKey(nameof(UserId))]
        // 导航属性：用户
        public virtual User? User { get; set; }

        [ForeignKey(nameof(ActivityId))]
        // 导航属性：活动
        public virtual Activity? Activity { get; set; }

        // 导航属性：锻炼组集合
        public virtual ICollection<WorkoutSet> WorkoutSets { get; set; } = new List<WorkoutSet>();
    }
}
