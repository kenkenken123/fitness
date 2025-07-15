using Furion.DatabaseAccessor;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace fitness.Entities
{
    public class Equipment : IEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        // 类型，例如：哑铃、杠铃、跑步机
        public string Type { get; set; } = string.Empty;

        // 重量 (kg)，可以为 null
        public double? Weight { get; set; }

        public ICollection<EnvironmentEquipment> EnvironmentEquipments { get; set; } = new List<EnvironmentEquipment>();
    }
}
