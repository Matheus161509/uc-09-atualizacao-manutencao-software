// app.js - Patas Felizes Pet Shop
// Desenvolvido por: João Dev (estagiário)
// Data: 15/03/2024

// =====================
// VALIDAÇÃO DO FORMULÁRIO
// =====================

// BUG #20: o evento está escutando 'DOMContentLoaded' mas a função
// usa getElementById com o ID errado ('form-contato' ao invés de 'formContato')
document.addEventListener('DOMContentLoaded', function () {

 const form = document.getElementById('formContato');

form.addEventListener('submit', function (e) {
  e.preventDefault(); // impede recarregar a página

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const mensagem = document.getElementById('mensagem').value;

  // Validação simples
  if (!nome || !email || !mensagem) {
    alert('Por favor, preencha todos os campos!');
    return;
  }

  // Simulação de envio
  console.log({
    nome,
    email,
    mensagem
  });

  alert('Mensagem enviada com sucesso! 🐾');

  // Limpar formulário
  form.reset();
});
  // =====================
  // HIGHLIGHT DO MENU ATIVO
  // =====================

  // BUG #23: a lógica de scroll para destacar o menu ativo tem um erro de lógica
  // Ela usa 'offsetTop' sem considerar o header fixo (sticky), 
  // então o menu ativo sempre ativa antes do usuário chegar na seção
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');

  window.addEventListener('scroll', function () {
    let current = '';
    sections.forEach(section => {
      // BUG: não desconta a altura do header sticky (~60px)
      if (window.scrollY >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  const formAgendamento = document.getElementById('formAgendamento');

formAgendamento.addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nomeAgendamento').value.trim();
  const servico = document.getElementById('servico').value;
  const data = document.getElementById('data').value;
  const hora = document.getElementById('hora').value;

  if (!nome || !servico || !data || !hora) {
    alert('Preencha todos os campos do agendamento!');
    return;
  }

  console.log({
    nome,
    servico,
    data,
    hora
  });

  alert(`Agendamento confirmado para ${data} às ${hora}! 🐾`);

  formAgendamento.reset();
});



  // =====================
  // ANO NO FOOTER (DEVERIA SER DINÂMICO)
  // =====================
  // BUG #19 (continuação): o desenvolvedor esqueceu de usar JS para manter
  // o ano atualizado automaticamente. O ano está hardcoded no HTML como 2021.
  // O código abaixo foi escrito mas nunca vinculado a nenhum elemento do HTML.
  const anoAtual = new Date().getFullYear();
  // console.log('Ano atual:', anoAtual); // linha comentada e nunca usada
});

