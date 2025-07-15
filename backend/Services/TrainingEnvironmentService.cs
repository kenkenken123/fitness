using backend.DTOs;
using fitness.Entities;
using Furion.DatabaseAccessor;
using System.Linq;
using Furion.FriendlyException;
using Furion.DependencyInjection;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

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

        

        public void CreateEnvironment(TrainingEnvironmentDto envDto)
        {
            var environment = new TrainingEnvironment { Name = envDto.Name, UserId = envDto.UserId };

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
        public IEnumerable<TrainingEnvironmentDto> GetAllForUser(int userId)
        {
            return _envRepository.AsQueryable()
                .Where(e => e.UserId == userId)
                .Include(e => e.EnvironmentEquipments)
                .Select(e => new TrainingEnvironmentDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    UserId = e.UserId,
                    EquipmentIds = e.EnvironmentEquipments.Select(ee => ee.EquipmentId).ToList()
                })
                .ToList();
        }

        public TrainingEnvironmentDto GetById(int id)
        {
            var environment = _envRepository.AsQueryable()
                .Include(e => e.EnvironmentEquipments)
                .FirstOrDefault(e => e.Id == id);

            if (environment == null)
            {
                return null;
            }

            return new TrainingEnvironmentDto
            {
                Id = environment.Id,
                Name = environment.Name,
                UserId = environment.UserId,
                EquipmentIds = environment.EnvironmentEquipments.Select(ee => ee.EquipmentId).ToList()
            };
        }
    }
}
