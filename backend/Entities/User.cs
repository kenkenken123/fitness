using Furion.DatabaseAccessor;
using System.ComponentModel.DataAnnotations;
using System;

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
        // 邮箱
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(255)] // 增加长度以适应哈希
        // 密码哈希
        public string PasswordHash { get; set; } = string.Empty;

        // 加入日期
        public DateTime JoinDate { get; set; }

        // 头像URL (可选)
        [StringLength(255)]
        public string? Avatar { get; set; }
    }
}
