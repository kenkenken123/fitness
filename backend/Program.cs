using Furion;
using fitness.EntityFramework.Core;

var builder = WebApplication.CreateBuilder(args).Inject();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers().AddInject();
builder.Services.AddDatabaseAccessor(options =>
{
    options.AddDbPool<DefaultDbContext>(DbProvider.MySql, "DefaultConnection");
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<backend.Middlewares.ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();


app.Run();
