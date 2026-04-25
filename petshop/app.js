// app.js - Patas Felizes Pet Shop
const BASE_API = 'http://localhost:5118/api';

document.addEventListener('DOMContentLoaded', function () {
  
  // 1. Integrar Formulário de Contato (Leads)
  const form = document.getElementById('formContato');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('e-mail').value.trim(); // o HTML usa 'e-mail'
      const mensagem = document.getElementById('mensagem').value.trim();

      if (!nome || !email || !mensagem) {
        alert('Por favor, preencha todos os campos!');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerText;
      btn.disabled = true;
      btn.innerText = 'Enviando...';

      try {
        const response = await fetch(`${BASE_API}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, mensagem })
        });

        if (response.ok) {
          alert('Mensagem enviada com sucesso! Logo entraremos em contato.');
          form.reset();
        } else {
          alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor da API.');
      } finally {
        btn.disabled = false;
        btn.innerText = originalText;
      }
    });
  }

  // 2. Carregar Depoimentos Dinamicamente
  carregarDepoimentos();

  // 3. Carregar Galeria Dinamicamente
  carregarGaleria();

  // 4. Highlight do menu ativo (corrigido offset do header)
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');
  const headerHeight = 70; 

  window.addEventListener('scroll', function () {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerHeight - 10;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('underline', 'text-yellow-200');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('underline', 'text-yellow-200');
      }
    });
  });

  // 5. Ano Dinâmico no Footer
  const anoAtualSpan = document.getElementById('anoAtual');
  if (anoAtualSpan) {
    anoAtualSpan.textContent = new Date().getFullYear();
  }
});

// Funções Auxiliares de API
async function carregarDepoimentos() {
  try {
    const response = await fetch(`${BASE_API}/depoimentos`);
    if (response.ok) {
      const depoimentos = await response.json();
      const grid = document.getElementById('depoimentosGrid');
      
      if (!grid) return;
      grid.innerHTML = '';

      if (depoimentos.length === 0) {
        grid.innerHTML = '<p class="text-center col-span-3 text-gray-500">Nenhum depoimento cadastrado ainda.</p>';
        return;
      }

      depoimentos.forEach(d => {
        const avatar = d.avatarUrl && d.avatarUrl !== 'null' ? d.avatarUrl : 'images/logo.png';
        grid.innerHTML += `
          <div class="bg-yellow-50 rounded-2xl p-6 shadow-md border border-yellow-100 flex flex-col h-full hover:-translate-y-1 transition duration-300">
            <img src="${avatar}" alt="Foto de ${d.autor}" class="w-16 h-16 rounded-full mb-4 object-cover border-2 border-yellow-400" />
            <p class="text-gray-700 italic mb-4 flex-grow text-lg">"${d.texto}"</p>
            <span class="font-extrabold text-yellow-600">${d.autor}</span>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Erro ao carregar depoimentos:', error);
  }
}

async function carregarGaleria() {
  try {
    const response = await fetch(`${BASE_API}/fotos`);
    if (response.ok) {
      const fotos = await response.json();
      const grid = document.getElementById('galeriaPets');
      
      if (!grid) return;
      grid.innerHTML = '';

      if (fotos.length === 0) {
        grid.innerHTML = '<p class="text-center col-span-3 text-gray-500">Nenhuma foto na galeria.</p>';
        return;
      }

      fotos.forEach(f => {
        const imagePath = f.caminhoFoto.startsWith('http') ? f.caminhoFoto : `http://localhost:5118/${f.caminhoFoto}`;
        
        grid.innerHTML += `
          <div class="bg-white rounded-3xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
            <img src="${imagePath}" alt="Foto de ${f.nomeCachorro}" class="w-full h-64 object-cover">
            <div class="p-5 text-center bg-yellow-400">
              <h3 class="font-extrabold text-white text-xl drop-shadow-md">${f.nomeCachorro}</h3>
            </div>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Erro ao carregar galeria:', error);
  }
}