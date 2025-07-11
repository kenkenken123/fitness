using Furion.DatabaseAccessor;
using Microsoft.EntityFrameworkCore;
using fitness.Entities;

namespace fitness.EntityFramework.Core
{
    [AppDbContext("DefaultConnection", DbProvider.MySql)]
    public class DefaultDbContext : AppDbContext<DefaultDbContext>
    {
        public DefaultDbContext(DbContextOptions<DefaultDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<WorkoutLog> WorkoutLogs { get; set; }
        public DbSet<TrainingEnvironment> TrainingEnvironments { get; set; }
        public DbSet<Equipment> Equipment { get; set; }
        public DbSet<EnvironmentEquipment> EnvironmentEquipments { get; set; }
        public DbSet<WorkoutSet> WorkoutSets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EnvironmentEquipment>()
                .HasKey(ee => new { ee.TrainingEnvironmentId, ee.EquipmentId });

            modelBuilder.Entity<EnvironmentEquipment>()
                .HasOne(ee => ee.TrainingEnvironment)
                .WithMany(te => te.EnvironmentEquipments)
                .HasForeignKey(ee => ee.TrainingEnvironmentId);

            modelBuilder.Entity<EnvironmentEquipment>()
                .HasOne(ee => ee.Equipment)
                .WithMany(e => e.EnvironmentEquipments)
                .HasForeignKey(ee => ee.EquipmentId);

            base.OnModelCreating(modelBuilder);
        }
    }
}
