using Microsoft.EntityFrameworkCore;
using NoteBookKeeper.Api.Entities;

namespace NoteBookKeeper.Api.Db
{
    public class NoteKeeperContext(DbContextOptions<NoteKeeperContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<NoteSetting> NoteSettings { get; set; }
        public DbSet<NoteItem> NoteItems { get; set; }
        public DbSet<NoteItemFile> NoteItemsFiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            {
                modelBuilder.Entity<User>()
                    .Property(p => p.Password).IsRequired();
                modelBuilder.Entity<User>()
                    .Property(p => p.Email).IsRequired(false);
                modelBuilder.Entity<User>()
                    .Property(p => p.UserName).IsRequired();
            }

            {
                modelBuilder.Entity<NoteSetting>()
                    .Property(p => p.Topic).HasMaxLength(150);
                modelBuilder.Entity<NoteSetting>()
                    .Property(p => p.Topic).IsRequired();
                modelBuilder.Entity<NoteSetting>()
                    .Property(p => p.Description).HasMaxLength(500);
                modelBuilder.Entity<NoteSetting>()
                    .HasOne(p => p.User)
                    .WithMany(p => p.NoteSettings)
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            }

            {

                modelBuilder.Entity<NoteItem>()
                    .Property(p => p.Detail).IsRequired(false);
                modelBuilder.Entity<NoteItem>()
                    .Property(p => p.RedirectLink).IsRequired(false);

                modelBuilder.Entity<NoteItem>()
                    .HasOne(p => p.NoteSetting)
                    .WithMany(p => p.Items)
                    .HasForeignKey(p => p.NoteSettingId)
                    .OnDelete(DeleteBehavior.Restrict);
            }

            {
                modelBuilder.Entity<NoteItemFile>()
                    .Property(p => p.FileName).IsRequired();
                modelBuilder.Entity<NoteItemFile>()
                    .Property(p => p.FilePath).IsRequired();

                modelBuilder.Entity<NoteItemFile>()
                    .HasOne(p => p.NoteItem)
                    .WithMany(p => p.Files)
                    .HasForeignKey(p => p.NoteItemId)
                    .OnDelete(DeleteBehavior.Restrict);
            }
        }
    }
}
