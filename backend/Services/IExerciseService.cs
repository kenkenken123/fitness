using fitness.Controllers;
using System.Threading.Tasks;

namespace fitness.Services
{
    public interface IExerciseService
    {
        Task<ExerciseInstructionResponse> GetExerciseInstructionsAsync(string exerciseName, decimal weight, int sets, int reps);
    }
}