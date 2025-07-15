using System.Collections.Generic;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class TrainingEnvironmentDto
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public int UserId { get; set; }

        public List<int> EquipmentIds { get; set; } = new List<int>();
    }
}

