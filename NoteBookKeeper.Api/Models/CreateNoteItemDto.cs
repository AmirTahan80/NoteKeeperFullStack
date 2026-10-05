using System.ComponentModel.DataAnnotations;

namespace NoteBookKeeper.Api.Models;

public sealed class CreateNoteItemDto
{
    [Required]
    public string Detail { get; set; } = string.Empty;

    public List<string> SearchWords { get; set; } = [];

    private string? _redirectLink;

    [Url]
    public string? RedirectLink
    {
        get => _redirectLink;
        set => _redirectLink = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    public ICollection<IFormFile> Files { get; set; } = [];

    [Required]
    public Guid NoteSettingId { get; set; }
}
