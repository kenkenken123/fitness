using Furion.DatabaseAccessor;
using System.ComponentModel.DataAnnotations.Schema;

namespace fitness.Entities
{
    // 环境设备实体，表示训练环境与设备的多对多关系
    public class EnvironmentEquipment : IEntity
    {
        // 训练环境ID
        public int TrainingEnvironmentId { get; set; }
        // 设备ID
        public int EquipmentId { get; set; }

        [ForeignKey(nameof(TrainingEnvironmentId))]
        // 关联的训练环境
        public TrainingEnvironment? TrainingEnvironment { get; set; }

        [ForeignKey(nameof(EquipmentId))]
        // 关联的设备
        public Equipment? Equipment { get; set; }
    }
}
