using Furion.DatabaseAccessor;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace fitness.Entities
{
    // 训练环境实体，表示用户的锻炼场所
    public class TrainingEnvironment : IEntity
    {
        [Key]
        // 训练环境主键ID
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        // 环境名称
        public string Name { get; set; } = string.Empty;

        // 所属用户ID
        public int UserId { get; set; }
        // 所属用户
        public User? User { get; set; }

        // 环境包含的设备集合
        public ICollection<EnvironmentEquipment> EnvironmentEquipments { get; set; } = new List<EnvironmentEquipment>();
    }
}
