using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NoteBookKeeper.Api.Db;
using NoteBookKeeper.Api.Entities;
using NoteBookKeeper.Api.Models;
using NoteBookKeeper.Api.Models.Base;
using System.Security.Claims;

namespace NoteBookKeeper.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddNoteController(NoteKeeperContext ctx, IAmazonS3 amazonS3) : ControllerBase
    {
        [HttpPost("[action]")]
        [Authorize]
        public async Task<IActionResult> CreateNoteSetting([FromBody] CreateNoteSettingDto request)
        {

            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var newNoteSetting = new NoteSetting
            {
                Topic = request.Topic,
                Description = request.Description,
                UserId = userId,
                Uuid = Guid.NewGuid()
            };
            await ctx.NoteSettings.AddAsync(newNoteSetting);
            await ctx.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("[action]")]
        [Authorize]
        public async Task<IActionResult> CreateNoteItem([FromForm] CreateNoteItemDto request)
        {
            var setting = await ctx.NoteSettings
                .Select(p => new { p.Uuid, p.Id })
                .FirstOrDefaultAsync(p => p.Uuid == request.NoteSettingId);

            if (setting is null)
            {
                return NotFound("سرفصل شما یافت نشد");
            }

            var newNoteItem = new NoteItem()
            {
                RedirectLink = request.RedirectLink,
                Uuid = Guid.NewGuid(),
                NoteSettingId = setting.Id,
                Detail = request.Detail,
                SearchWords = request.SearchWords
            };
            await ctx.NoteItems.AddAsync(newNoteItem);
            await ctx.SaveChangesAsync();
            if (request.Files is { Count: > 0 })
            {
                await UploadObject(request.Files, newNoteItem.Id);
            }
            return NoContent();
        }

        [Authorize]
        [HttpGet("[action]")]
        public async Task<IActionResult> GetNotes([FromQuery] BaseRequestDto request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var notes = await ctx.NoteSettings
                .Where(n => n.UserId == userId)
                .Select(p => new
                {
                    p.Uuid,
                    p.Topic,
                    p.Description,
                    p.CreationDate
                }).ToListAsync();

            return Ok(notes);
        }

        [Authorize]
        [HttpGet("[action]/{noteId}")]
        public async Task<IActionResult> GetNoteItems([FromRoute] Guid noteId)
        {
            var noteItems = await ctx.NoteItems
                .Where(n => n.NoteSetting.Uuid == noteId)
                .Select(p => new GetNoteItemsDto(
                    p.RedirectLink,
                    p.Detail,
                    p.SearchWords,
                    p.Uuid,
                    p.Files.Select(e => $"http://localhost:9000/{e.FilePath}/{e.FileName}").ToList(),
                    p.CreationDate))
                .ToListAsync();
            return Ok(noteItems);
        }

        [Authorize]
        [HttpGet("[action]/{noteItemId}")]
        public async Task<IActionResult> GetNoteItemById([FromRoute] Guid noteItemId)
        {
            var noteItem = await ctx.NoteItems.Where(p=> p.Uuid == noteItemId)
                .Select(p => new GetNoteItemsDto(
                    p.RedirectLink,
                    p.Detail,
                    p.SearchWords,
                    p.Uuid,
                    p.Files.Select(e => $"http://localhost:9000/{e.FilePath}/{e.FileName}").ToList(),
                    p.CreationDate))
                .FirstOrDefaultAsync();
            return Ok(noteItem);
        }

        [Authorize]
        [HttpDelete("[action]/{NoteId}")]
        public async Task<IActionResult> DeleteNote([FromRoute] Guid NoteId)
        {
            var noteSetting = await ctx.NoteSettings.FirstOrDefaultAsync(p => p.Uuid == NoteId);
            if (noteSetting is null)
                return NotFound("نوت مورد نظر یافت نشد");
            noteSetting.IsDeleted = true;
            await ctx.SaveChangesAsync();
            return Ok(true);
        }


        private async Task UploadObject(ICollection<IFormFile> files, long noteId)
        {
            try
            {
                await amazonS3.EnsureBucketExistsAsync("note-items-files");
            }
            catch
            {
                // ignored
            }

            var newFiles = new List<NoteItemFile>();

            foreach (var formFile in files)
            {
                var name = "public-photos-" + Guid.NewGuid() + "." + formFile.FileName.Split('.').Last();
                var putObjectRequest = new PutObjectRequest()
                {
                    BucketName = "note-items-files",
                    Key = name,
                    InputStream = formFile.OpenReadStream(),

                };
                var pushObject = await amazonS3
                    .PutObjectAsync(putObjectRequest).ConfigureAwait(false);

                newFiles.Add(new()
                {
                    FileName = name,
                    FilePath = putObjectRequest.BucketName,
                    NoteItemId = noteId
                });
            }

            await ctx.NoteItemsFiles.AddRangeAsync(newFiles);
            await ctx.SaveChangesAsync();
        }

        //private async Task GetObject()
        //{
        //    var objectGet = new GetObjectRequest()
        //    {
        //        Key = "Screenshot 2024-01-27 124727.png",
        //        BucketName = "note-items-files",
        //        EtagToMatch = "a48d6699f8ea05984da00ab8cbe6492f"
        //    };
        //    var image = await amazonS3.GetObjectAsync(objectGet);
        //    string base64 = "";

        //    using (MemoryStream responseStream = new MemoryStream())
        //    {
        //        image.ResponseStream.CopyTo(responseStream);
        //        var bytes = responseStream.ToArray();
        //        base64 = Convert.ToBase64String(bytes);
        //    }

        //    int a = 2;
        //    image.Dispose();
        //}
    }
}