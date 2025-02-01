namespace NoteBookKeeper.Api.Entities
{
    public class User : BaseEntity<Guid>
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }

        public ICollection<NoteSetting> NoteSettings { get; set; }
    }
}
