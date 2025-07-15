using Furion.DatabaseAccessor;
using System.ComponentModel.DataAnnotations;

namespace fitness.Entities
{
    // 活动实体，表示一种锻炼活动
    public class Activity : IEntity
    {
        [Key]
        // 活动主键ID
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        // 活动名称
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        // 活动描述
        public string? Description { get; set; }

        // 每分钟消耗的默认卡路里
        public double DefaultCaloriesPerMinute { get; set; }
    }
}
