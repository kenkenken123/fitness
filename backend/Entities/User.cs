using Furion.DatabaseAccessor;
using System.ComponentModel.DataAnnotations;

namespace fitness.Entities
{
    public class User : IEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string PasswordHash { get; set; } = string.Empty;
    }
}
