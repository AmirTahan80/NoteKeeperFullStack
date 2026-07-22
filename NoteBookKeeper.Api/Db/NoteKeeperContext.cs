using Microsoft.EntityFrameworkCore;
using NoteBookKeeper.Api.Entities;

namespace NoteBookKeeper.Api.Db;

public class NoteKeeperContext(DbContextOptions<NoteKeeperContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<NoteSetting> NoteSettings => Set<NoteSetting>();
    public DbSet<NoteItem> NoteItems => Set<NoteItem>();
    public DbSet<NoteItemFile> NoteItemsFiles => Set<NoteItemFile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(p => p.Password).IsRequired();
            entity.Property(p => p.Email).HasMaxLength(320).IsRequired(false);
            entity.Property(p => p.UserName).HasMaxLength(80).IsRequired();
            entity.Property(p => p.NormalizedUserName).HasMaxLength(80).IsRequired();
            entity.HasIndex(p => p.NormalizedUserName).IsUnique();
            entity.HasIndex(p => p.Email).IsUnique();
            entity.HasQueryFilter(p => !p.IsDeleted);
        });

        modelBuilder.Entity<NoteSetting>(entity =>
        {
            entity.Property(p => p.Topic).HasMaxLength(150).IsRequired();
            entity.Property(p => p.Description).HasMaxLength(500);
            entity.HasOne(p => p.User)
                .WithMany(p => p.NoteSettings)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(p => !p.IsDeleted);
        });

        modelBuilder.Entity<NoteItem>(entity =>
        {
            entity.Property(p => p.Detail).IsRequired(false);
            entity.Property(p => p.RedirectLink).IsRequired(false);
            entity.HasOne(p => p.NoteSetting)
                .WithMany(p => p.Items)
                .HasForeignKey(p => p.NoteSettingId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(p => !p.IsDeleted);
        });

        modelBuilder.Entity<NoteItemFile>(entity =>
        {
            entity.Property(p => p.FileName).IsRequired();
            entity.Property(p => p.ContentType).IsRequired();
            entity.Property(p => p.Content).IsRequired();
            entity.HasIndex(p => p.Uuid).IsUnique();
            entity.HasOne(p => p.NoteItem)
                .WithMany(p => p.Files)
                .HasForeignKey(p => p.NoteItemId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(p => !p.IsDeleted);
        });
    }
}
