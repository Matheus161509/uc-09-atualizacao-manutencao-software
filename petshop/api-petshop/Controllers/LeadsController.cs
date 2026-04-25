using ApiPetshop.Data;
using ApiPetshop.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace ApiPetshop.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeadsController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var leads = await _context.Leads.OrderByDescending(l => l.DataEnvio).ToListAsync();
        return Ok(leads);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Lead lead)
    {
        lead.DataEnvio = DateTime.UtcNow;
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Mensagem recebida com sucesso!" });
    }
}
