using System.ComponentModel.DataAnnotations;
using NoteBookKeeper.Api.Models;

namespace NoteBookKeeper.Api.Tests;

public class DtoValidationTests
{
    private static IList<ValidationResult> ValidateModel(object model)
    {
        var validationResults = new List<ValidationResult>();
        var ctx = new ValidationContext(model, serviceProvider: null, items: null);
        Validator.TryValidateObject(model, ctx, validationResults, validateAllProperties: true);
        return validationResults;
    }

    [Fact]
    public void CreateNoteItemDto_WithEmptyOrWhitespaceRedirectLink_ShouldBeValid()
    {
        var dto = new CreateNoteItemDto
        {
            Detail = "Test note detail",
            SearchWords = ["test"],
            RedirectLink = "",
            NoteSettingId = Guid.NewGuid()
        };

        var results = ValidateModel(dto);

        Assert.Empty(results);
        Assert.Null(dto.RedirectLink);
    }

    [Fact]
    public void CreateNoteItemDto_WithValidRedirectLink_ShouldBeValid()
    {
        var dto = new CreateNoteItemDto
        {
            Detail = "Test note detail",
            SearchWords = ["test"],
            RedirectLink = "https://github.com",
            NoteSettingId = Guid.NewGuid()
        };

        var results = ValidateModel(dto);

        Assert.Empty(results);
        Assert.Equal("https://github.com", dto.RedirectLink);
    }

    [Fact]
    public void CreateNoteItemDto_WithInvalidRedirectLink_ShouldFailValidation()
    {
        var dto = new CreateNoteItemDto
        {
            Detail = "Test note detail",
            SearchWords = ["test"],
            RedirectLink = "not-a-valid-url",
            NoteSettingId = Guid.NewGuid()
        };

        var results = ValidateModel(dto);

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CreateNoteItemDto.RedirectLink)));
    }

    [Fact]
    public void RegisterUserDto_WithEmptyOrWhitespaceEmail_ShouldBeValid()
    {
        var dto = new RegisterUserDto
        {
            UserName = "testuser",
            Email = "",
            Password = "Password123!",
            RePassword = "Password123!"
        };

        var results = ValidateModel(dto);

        Assert.Empty(results);
        Assert.Null(dto.Email);
    }

    [Fact]
    public void RegisterUserDto_WithValidEmail_ShouldBeValid()
    {
        var dto = new RegisterUserDto
        {
            UserName = "testuser",
            Email = "user@example.com",
            Password = "Password123!",
            RePassword = "Password123!"
        };

        var results = ValidateModel(dto);

        Assert.Empty(results);
        Assert.Equal("user@example.com", dto.Email);
    }

    [Fact]
    public void RegisterUserDto_WithInvalidEmail_ShouldFailValidation()
    {
        var dto = new RegisterUserDto
        {
            UserName = "testuser",
            Email = "not-an-email",
            Password = "Password123!",
            RePassword = "Password123!"
        };

        var results = ValidateModel(dto);

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(RegisterUserDto.Email)));
    }
}
