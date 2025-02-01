using System.Text.Json.Serialization;

namespace NoteBookKeeper.Api.Entities;

public class NoteItem : BaseEntity<long>
{
    public string? Detail { get; set; }
    public string SearchWords { get; set; }
    public int NoteSettingId { get; set; }
    public string RedirectLink { get; set; } = "#";
    public Guid Uuid { get; set; }

    [JsonIgnore]
    public NoteSetting NoteSetting { get; set; }
    [JsonIgnore]
    public ICollection<NoteItemFile>? Files { get; set; }
}