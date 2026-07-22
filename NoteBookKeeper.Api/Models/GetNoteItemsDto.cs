namespace NoteBookKeeper.Api.Models;

public record GetNoteItemsDto(
    string? RedirectLink,
    string? Detail,
    string SearchWords,
    Guid Uuid,
    IList<string> FilePaths,
    DateTime CreationDate);
