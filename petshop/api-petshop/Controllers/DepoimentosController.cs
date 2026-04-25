using ApiPetshop.Data;
using ApiPetshop.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace ApiPetshop.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepoimentosController : ControllerBase
{
    private readonly AppDbContext _context;

    public DepoimentosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var depoimentos = await _context.Depoimentos.ToListAsync();
        return Ok(depoimentos);
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Depoimento depoimento)
    {
        _context.Depoimentos.Add(depoimento);
        await _context.SaveChangesAsync();
        return Ok(depoimento);
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Depoimento updatedData)
    {
        var depoimento = await _context.Depoimentos.FindAsync(id);
        if (depoimento == null) return NotFound();

        depoimento.Autor = updatedData.Autor;
        depoimento.Texto = updatedData.Texto;
        depoimento.AvatarUrl = updatedData.AvatarUrl;

        await _context.SaveChangesAsync();
        return Ok(depoimento);
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var depoimento = await _context.Depoimentos.FindAsync(id);
        if (depoimento == null) return NotFound();

        _context.Depoimentos.Remove(depoimento);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Depoimento deletado" });
    }
}
