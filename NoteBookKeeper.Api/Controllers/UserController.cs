using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NoteBookKeeper.Api.Db;
using NoteBookKeeper.Api.Entities;
using NoteBookKeeper.Api.Models;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace NoteBookKeeper.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController(NoteKeeperContext ctx, IConfiguration configuration) : ControllerBase
    {
        private const int SaltSize = 16;
        private const int KeySize = 64;
        private const int Iterations = 10000;
        private const char Delimiter = ':';
        private readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA512;
        private const string salt = "ThisMySalrd5468215846qwe654f";

        [HttpPost("[action]")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto request)
        {
            var pssword = HashPassword(request.Password, salt);
            var user = await ctx.Users.FirstOrDefaultAsync(u => u.UserName == request.UserName && u.Password == pssword);

            if (user == null)
                throw new UnauthorizedAccessException("Not founded");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(configuration["Jwt:ExpiryInMinutes"])),
                signingCredentials: credentials
            );
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenString = tokenHandler.WriteToken(token);

            var response = new LoginUserResponseDto(tokenString);

            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto request)
        {
            var isUserNameOrEmailExists = await ctx.Users.AnyAsync(u => u.UserName == request.UserName || u.Email == request.Email);
            if (isUserNameOrEmailExists)
                throw new DuplicateNameException("نام کاربری یا ایمیل قبلا استفاده شده است");
            var newUser = new User()
            {
                Email = request.Email,
                Password = HashPassword(request.Password, salt),
                UserName = request.UserName
            };
            await ctx.Users.AddAsync(newUser);
            await ctx.SaveChangesAsync();

            return NoContent();
        }

        private string HashPassword(string password, string salt = null)
        {
            var saltBytes = salt != null ?
                Convert.FromBase64String(salt) :
                RandomNumberGenerator.GetBytes(SaltSize);

            var hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                saltBytes,
                Iterations,
                HashAlgorithm,
                KeySize);

            return string.Join(
                Delimiter,
                Convert.ToBase64String(saltBytes),
                Iterations,
                Convert.ToBase64String(hash));
        }
        // Helper methods
    }
}
