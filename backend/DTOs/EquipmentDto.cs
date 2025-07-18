
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class EquipmentDto
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(50)]
        public string Type { get; set; }

        public double? Weight { get; set; }

        [Required]
        public int UserId { get; set; }
    }
}
