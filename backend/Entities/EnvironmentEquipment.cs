using Furion.DatabaseAccessor;
using System.ComponentModel.DataAnnotations.Schema;

namespace fitness.Entities
{
    public class EnvironmentEquipment : IEntity
    {
        public int TrainingEnvironmentId { get; set; }
        public int EquipmentId { get; set; }

        [ForeignKey(nameof(TrainingEnvironmentId))]
        public TrainingEnvironment? TrainingEnvironment { get; set; }

        [ForeignKey(nameof(EquipmentId))]
        public Equipment? Equipment { get; set; }
    }
}
