using Furion.DatabaseAccessor;
using System.ComponentModel.DataAnnotations;

namespace fitness.Entities
{
    public class Activity : IEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        // 每分钟消耗的默认卡路里
        public double DefaultCaloriesPerMinute { get; set; }
    }
}
