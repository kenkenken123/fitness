using fitness.DTOs;
using fitness.Entities;
using Furion.DatabaseAccessor;
using System;
using Furion.DependencyInjection;
using System.Collections.Generic;
using System.Linq;

namespace fitness.Services
{
    [Injection(Named = "WorkoutLogService")]
    public class WorkoutLogService : IWorkoutLogService, ITransient
    {
        private readonly IRepository<WorkoutLog> _workoutLogRepository;

        public WorkoutLogService(IRepository<WorkoutLog> workoutLogRepository)
        {
            _workoutLogRepository = workoutLogRepository;
        }

        public IEnumerable<WorkoutLog> GetWorkoutLogs(int userId)
        {
            return _workoutLogRepository.Where(log => log.UserId == userId).ToList();
        }

        public void CreateWorkoutLog(WorkoutLogDto logDto)
        {
            var workoutLog = new WorkoutLog
            {
                UserId = logDto.UserId,
                StartTime = logDto.StartTime,
                EndTime = DateTime.Now // Or calculate based on sets
            };

            foreach (var setDto in logDto.Sets)
            {
                workoutLog.WorkoutSets.Add(new WorkoutSet
                {
                    ActivityName = setDto.ActivityName,
                    Weight = setDto.Weight,
                    Sets = setDto.Sets,
                    Reps = setDto.Reps
                });
            }

            _workoutLogRepository.Insert(workoutLog);
        }
    }
}
