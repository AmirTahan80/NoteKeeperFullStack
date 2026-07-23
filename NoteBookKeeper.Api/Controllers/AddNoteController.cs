using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NoteBookKeeper.Api.Db;
using NoteBookKeeper.Api.Entities;
using NoteBookKeeper.Api.Models;
using NoteBookKeeper.Api.Models.Base;

namespace NoteBookKeeper.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class AddNoteController(NoteKeeperContext context) : ControllerBase
{
    private const long MaxFileSize = 5 * 1024 * 1024;
    private const int MaxFileCount = 5;

    [HttpPost("[action]")]
    public async Task<IActionResult> CreateNoteSetting(CreateNoteSettingDto request)
    {
        var userId = GetUserId();
        var userExists = await context.Users.AnyAsync(user => user.Id == userId);
        if (!userExists)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Your session is no longer linked to an active user. Please sign in again.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var noteSetting = new NoteSetting
        {
            Topic = request.Topic.Trim(),
            Description = request.Description?.Trim(),
            UserId = userId,
            Uuid = Guid.NewGuid()
        };

        context.NoteSettings.Add(noteSetting);
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("[action]")]
    [RequestSizeLimit(26 * 1024 * 1024)]
    public async Task<IActionResult> CreateNoteItem([FromForm] CreateNoteItemDto request)
    {
        var userId = GetUserId();
        var setting = await context.NoteSettings
            .Where(setting => setting.Uuid == request.NoteSettingId && setting.UserId == userId)
            .Select(setting => new { setting.Id })
            .SingleOrDefaultAsync();

        if (setting is null)
        {
            return NotFound(new ProblemDetails { Title = "سرفصل یافت نشد." });
        }

        if (request.Files.Count > MaxFileCount || request.Files.Any(file => file.Length > MaxFileSize))
        {
            return BadRequest(new ProblemDetails
            {
                Title = $"حداکثر {MaxFileCount} فایل و حداکثر ۵ مگابایت برای هر فایل مجاز است."
            });
        }

        var noteItem = new NoteItem
        {
            RedirectLink = string.IsNullOrWhiteSpace(request.RedirectLink) ? null : request.RedirectLink.Trim(),
            Uuid = Guid.NewGuid(),
            NoteSettingId = setting.Id,
            Detail = request.Detail.Trim(),
            SearchWords = string.Join(',', request.SearchWords
                .Select(word => word.Trim())
                .Where(word => word.Length > 0)
                .Distinct(StringComparer.OrdinalIgnoreCase))
        };

        foreach (var file in request.Files.Where(file => file.Length > 0))
        {
            await using var stream = new MemoryStream();
            await file.CopyToAsync(stream, HttpContext.RequestAborted);
            noteItem.Files.Add(new NoteItemFile
            {
                Uuid = Guid.NewGuid(),
                FileName = Path.GetFileName(file.FileName),
                ContentType = string.IsNullOrWhiteSpace(file.ContentType)
                    ? "application/octet-stream"
                    : file.ContentType,
                Content = stream.ToArray()
            });
        }

        context.NoteItems.Add(noteItem);
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("[action]")]
    public async Task<IActionResult> GetNotes([FromQuery] BaseRequestDto request)
    {
        var pageNumber = Math.Max(request.PageNumber, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var query = context.NoteSettings.Where(note => note.UserId == GetUserId());

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(note =>
                EF.Functions.ILike(note.Topic, $"%{search}%")
                || (note.Description != null && EF.Functions.ILike(note.Description, $"%{search}%")));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(note => note.CreationDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(note => new
            {
                note.Uuid,
                note.Topic,
                note.Description,
                note.CreationDate
            })
            .ToListAsync();

        return Ok(new { items, totalCount });
    }

    [HttpGet("[action]/{noteId:guid}")]
    public async Task<ActionResult<IReadOnlyList<GetNoteItemsDto>>> GetNoteItems(Guid noteId)
    {
        var userId = GetUserId();
        var noteExists = await context.NoteSettings
            .AnyAsync(note => note.Uuid == noteId && note.UserId == userId);
        if (!noteExists)
        {
            return NotFound();
        }

        var items = await context.NoteItems
            .Where(item => item.NoteSetting.Uuid == noteId && item.NoteSetting.UserId == userId)
            .OrderByDescending(item => item.CreationDate)
            .Select(item => new GetNoteItemsDto(
                item.RedirectLink,
                item.Detail,
                item.SearchWords,
                item.Uuid,
                item.Files.Select(file => $"/api/AddNote/File/{file.Uuid}").ToList(),
                item.CreationDate))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("[action]/{noteItemId:guid}")]
    public async Task<ActionResult<GetNoteItemsDto>> GetNoteItemById(Guid noteItemId)
    {
        var userId = GetUserId();
        var item = await context.NoteItems
            .Where(note => note.Uuid == noteItemId && note.NoteSetting.UserId == userId)
            .Select(note => new GetNoteItemsDto(
                note.RedirectLink,
                note.Detail,
                note.SearchWords,
                note.Uuid,
                note.Files.Select(file => $"/api/AddNote/File/{file.Uuid}").ToList(),
                note.CreationDate))
            .SingleOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("File/{fileId:guid}")]
    public async Task<IActionResult> GetFile(Guid fileId)
    {
        var userId = GetUserId();
        var file = await context.NoteItemsFiles
            .Where(file => file.Uuid == fileId && file.NoteItem.NoteSetting.UserId == userId)
            .Select(file => new { file.Content, file.ContentType, file.FileName })
            .SingleOrDefaultAsync();

        return file is null
            ? NotFound()
            : File(file.Content, file.ContentType, file.FileName, enableRangeProcessing: true);
    }

    [HttpDelete("[action]/{noteId:guid}")]
    public async Task<IActionResult> DeleteNote(Guid noteId)
    {
        var noteSetting = await context.NoteSettings
            .SingleOrDefaultAsync(note => note.Uuid == noteId && note.UserId == GetUserId());
        if (noteSetting is null)
        {
            return NotFound(new ProblemDetails { Title = "نوت موردنظر یافت نشد." });
        }

        noteSetting.IsDeleted = true;
        await context.SaveChangesAsync();
        return NoContent();
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("The access token does not contain a valid user identifier.");
    }
}
