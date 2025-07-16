using Furion;
using fitness.EntityFramework.Core;
using Furion.DatabaseAccessor;
using fitness.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args).Inject();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ... (其他 using 语句)

builder.Services.AddHttpClient();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
}).AddInject();
builder.Services.AddDatabaseAccessor(options =>
{
    // 添加数据库连接池
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.AddDbPool<DefaultDbContext>(DbProvider.MySql,connectionMetadata:connectionString);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<backend.Middlewares.ExceptionHandlingMiddleware>();
// app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();


app.Run();
