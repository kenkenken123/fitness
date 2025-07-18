using Furion.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using fitness.Controllers;
using fitness.Entities;
using Microsoft.EntityFrameworkCore;
using fitness.EntityFramework.Core;

namespace fitness.Services
{
    [Injection(Named = "ExerciseService")]
    public class ExerciseService : IExerciseService, ITransient
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly DefaultDbContext _dbContext;

        public ExerciseService(IConfiguration configuration, IHttpClientFactory httpClientFactory, DefaultDbContext dbContext)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _dbContext = dbContext;
        }

        public async Task<ExerciseInstructionResponse> GetExerciseInstructionsAsync(string exerciseName, decimal weight, int sets, int reps)
        {
            // 首先尝试从数据库获取
            var existingInstruction = await _dbContext.ExerciseInstructions
                .FirstOrDefaultAsync(ei => ei.ExerciseName == exerciseName);

            if (existingInstruction != null)
            {
                // 如果存在，直接返回数据库中的数据
                return new ExerciseInstructionResponse
                {
                    Description = existingInstruction.Description,
                    KeyPoints = JsonSerializer.Deserialize<string[]>(existingInstruction.KeyPointsJson),
                    CommonMistakes = JsonSerializer.Deserialize<string[]>(existingInstruction.CommonMistakesJson),
                    SafetyTips = JsonSerializer.Deserialize<string[]>(existingInstruction.SafetyTipsJson),
                    Muscles = JsonSerializer.Deserialize<string[]>(existingInstruction.MusclesJson)
                };
            }

            // 如果不存在，从AI获取
            var aiResponse = await GetInstructionsFromAI(exerciseName, weight, sets, reps);
            
            // 保存到数据库
            var newInstruction = new ExerciseInstruction
            {
                ExerciseName = exerciseName,
                Weight = weight,
                Sets = sets,
                Reps = reps,
                Description = aiResponse.Description,
                KeyPointsJson = JsonSerializer.Serialize(aiResponse.KeyPoints),
                CommonMistakesJson = JsonSerializer.Serialize(aiResponse.CommonMistakes),
                SafetyTipsJson = JsonSerializer.Serialize(aiResponse.SafetyTips),
                MusclesJson = JsonSerializer.Serialize(aiResponse.Muscles)
            };

            _dbContext.ExerciseInstructions.Add(newInstruction);
            await _dbContext.SaveChangesAsync();

            return aiResponse;
        }

        private async Task<ExerciseInstructionResponse> GetInstructionsFromAI(string exerciseName, decimal weight, int sets, int reps)
        {
            var prompt = BuildExercisePrompt(exerciseName, weight, sets, reps);
            
            var apiKey = _configuration["BailianApi:ApiKey"];
            var endpoint = _configuration["BailianApi:Endpoint"];

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

            var requestBody = new
            {
                model = "qwen-turbo",
                messages = new[]
                {
                    new { role = "system", content = "You are a professional fitness coach. Provide detailed exercise instructions in Chinese." },
                    new { role = "user", content = prompt }
                },
                parameters = new { result_format = "json_object" }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await client.PostAsync(endpoint, content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            
            // Extract JSON from response
            var rawContent = JsonDocument.Parse(responseBody).RootElement
                .GetProperty("choices")[0].GetProperty("message")
                .GetProperty("content").GetString();

            var startIndex = rawContent.IndexOf('{');
            var endIndex = rawContent.LastIndexOf('}');
            var jsonResponse = rawContent.Substring(startIndex, endIndex - startIndex + 1);

            return JsonSerializer.Deserialize<ExerciseInstructionResponse>(
                jsonResponse, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );
        }

        private string BuildExercisePrompt(string exerciseName, decimal weight, int sets, int reps)
        {
            return $@"你是一个专业的健身教练。请详细解释{exerciseName}这个动作的正确做法。

训练参数：
- 重量：{weight}kg
- 组数：{sets}组
- 每组次数：{reps}次

请提供以下信息：
1. 动作描述：简要描述这个动作是什么
2. 关键要点：3-5个最重要的技术要点
3. 常见错误：3-4个容易犯的错误
4. 安全提示：3-4个安全注意事项
5. 目标肌肉：主要锻炼的肌肉群

请严格按照以下JSON格式返回，不要添加任何额外的解释或Markdown标记：

{{
  ""description"": ""动作描述"",
  ""keyPoints"": [""要点1"", ""要点2"", ""要点3""],
  ""commonMistakes"": [""错误1"", ""错误2"", ""错误3""],
  ""safetyTips"": [""安全提示1"", ""安全提示2"", ""安全提示3""],
  ""muscles"": [""肌肉1"", ""肌肉2"", ""肌肉3""]
}}";
        }
    }
}