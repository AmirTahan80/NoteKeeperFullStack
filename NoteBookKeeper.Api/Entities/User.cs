namespace NoteBookKeeper.Api.Entities;

public class User : BaseEntity<Guid>
{
    public string UserName { get; set; } = string.Empty;
    public string NormalizedUserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Email { get; set; }
    public ICollection<NoteSetting> NoteSettings { get; set; } = [];
}
