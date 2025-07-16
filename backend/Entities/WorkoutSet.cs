using Furion.DatabaseAccessor;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fitness.Entities
{
    // 锻炼组实体，记录一次锻炼中的具体组数和动作
    public class WorkoutSet : IEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WorkoutLogId { get; set; }

        [Required]
        [StringLength(100)]
        public string ActivityName { get; set; } = string.Empty;

        public decimal Weight { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }

        public bool IsCompleted { get; set; } = false;

        [ForeignKey(nameof(WorkoutLogId))]
        public virtual WorkoutLog? WorkoutLog { get; set; }
    }
}
