using System.Diagnostics.CodeAnalysis;

namespace NoteBookKeeper.Api.Models;

public record CreateNoteItemDto(
    [AllowNull] string? Detail,
    string? SearchWords,
    string? RedirectLink,
    ICollection<IFormFile>? Files,
    Guid NoteSettingId);