using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace NoteBookKeeper.Api.Models
{
    public record CreateNoteSettingDto([Required]string Topic, [AllowNull] string Description);
}
