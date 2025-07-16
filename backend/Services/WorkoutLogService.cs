using fitness.Entities;
using Furion.DatabaseAccessor;
using Furion.DependencyInjection;
using System.Text.Json;
using System.Net.Http.Headers;
using System.Text;
using backend.DTOs;

namespace fitness.Services
{
    [Injection(Named = "WorkoutLogService")]
    public class WorkoutLogService : IWorkoutLogService, ITransient
    {
        private readonly IRepository<WorkoutLog> _workoutLogRepository;
        private readonly IRepository<TrainingEnvironment> _trainingEnvironmentRepository;
        private readonly IRepository<EnvironmentEquipment> _environmentEquipmentRepository;
        private readonly IRepository<Equipment> _equipmentRepository;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;


        public WorkoutLogService(IRepository<WorkoutLog> workoutLogRepository, IRepository<TrainingEnvironment> trainingEnvironmentRepository, IRepository<EnvironmentEquipment> environmentEquipmentRepository, IRepository<Equipment> equipmentRepository, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _workoutLogRepository = workoutLogRepository;
            _trainingEnvironmentRepository = trainingEnvironmentRepository;
            _environmentEquipmentRepository = environmentEquipmentRepository;
            _equipmentRepository = equipmentRepository;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
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
                    Weight = (decimal)setDto.Weight,
                    Sets = setDto.Sets,
                    Reps = setDto.Reps
                });
            }

            _workoutLogRepository.Insert(workoutLog);
        }

        public async Task<WorkoutLog> GenerateWorkoutLogAsync(int trainingEnvironmentId, int userId, string trainingFocus = null)
        {
            // 1. 根据环境ID获取器材列表
            var equipmentIds = _environmentEquipmentRepository
                .Where(ee => ee.TrainingEnvironmentId == trainingEnvironmentId)
                .Select(ee => ee.EquipmentId)
                .ToList();

            var equipmentNames = _equipmentRepository
                .Where(e => equipmentIds.Contains(e.Id))
                .Select(e => e.Name)
                .ToList();

            // 2. 构建Prompt
            var prompt = BuildPrompt(equipmentNames, trainingFocus);

            // 3. 调用阿里云百练大模型API
            var apiKey = _configuration["BailianApi:ApiKey"];
            var endpoint = _configuration["BailianApi:Endpoint"];
            Console.WriteLine($"apiKey:{apiKey}|endpoint:{endpoint}");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var requestBody = new
            {
                model = "qwen-turbo", // 或者您需要使用的其他模型
                messages = new[]
                {
                    new { role = "system", content = "You are a helpful assistant." },
                    new { role = "user", content = prompt }
                },
                parameters = new { result_format = "json_object" } 
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await client.PostAsync(endpoint, content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"responseBody: {responseBody}");
            // 提取JSON部分
            var rawContent = JsonDocument.Parse(responseBody).RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            // 提取被 ```json ... ``` 包裹的纯JSON字符串
            var startIndex = rawContent.IndexOf('{');
            var endIndex = rawContent.LastIndexOf('}');
            var jsonResponse = rawContent.Substring(startIndex, endIndex - startIndex + 1);


            // 4. 解析AI响应并创建WorkoutLog
            var workoutLog = ParseAiResponseAndCreateLog(jsonResponse, userId, trainingFocus);
            
            await _workoutLogRepository.InsertAsync(workoutLog);

            return workoutLog;
        }

        private string BuildPrompt(List<string> equipmentNames, string trainingFocus = null)
        {
            var equipmentList = string.Join(", ", equipmentNames);
            var focusText = string.IsNullOrEmpty(trainingFocus) ? "全身力量训练" : trainingFocus;
            return $@"你是一个专业的健身教练。请根据以下可用器材，为我生成一份详细的{focusText}训练计划。
可用器材: [{equipmentList}]

请严格按照以下JSON格式返回，不要添加任何额外的解释或Markdown标记。

{{
  ""name"": ""计划名称 (字符串)"",
  ""estimatedDuration"": 45,
  ""estimatedCalories"": 350,
  ""sets"": [
    {{
      ""activity"": ""动作名称 (字符串)"",
      ""weight"": 10.5,
      ""sets"": 3,
      ""reps"": 12
    }},
    {{
      ""activity"": ""另一个动作名称 (字符串)"",
      ""weight"": 20.0,
      ""sets"": 4,
      ""reps"": 8
    }}
  ]
}}确保 `estimatedDuration`, `estimatedCalories`, `sets` (组数), 和 `reps` (次数) 字段的值都是整数, `weight` 字段的值是小数。";
        }

        private WorkoutLog ParseAiResponseAndCreateLog(string jsonResponse, int userId, string trainingFocus = null)
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var aiPlan = JsonSerializer.Deserialize<AiWorkoutPlanDto>(jsonResponse, options);

            var workoutLog = new WorkoutLog
            {
                UserId = userId,
                Name = aiPlan.Name,
                StartTime = DateTime.UtcNow,
                // EndTime will be set when user completes the workout
                EstimatedDuration = aiPlan.EstimatedDuration,
                EstimatedCalories = aiPlan.EstimatedCalories,
                IsCompleted = false,
                WorkoutSets = aiPlan.Sets.Select(s => new WorkoutSet
                {
                    ActivityName = s.Activity,
                    Weight = s.Weight,
                    Sets = s.Sets,
                    Reps = s.Reps,
                    IsCompleted = false
                }).ToList()
            };

            return workoutLog;
        }

        public void UpdateWorkoutSetCompletion(int setId, bool isCompleted)
        {
            var workoutSet = _workoutLogRepository.Context.Set<WorkoutSet>().Find(setId);
            if (workoutSet != null)
            {
                workoutSet.IsCompleted = isCompleted;
                _workoutLogRepository.Context.SaveChanges();
            }
        }

        public void UpdateWorkoutLogCompletion(int logId, bool isCompleted)
        {
            var workoutLog = _workoutLogRepository.Find(logId);
            if (workoutLog != null)
            {
                workoutLog.IsCompleted = isCompleted;
                if (isCompleted && workoutLog.EndTime == default)
                {
                    workoutLog.EndTime = DateTime.UtcNow;
                }
                _workoutLogRepository.Update(workoutLog);
            }
        }
    }
}