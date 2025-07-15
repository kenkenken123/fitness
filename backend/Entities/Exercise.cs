using System;

namespace fitness.Entities
{
    // 练习实体，表示一次锻炼中的具体动作
    using Furion.DatabaseAccessor;

public class Exercise : IEntity
    {
        // 主键ID
        public int Id { get; set; }
        // 所属锻炼ID
        public int WorkoutId { get; set; }
        // 动作名称
        public string Name { get; set; } = string.Empty;
        // 组数
        public int Sets { get; set; }
        // 每组次数
        public int Reps { get; set; }
        // 重量（kg）
        public decimal? Weight { get; set; } // kg
        // 持续时间（秒）
        public int? Duration { get; set; } // seconds
        // 距离（公里）
        public decimal? Distance { get; set; } // km
        // 备注
        public string? Notes { get; set; }
        // 顺序索引
        public int OrderIndex { get; set; }
        
        // 导航属性：所属锻炼
        public Workout? Workout { get; set; }
    }
}