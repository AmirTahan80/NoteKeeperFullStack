namespace NoteBookKeeper.Api.Entities;

public class NoteItemFile : BaseEntity<long>
{
    public Guid Uuid { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public byte[] Content { get; set; } = [];
    public long NoteItemId { get; set; }
    public NoteItem NoteItem { get; set; } = null!;
}
