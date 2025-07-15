using System;
using System.Collections.Generic;

namespace fitness.Entities
{
    // 锻炼实体，表示一次完整的锻炼记录
    using Furion.DatabaseAccessor;

public class Workout : IEntity
    {
        // 主键ID
        public int Id { get; set; }
        // 用户ID
        public int UserId { get; set; }
        // 环境ID
        public int? EnvironmentId { get; set; }
        // 锻炼名称
        public string Name { get; set; } = string.Empty;
        // 类型（如力量、有氧、柔韧等）
        public string Type { get; set; } = string.Empty; // strength, cardio, flexibility, etc.
        // 开始时间
        public DateTime StartTime { get; set; }
        // 结束时间
        public DateTime EndTime { get; set; }
        // 持续时间（分钟）
        public int Duration { get; set; } // minutes
        // 消耗的卡路里
        public int CaloriesBurned { get; set; }
        // 是否已完成
        public bool IsCompleted { get; set; } = true;
        // 创建时间
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        // 更新时间
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // 导航属性：所属用户
        public User? User { get; set; }
        // 导航属性：锻炼环境
        public TrainingEnvironment? Environment { get; set; }
        // 导航属性：包含的练习动作
        public List<Exercise> Exercises { get; set; } = new List<Exercise>();
    }
}