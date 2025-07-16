namespace backend.DTOs
{
    public class AiWorkoutSetDto
    {
        public string Activity { get; set; }
        public decimal Weight { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
    }
}
