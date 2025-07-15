using Furion.DatabaseAccessor;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fitness.Entities
{
    // 锻炼组实体，记录一次锻炼中的具体组数和动作
    public class WorkoutSet : IEntity
    {
        [Key]
        // 主键ID
        public int Id { get; set; }

        [Required]
        // 所属锻炼日志ID
        public int WorkoutLogId { get; set; }

        [Required]
        [StringLength(100)]
        // 动作名称
        public string ActivityName { get; set; } = string.Empty;

        // 重量（kg）
        public double Weight { get; set; }
        // 组数
        public int Sets { get; set; }
        // 次数
        public int Reps { get; set; }

        [ForeignKey(nameof(WorkoutLogId))]
        // 导航属性：所属锻炼日志
        public virtual WorkoutLog? WorkoutLog { get; set; }
    }
}
