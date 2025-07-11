using fitness.Entities;
using Furion.DatabaseAccessor;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace fitness.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivitiesController : ControllerBase
    {
        private readonly IRepository<Activity> _activityRepository;

        public ActivitiesController(IRepository<Activity> activityRepository)
        {
            _activityRepository = activityRepository;
        }

        [HttpGet]
        public IActionResult GetActivities()
        {
            var activities = _activityRepository.AsQueryable().ToList();
            return Ok(activities);
        }
    }
}
