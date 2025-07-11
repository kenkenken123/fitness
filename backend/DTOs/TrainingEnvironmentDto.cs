using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace fitness.DTOs
{
    public class TrainingEnvironmentDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public List<int> EquipmentIds { get; set; } = new List<int>();
    }
}
