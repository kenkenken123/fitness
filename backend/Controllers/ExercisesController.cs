using fitness.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace fitness.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExercisesController : ControllerBase
    {
        private readonly IExerciseService _exerciseService;

        public ExercisesController(IExerciseService exerciseService)
        {
            _exerciseService = exerciseService;
        }

        [HttpPost("instructions")]
        public async Task<IActionResult> GetExerciseInstructions([FromBody] ExerciseInstructionRequest request)
        {
            var instructions = await _exerciseService.GetExerciseInstructionsAsync(
                request.ExerciseName,
                request.Weight,
                request.Sets,
                request.Reps
            );
            return Ok(instructions);
        }
    }

    public class ExerciseInstructionRequest
    {
        public string ExerciseName { get; set; }
        public decimal Weight { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
    }

    public class ExerciseInstructionResponse
    {
        public string Description { get; set; }
        public string[] KeyPoints { get; set; }
        public string[] CommonMistakes { get; set; }
        public string[] SafetyTips { get; set; }
        public string[] Muscles { get; set; }
    }
}