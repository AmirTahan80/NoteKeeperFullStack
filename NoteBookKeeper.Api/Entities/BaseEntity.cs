using System.ComponentModel.DataAnnotations;

namespace NoteBookKeeper.Api.Entities;

public class BaseEntity<Tkeyt> where Tkeyt : struct
{
    [Key]
    public Tkeyt Id { get; set; }
    public DateTime CreationDate { get; set; }=DateTime.Now;
    public bool IsDeleted { get; set; } = false;
}