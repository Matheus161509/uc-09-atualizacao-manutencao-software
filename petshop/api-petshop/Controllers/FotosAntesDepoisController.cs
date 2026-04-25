using ApiPetshop.Data;
using ApiPetshop.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiPetshop.Controllers;

/// <summary>
/// A classe Controller define as rotas da API na web e quais métodos (endpoints)
/// serão executados dependendo da requisição HTTP (GET, POST, DELETE, etc.).
/// </summary>
[ApiController] // Identifica esta classe como um Controlador de API (habilita validações automáticas, etc.)
[Route("api/fotos")] // Define o caminho (URL) principal: ex. http://localhost:5000/api/fotos
public class FotosAntesDepoisController : ControllerBase
{
    // Variável para armazenar a instância da comunicação do banco de dados (Contexto)
    private readonly AppDbContext _context;

    // Construtor do Controller: O ASP.NET Injeta o "AppDbContext" automaticamente (Injeção de Dependências)
    public FotosAntesDepoisController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Rota: GET /api/fotos
    /// Retorna uma lista em formato JSON com todas as fotos salvas no banco de dados.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ObterTodas()
    {
        // Pede ao EntityFramework para buscar todos os registros da tabela "FotosAntesDepois"
        var fotos = await _context.FotosAntesDepois.ToListAsync();
        
        // Retorna o status HTTP 200 (Ok) junto com os dados encontrados
        return Ok(fotos);
    }

    /// <summary>
    /// Rota: POST /api/fotos/upload
    /// Rota responsável por receber a imagem do cachorro e as informações vindas do formulário HTML/JS.
    /// É o momento onde o arquivo é fisicamente salvo no servidor e seus dados no banco.
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost("upload")]
    [Consumes("multipart/form-data")] // Assinatura obrigatória para recebimento de arquivos em formulários web!
    public async Task<IActionResult> UploadFoto([FromForm] UploadFotoDto request)
    {
        // 1. Validação básica: garante que recebemos algum arquivo com tamanho maior que 0 bytes
        if (request.Arquivo == null || request.Arquivo.Length == 0)
            return BadRequest("Arquivo não enviado.");

        // 2. Diretório físico: cria/encontra a pasta "wwwroot/uploads" no servidor/projeto onde vamos salvar as fotos
        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        // 3. Nome seguro: Geração de um "Guid" (Código único e aleatório) para garantir 
        //    que não haverá arquivos sobrescrevendo/apresentando erros caso tenham o mesmo nome original
        var fileName = $"{Guid.NewGuid()}_{request.Arquivo.FileName}";
        var filePath = Path.Combine(uploadsPath, fileName);

        // 4. Salva o arquivo: Abre um "Stream" na memória e copia/transfere os dados do Arquivo para onde escolhemos (no HD do servidor)
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.Arquivo.CopyToAsync(stream);
        }

        // 5. Prepara o objeto: Cria a entidade principal que será salva no bando de dados da aplicação
        var foto = new FotoAntesDepois
        {
            NomeCachorro = request.NomeCachorro,
            // Guardamos apenas o caminho relativo que será exposto na Web para as páginas acessarem a imagem
            CaminhoFoto = $"uploads/{fileName}",
            DataCriacao = DateTime.UtcNow
        };
        
        // 6. Grava no banco e salva (Commit)
        _context.FotosAntesDepois.Add(foto);
        await _context.SaveChangesAsync();

        // 7. Retorna "Created" (HTTP 201), indicando também em qual rota é possível obter o registro recém criado
        return CreatedAtAction(nameof(ObterTodas), new { id = foto.Id }, foto);
    }

    /// <summary>
    /// Rota: DELETE /api/fotos/{id}
    /// Deleta exclusivamente um item baseado em seu ID (ex. DELETE http://localhost:5000/api/fotos/3). 
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        // Tenta achar aquele ID específico no MySQL
        var foto = await _context.FotosAntesDepois.FindAsync(id);
        
        // Se a foto não existir ou não for encontrada pro ID fornecido, retorna erro padrão 404 (Not Found)
        if (foto == null)
            return NotFound(new { mensagem = "Foto não encontrada." });

        // Apaga do banco e confirma (salvando as alterações)
        _context.FotosAntesDepois.Remove(foto);
        await _context.SaveChangesAsync();

        // Operação bem-sucedida! Retorna Status 200 (Ok) e uma mensagem confirmando
        return Ok(new { mensagem = "Foto excluída com sucesso." });
    }
}
