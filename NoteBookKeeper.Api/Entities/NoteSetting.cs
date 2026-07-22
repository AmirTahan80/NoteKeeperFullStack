namespace NoteBookKeeper.Api.Entities;

public class NoteSetting : BaseEntity<int>
{
    public Guid Uuid { get; set; }
    public string Topic { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid UserId { get; set; }
    public ICollection<NoteItem> Items { get; set; } = [];
    public User User { get; set; } = null!;
}
