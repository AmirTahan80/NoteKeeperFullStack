using System.ComponentModel.DataAnnotations;

namespace NoteBookKeeper.Api.Models;

public sealed class CreateNoteItemDto
{
    [Required]
    public string Detail { get; set; } = string.Empty;

    public List<string> SearchWords { get; set; } = [];

    [Url]
    public string? RedirectLink { get; set; }

    public ICollection<IFormFile> Files { get; set; } = [];

    [Required]
    public Guid NoteSettingId { get; set; }
}
