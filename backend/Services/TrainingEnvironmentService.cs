using backend.DTOs;
using fitness.Entities;
using Furion.DatabaseAccessor;
using System.Linq;
using Furion.FriendlyException;
using Furion.DependencyInjection;
using System.Collections.Generic;

namespace fitness.Services
{
    [Injection(Named = "TrainingEnvironmentService")]
    public class TrainingEnvironmentService : ITrainingEnvironmentService, ITransient
    {
        private readonly IRepository<TrainingEnvironment> _envRepository;
        private readonly IRepository<EnvironmentEquipment> _envEquipRepository;

        public TrainingEnvironmentService(IRepository<TrainingEnvironment> envRepository, IRepository<EnvironmentEquipment> envEquipRepository)
        {
            _envRepository = envRepository;
            _envEquipRepository = envEquipRepository;
        }

        public IEnumerable<object> GetEnvironments()
        {
            return _envRepository.AsQueryable()
                .Include(te => te.EnvironmentEquipments)
                .ThenInclude(ee => ee.Equipment)
                .ToList();
        }

        public void CreateEnvironment(TrainingEnvironmentDto envDto)
        {
            var environment = new TrainingEnvironment { Name = envDto.Name };

            // First, save the environment to get an ID
            _envRepository.Insert(environment);

            // Then, associate the equipment
            if (envDto.EquipmentIds != null && envDto.EquipmentIds.Any())
            {
                foreach (var equipId in envDto.EquipmentIds)
                {
                    _envEquipRepository.Insert(new EnvironmentEquipment 
                    { 
                        TrainingEnvironmentId = environment.Id, 
                        EquipmentId = equipId 
                    });
                }
            }
        }

        public void UpdateEnvironment(int id, TrainingEnvironmentDto envDto)
        {
            var environment = _envRepository.Find(id);
            if (environment == null)
            {
                throw Oops.Oh("Environment not found.");
            }

            environment.Name = envDto.Name;

            _envEquipRepository.Delete(_envEquipRepository.Where(ee => ee.TrainingEnvironmentId == id));
            foreach (var equipId in envDto.EquipmentIds)
            {
                _envEquipRepository.Insert(new EnvironmentEquipment { TrainingEnvironmentId = id, EquipmentId = equipId });
            }
        }

        public void DeleteEnvironment(int id)
        {
            var environment = _envRepository.Find(id);
            if (environment == null)
            {
                throw Oops.Oh("Environment not found.");
            }

            _envRepository.Delete(environment);
        }
    }
}
