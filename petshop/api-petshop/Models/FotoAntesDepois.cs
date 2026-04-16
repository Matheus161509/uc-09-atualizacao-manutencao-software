using Microsoft.AspNetCore.Http; // Necessário para usar o IFormFile

namespace ApiPetshop.Models;

/// <summary>
/// Uma classe Model (Modelo) representa essencialmente a estrutura de uma tabela no Banco de Dados.
/// Além disso, é a classe de dados principal que vai percorrer o sistema.
/// </summary>
public class FotoAntesDepois
{
    // A propriedade "Id" quase sempre vira a Chave Primária (Primary Key - PK) da tabela
    // Sendo auto-incremento no MySQL, ou seja, gerada automaticamente (1, 2, 3...)
    public int Id { get; set; }

    // Representa a coluna para o nome do cachorro. O "= string.Empty;" serve para evitar o aviso
    // de que este campo na inicialização não pode ser nulo (null warning).
    public string NomeCachorro { get; set; } = string.Empty;

    // Coluna para armazenar o endereço relativo de onde a foto foi salva fisicamente no disco.
    public string CaminhoFoto { get; set; } = string.Empty;

    // A interrogação "?" em "string?" quer dizer que essa propriedade é opcional (nula) na tabela (NULL)
    public string? LinkRedeSocial { get; set; }

    // Salva a data exata que este registro foi salvo
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}


/// <summary>
/// A classe DTO (Data Transfer Object) é usada exclusivamente para representar
/// e transportar os dados de requisições web. É a assinatura de dados que a API espera do usuário do sistema.
/// O DTO evita usarmos a model (FotoAntesDepois) base diretamente na camada de rede.
/// </summary>
public class UploadFotoDto
{
    // O nome que será recebido da requisição
    public string NomeCachorro { get; set; }
    
    // Representa um envio de arquivo via Form/Mulitpart
    public IFormFile Arquivo { get; set; }
}