using fitness.DTOs;
using fitness.Entities;
using System.Collections.Generic;

namespace fitness.Services
{
    public interface ITrainingEnvironmentService
    {
        IEnumerable<TrainingEnvironment> GetEnvironments();
        void CreateEnvironment(TrainingEnvironmentDto envDto);
        void UpdateEnvironment(int id, TrainingEnvironmentDto envDto);
        void DeleteEnvironment(int id);
    }
}
