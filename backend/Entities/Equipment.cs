using Furion.DatabaseAccessor;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace fitness.Entities
{
    // 设备实体，表示健身器材
    public class Equipment : IEntity
    {
        [Key]
        // 设备主键ID
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        // 设备名称
        public string Name { get; set; } = string.Empty;

        // 类型，例如：哑铃、杠铃、跑步机
        public string Type { get; set; } = string.Empty;

        // 重量 (kg)，可以为 null
        public double? Weight { get; set; }

        // 设备所属的环境设备集合
        public ICollection<EnvironmentEquipment> EnvironmentEquipments { get; set; } = new List<EnvironmentEquipment>();
    }
}
