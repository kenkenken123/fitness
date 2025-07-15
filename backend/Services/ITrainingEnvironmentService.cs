using backend.DTOs;
using fitness.Entities;
using System.Collections.Generic;

namespace fitness.Services
{
    public interface ITrainingEnvironmentService
    {
        
        void CreateEnvironment(TrainingEnvironmentDto envDto);
        void UpdateEnvironment(int id, TrainingEnvironmentDto envDto);
        void DeleteEnvironment(int id);
        IEnumerable<TrainingEnvironmentDto> GetAllForUser(int userId);
    }
}
