using backend.DTOs;
using fitness.Entities;

namespace fitness.Services
{
    public interface IWorkoutLogService
    {
        IEnumerable<WorkoutLog> GetWorkoutLogs(int userId);
        void CreateWorkoutLog(WorkoutLogDto logDto);
        Task<WorkoutLog> GenerateWorkoutLogAsync(int trainingEnvironmentId, int userId, string trainingFocus = null);
        void UpdateWorkoutSetCompletion(int setId, bool isCompleted);
        void UpdateWorkoutLogCompletion(int logId, bool isCompleted);
    }
}
