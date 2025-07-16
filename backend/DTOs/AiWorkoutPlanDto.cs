namespace backend.DTOs
{
    public class AiWorkoutPlanDto
    {
        public string Name { get; set; }
        public int EstimatedDuration { get; set; }
        public int EstimatedCalories { get; set; }
        public List<AiWorkoutSetDto> Sets { get; set; }
    }
}
