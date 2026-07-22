using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NoteBookKeeper.Api.Db;
using NoteBookKeeper.Api.Entities;
using NoteBookKeeper.Api.Models;

namespace NoteBookKeeper.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(
    NoteKeeperContext context,
    IConfiguration configuration,
    IPasswordHasher<User> passwordHasher) : ControllerBase
{
    [HttpPost("[action]")]
    public async Task<ActionResult<LoginUserResponseDto>> Login(LoginUserDto request)
    {
        var normalizedUserName = NormalizeUserName(request.UserName);
        var user = await context.Users.SingleOrDefaultAsync(u => u.NormalizedUserName == normalizedUserName);

        if (user is null
            || passwordHasher.VerifyHashedPassword(user, user.Password, request.Password)
                == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "نام کاربری یا رمز عبور اشتباه است.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var expiryMinutes = configuration.GetValue<double?>("Jwt:ExpiryInMinutes") ?? 360;

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: [new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())],
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return Ok(new LoginUserResponseDto(new JwtSecurityTokenHandler().WriteToken(token)));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserDto request)
    {
        var normalizedUserName = NormalizeUserName(request.UserName);
        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email)
            ? null
            : request.Email.Trim().ToLowerInvariant();

        var alreadyExists = await context.Users.AnyAsync(user =>
            user.NormalizedUserName == normalizedUserName
            || (normalizedEmail != null && user.Email == normalizedEmail));

        if (alreadyExists)
        {
            return Conflict(new ProblemDetails
            {
                Title = "نام کاربری یا ایمیل قبلاً استفاده شده است.",
                Status = StatusCodes.Status409Conflict
            });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = request.UserName.Trim(),
            NormalizedUserName = normalizedUserName,
            Email = normalizedEmail
        };
        user.Password = passwordHasher.HashPassword(user, request.Password);

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return NoContent();
    }

    private static string NormalizeUserName(string userName) => userName.Trim().ToUpperInvariant();
}
