using ApiPetshop.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Inicializa o criador (builder) da aplicação Web
var builder = WebApplication.CreateBuilder(args);

// Configuração do CORS (Cross-Origin Resource Sharing)
// Permite que nossa API seja acessada pelo frontend (ex: HTML/JS na porta 5500 ou 3000)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        // "AllowAnyOrigin" permite requisições de qualquer origem (IP ou domínio)
        // "AllowAnyMethod" permite métodos como GET, POST, PUT, DELETE
        // "AllowAnyHeader" permite o envio de qualquer cabeçalho na requisição
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// Obtém a string de conexão configurada no appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Configurando o Banco de Dados (Entity Framework Core com MySQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        // Define a versão do servidor MySQL utilizado
        new MySqlServerVersion(new Version(8, 0, 36)),
        // Configura uma resiliência básica a falhas de conexão
        mySqlOptions => mySqlOptions.EnableRetryOnFailure()
    )
);

// Adiciona os serviços necessários para trabalhar com Controllers (as rotas/APIs)
builder.Services.AddControllers();

var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:SecretKey"] ?? "EssaEhMinhaChaveSuperSecretaEForteDoPetshop123!");
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// Adiciona recursos para descobrir automatiamente os endpoints e mostrar na documentação
builder.Services.AddEndpointsApiExplorer();

// Configura o gerador da documentação interativa da API (Swagger)
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "ApiPetshop", Version = "v1" });
});

// A partir daqui, as configurações de serviços (injeção de dependência) terminaram
// E inicia-se o "pipeline de requisições HTTP" (Middlewares)
var app = builder.Build();

// Verifica se o ambiente de execução é "Desenvolvimento"
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    // ✅ ADICIONADO
    app.UseSwaggerUI();

    app.MapScalarApiReference(options =>
    {
        options.WithOpenApiRoutePattern("/swagger/{documentName}/swagger.json");
    });
}

// Redireciona requisições HTTP para HTTPS, aumentando a segurança
app.UseHttpsRedirection();

// Habilita o servidor para retornar arquivos estáticos (ex: imagens, HTML que estiverem na pasta wwwroot)
app.UseStaticFiles();

// Aplica a política de CORS criada anteriormente ("AllowAll")
app.UseCors("AllowAll");

// Habilita a autorização e autenticação
app.UseAuthentication();
app.UseAuthorization();

// Mapeia nossas classes Controllers para que respondam às requisições chamadas
app.MapControllers();

// Bloco para inicializar ou atualizar o banco de dados e inserir dados iniciais na primeira execução
using (var scope = app.Services.CreateScope())
{
    // Acessa o contexto do banco de dados na memória do App
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Executa as migrações pendentes para criar as tabelas no MySQL se não existirem
    db.Database.Migrate();
    // Chama o método para popular inicialmente algumas fotos no banco (Seeding)
    SeedData.Seed(db);
}

// Por fim, executa a aplicação para começar a receber requisições do mundo exterior!
app.Run();
