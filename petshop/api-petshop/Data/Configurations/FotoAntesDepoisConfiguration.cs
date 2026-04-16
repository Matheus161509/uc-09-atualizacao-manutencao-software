using ApiPetshop.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ApiPetshop.Data.Configurations;

public class FotoAntesDepoisConfiguration : IEntityTypeConfiguration<FotoAntesDepois>
{
    public void Configure(EntityTypeBuilder<FotoAntesDepois> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.NomeCachorro)
            .IsRequired()
            .HasMaxLength(100);
        builder.Property(f => f.CaminhoFoto)
            .IsRequired()
            .HasMaxLength(255);
        builder.Property(f => f.LinkRedeSocial)
            .HasMaxLength(255);
        builder.Property(f => f.DataCriacao)
            .IsRequired();
    }
}
