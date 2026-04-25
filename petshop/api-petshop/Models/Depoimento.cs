namespace ApiPetshop.Models;

public class Depoimento
{
    public int Id { get; set; }
    public string Autor { get; set; } = string.Empty;
    public string Texto { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
}
