using System.ComponentModel.DataAnnotations;

namespace NoteBookKeeper.Api.Entities;

public class BaseEntity<TKey> where TKey : struct
{
    [Key]
    public TKey Id { get; set; }
    public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
}
