using ApiPetshop.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiPetshop.Data;

/// <summary>
/// A classe SeedData é responsável por inserir (popular) registros iniciais no banco de dados
/// caso ele esteja vazio. Isso facilita muito os testes pois não começamos com o banco "zerado".
/// </summary>
public static class SeedData
{
    /// <summary>
    /// O método Seed verifica e insere os dados iniciais.
    /// Recebe o "AppDbContext" para interagir com o banco de dados.
    /// </summary>
    public static void Seed(AppDbContext context)
    {
        // Verifica se a tabela FotosAntesDepois não possui NENHUM registro
        if (!context.FotosAntesDepois.Any())
        {
            // Adiciona uma lista de novos objetos FotoAntesDepois
            context.FotosAntesDepois.AddRange(
                new FotoAntesDepois
                {
                    NomeCachorro = "Bob", // Nome fictício para demonstração
                    CaminhoFoto = "uploads/bob-antes-depois.jpg", // Caminho de teste
                    LinkRedeSocial = null,
                    DataCriacao = DateTime.UtcNow // Data e hora atual (padrão UTC)
                },
                new FotoAntesDepois
                {
                    NomeCachorro = "Luna",
                    CaminhoFoto = "uploads/luna-antes-depois.jpg",
                    LinkRedeSocial = null,
                    DataCriacao = DateTime.UtcNow
                },
                new FotoAntesDepois
                {
                    NomeCachorro = "Toby",
                    CaminhoFoto = "uploads/toby-antes-depois.jpg",
                    LinkRedeSocial = null,
                    DataCriacao = DateTime.UtcNow
                }
            );
            
            // É obrigatório chamar o SaveChanges() para que o Entity Framework gere as queries "INSERT" 
            // e de fato grave essas informações no banco de dados MySQL.
            context.SaveChanges();
        }
            // Adiciona admin
        if (!context.AdminUsers.Any())
        {
            context.AdminUsers.Add(new AdminUser
            {
                Username = "admin",
                PasswordHash = "admin123" // In real life, use a hash, this is simple.
            });
            context.SaveChanges();
        }
    }
}
