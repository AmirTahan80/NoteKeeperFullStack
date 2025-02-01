using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace NoteBookKeeper.Api.Models;

public record RegisterUserDto
{
    [Required]
    public string UserName { get; set; }
        
    [EmailAddress, AllowNull]
    public string Email { get; set; }
        
    [Required]
    public string Password { get; set; }

    [Compare(otherProperty: "Password", ErrorMessage = "رمز عبور یکی نیست")]
    public string RePassword { get; set; }
}