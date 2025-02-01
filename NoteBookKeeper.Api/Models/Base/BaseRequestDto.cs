namespace NoteBookKeeper.Api.Models.Base
{
    public record BaseRequestDto(string? Search = null, int PageNumber = 1, int PageSize = 10);
}
