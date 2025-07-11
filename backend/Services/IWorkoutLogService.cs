using fitness.DTOs;
using fitness.Entities;
using System.Collections.Generic;

namespace fitness.Services
{
    public interface IWorkoutLogService
    {
        IEnumerable<WorkoutLog> GetWorkoutLogs(int userId);
        void CreateWorkoutLog(WorkoutLogDto logDto);
    }
}
