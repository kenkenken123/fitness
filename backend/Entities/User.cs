using Furion.DatabaseAccessor;
using System.ComponentModel.DataAnnotations;

namespace fitness.Entities
{
    // 用户实体，表示系统中的用户
    public class User : IEntity
    {
        [Key]
        // 用户主键ID
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        // 用户名
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        // 密码哈希
        public string PasswordHash { get; set; } = string.Empty;
    }
}
