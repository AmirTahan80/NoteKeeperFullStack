using System.ComponentModel.DataAnnotations;

namespace NoteBookKeeper.Api.Models;

public record CreateNoteSettingDto(
    [Required, StringLength(150, MinimumLength = 3)] string Topic,
    [StringLength(500)] string? Description);
