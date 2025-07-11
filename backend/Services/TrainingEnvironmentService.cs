using fitness.DTOs;
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

        public IEnumerable<TrainingEnvironment> GetEnvironments()
        {
            return _envRepository.AsQueryable().ToList();
        }

        public void CreateEnvironment(TrainingEnvironmentDto envDto)
        {
            var environment = new TrainingEnvironment { Name = envDto.Name };

            foreach (var equipId in envDto.EquipmentIds)
            {
                environment.EnvironmentEquipments.Add(new EnvironmentEquipment { EquipmentId = equipId });
            }

            _envRepository.Insert(environment);
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
