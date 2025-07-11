using Furion.DatabaseAccessor;
using Microsoft.EntityFrameworkCore;

namespace fitness.EntityFramework.Core
{
    [AppDbContext("DefaultConnection", DbProvider.MySql)]
    public class DefaultDbContext : AppDbContext<DefaultDbContext>
    {
        public DefaultDbContext(DbContextOptions<DefaultDbContext> options) : base(options)
        {
        }
    }
}
