using System.ComponentModel.DataAnnotations;

namespace NoteBookKeeper.Api.Models;

public record RegisterUserDto
{
    [Required, StringLength(80, MinimumLength = 3)]
    public string UserName { get; set; } = string.Empty;

    [EmailAddress, StringLength(320)]
    public string? Email { get; set; }

    [Required, StringLength(128, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [Compare(nameof(Password), ErrorMessage = "The passwords do not match.")]
    public string RePassword { get; set; } = string.Empty;
}
