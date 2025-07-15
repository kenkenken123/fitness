using Furion.DatabaseAccessor;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace fitness.Entities
{
    public class TrainingEnvironment : IEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public int UserId { get; set; }
        public User? User { get; set; }

        public ICollection<EnvironmentEquipment> EnvironmentEquipments { get; set; } = new List<EnvironmentEquipment>();
    }
}
