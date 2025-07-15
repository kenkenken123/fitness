namespace backend.DTOs
{
    public class ExerciseDto
    {
        public int Id { get; set; }
        public int WorkoutId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Reps { get; set; }
        public decimal? Weight { get; set; }
        public int? Duration { get; set; }
        public decimal? Distance { get; set; }
        public string? Notes { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreateExerciseDto
    {
        public string Name { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Reps { get; set; }
        public decimal? Weight { get; set; }
        public int? Duration { get; set; }
        public decimal? Distance { get; set; }
        public string? Notes { get; set; }
        public int OrderIndex { get; set; }
    }
}