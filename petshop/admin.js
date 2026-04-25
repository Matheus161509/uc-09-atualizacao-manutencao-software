const API_URL = 'http://localhost:5031/api'; // Porta pode variar no run local... vou deixar assim mas lembrar que pode estar no swagger, melhor usar relative se os estáticos rodarem pelo ASP.NET Core! 
// ESPERA, o petshop tá rodando pelo app.UseStaticFiles(). Então podemos usar '/api'.
const BASE_API = 'http://localhost:5118/api';

let jwtToken = localStorage.getItem('adminToken');

document.addEventListener('DOMContentLoaded', () => {
    if (jwtToken) {
        showAdminSection();
    }
});

document.getElementById('formLogin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${BASE_API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (res.ok) {
            const data = await res.json();
            jwtToken = data.token;
            localStorage.setItem('adminToken', jwtToken);
            document.getElementById('loginError').classList.add('hidden');
            showAdminSection();
        } else {
            document.getElementById('loginError').classList.remove('hidden');
        }
    } catch(err) {
        alert("Erro ao conectar com API");
    }
});

function logout() {
    localStorage.removeItem('adminToken');
    jwtToken = null;
    document.getElementById('adminSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
}

function showAdminSection() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    showTab('leads');
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    if(tabName === 'leads') loadLeads();
    if(tabName === 'depoimentos') loadDepoimentos();
    if(tabName === 'galeria') loadGaleria();
}

async function fetchAuth(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${jwtToken}`
    };
    const res = await fetch(url, options);
    if(res.status === 401) { logout(); throw new Error("Unauthorized"); }
    return res;
}

// ========================== LEADS ========================
async function loadLeads() {
    const res = await fetchAuth(`${BASE_API}/leads`);
    const leads = await res.json();
    const tbody = document.getElementById('leadsTableBody');
    tbody.innerHTML = '';
    leads.forEach(l => {
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4">${new Date(l.dataEnvio).toLocaleString()}</td>
                <td class="p-4 font-semibold">${l.nome}</td>
                <td class="p-4">${l.email}</td>
                <td class="p-4 text-gray-600">${l.mensagem}</td>
            </tr>
        `;
    });
}

// ======================= DEPOIMENTOS =====================
async function loadDepoimentos() {
    const res = await fetch(`${BASE_API}/depoimentos`); // public
    const depos = await res.json();
    const grid = document.getElementById('depoimentosGrid');
    grid.innerHTML = '';
    depos.forEach(d => {
        grid.innerHTML += `
            <div class="bg-white p-4 rounded shadow border">
                <div class="flex items-center gap-4 mb-2">
                    <img src="${d.avatarUrl || 'images/default-avatar.png'}" class="w-12 h-12 rounded-full object-cover">
                    <h4 class="font-bold">${d.autor}</h4>
                </div>
                <p class="text-gray-600 italic mb-4">"${d.texto}"</p>
                <div class="flex justify-end gap-2">
                    <button onclick="editDepoimento(${d.id}, '${d.autor}', '${d.texto}', '${d.avatarUrl}')" class="text-blue-500 font-bold hover:underline">Editar</button>
                    <button onclick="deleteDepoimento(${d.id})" class="text-red-500 font-bold hover:underline">Excluir</button>
                </div>
            </div>
        `;
    });
}

function openModalDepoimento() {
    document.getElementById('formSalvarDepoimento').reset();
    document.getElementById('depoimentoId').value = '';
    document.getElementById('modalTitle').innerText = 'Novo Depoimento';
    document.getElementById('modalDepoimento').classList.remove('hidden');
}
function closeModalDepoimento() {
    document.getElementById('modalDepoimento').classList.add('hidden');
}
function editDepoimento(id, autor, texto, avatar) {
    document.getElementById('depoimentoId').value = id;
    document.getElementById('depoimentoAutor').value = autor;
    document.getElementById('depoimentoTexto').value = texto;
    document.getElementById('depoimentoAvatar').value = avatar == 'null' ? '' : avatar;
    document.getElementById('modalTitle').innerText = 'Editar Depoimento';
    document.getElementById('modalDepoimento').classList.remove('hidden');
}
document.getElementById('formSalvarDepoimento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('depoimentoId').value;
    const data = {
        autor: document.getElementById('depoimentoAutor').value,
        texto: document.getElementById('depoimentoTexto').value,
        avatarUrl: document.getElementById('depoimentoAvatar').value
    };
    
    if (id) {
        await fetchAuth(`${BASE_API}/depoimentos/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
    } else {
        await fetchAuth(`${BASE_API}/depoimentos`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
    }
    closeModalDepoimento();
    loadDepoimentos();
});
async function deleteDepoimento(id) {
    if(confirm("Deseja realmente apagar este depoimento?")) {
        await fetchAuth(`${BASE_API}/depoimentos/${id}`, { method: 'DELETE' });
        loadDepoimentos();
    }
}

// ========================= GALERIA =======================
async function loadGaleria() {
    const res = await fetch(`${BASE_API}/fotos`);
    const fotos = await res.json();
    const grid = document.getElementById('galeriaGrid');
    grid.innerHTML = '';
    fotos.forEach(f => {
        // o caminhoFoto vem como uploads/arquivo.jpg e a API serve estáticos, então é só /uploads/arquivo.jpg 
        // ou se front roda da pasta petshop, o wwwroot tá servido na raiz mas a api tá separada?
        // se rodarmos `dotnet run` na api, a raiz tem `uploads/`. Vamos usar `/${f.caminhoFoto}`
        grid.innerHTML += `
            <div class="bg-white rounded overflow-hidden shadow">
                <img src="/${f.caminhoFoto}" class="w-full h-40 object-cover">
                <div class="p-3 flex justify-between items-center">
                    <span class="font-bold">${f.nomeCachorro}</span>
                    <button onclick="deleteFoto(${f.id})" class="text-red-500 font-bold hover:underline mb-1">X</button>
                </div>
            </div>
        `;
    });
}

document.getElementById('formFoto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('fotoNome').value;
    const file = document.getElementById('fotoArquivo').files[0];
    
    const formData = new FormData();
    formData.append('NomeCachorro', nome);
    formData.append('Arquivo', file);

    await fetchAuth(`${BASE_API}/fotos/upload`, {
        method: 'POST',
        // não coloca content-type porque fetch faz automaticamente com boundary p/ FormData
        body: formData
    });
    
    document.getElementById('formFoto').reset();
    loadGaleria();
});

async function deleteFoto(id) {
    if(confirm("Deseja deletar essa foto?")) {
        await fetchAuth(`${BASE_API}/fotos/${id}`, { method: 'DELETE' });
        loadGaleria();
    }
}
