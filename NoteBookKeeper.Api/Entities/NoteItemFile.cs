namespace NoteBookKeeper.Api.Entities;

public class NoteItemFile : BaseEntity<long>
{
    public string FileName { get; set; }
    public string FilePath { get; set; }
    public long NoteItemId { get; set; }
    public NoteItem NoteItem { get; set; }
}