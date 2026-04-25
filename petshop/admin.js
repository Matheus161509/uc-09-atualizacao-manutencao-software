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
    try {
        const res = await fetchAuth(`${BASE_API}/leads`);
        const leads = await res.json();
        const tbody = document.getElementById('leadsTableBody');
        tbody.innerHTML = '';
        
        if(leads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-gray-500">Nenhuma mensagem recebida ainda.</td></tr>';
            return;
        }

        leads.forEach(l => {
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 transition">
                    <td class="p-4 text-sm text-gray-500 whitespace-nowrap">${new Date(l.dataEnvio).toLocaleString('pt-BR')}</td>
                    <td class="p-4 font-bold text-gray-800">${l.nome}</td>
                    <td class="p-4 text-blue-600"><a href="mailto:${l.email}">${l.email}</a></td>
                    <td class="p-4 text-gray-600 break-words max-w-xs">${l.mensagem}</td>
                </tr>
            `;
        });
    } catch(e) { console.error(e); }
}

// ======================= DEPOIMENTOS =====================
async function loadDepoimentos() {
    try {
        const res = await fetch(`${BASE_API}/depoimentos`); // public
        const depos = await res.json();
        const grid = document.getElementById('depoimentosGrid');
        grid.innerHTML = '';
        
        if(depos.length === 0) {
            grid.innerHTML = '<p class="text-gray-500 col-span-3">Nenhum depoimento cadastrado.</p>';
        }

        depos.forEach(d => {
            grid.innerHTML += `
                <div class="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col h-full">
                    <div class="flex items-center gap-4 mb-4">
                        <img src="${d.avatarUrl && d.avatarUrl !== 'null' ? d.avatarUrl : 'images/logo.png'}" class="w-12 h-12 rounded-full object-cover border border-gray-200">
                        <h4 class="font-bold text-lg text-gray-800">${d.autor}</h4>
                    </div>
                    <p class="text-gray-600 italic mb-6 flex-grow">"${d.texto}"</p>
                    <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onclick="editDepoimento(${d.id}, '${d.autor}', '${d.texto}', '${d.avatarUrl}')" class="text-blue-500 font-bold hover:text-blue-700 transition">Editar</button>
                        <button onclick="deleteDepoimento(${d.id})" class="text-red-500 font-bold hover:text-red-700 transition">Excluir</button>
                    </div>
                </div>
            `;
        });
    } catch(e) { console.error(e); }
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
document.getElementById('formSalvarDepoimento')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('depoimentoId').value;
    const data = {
        autor: document.getElementById('depoimentoAutor').value,
        texto: document.getElementById('depoimentoTexto').value,
        avatarUrl: document.getElementById('depoimentoAvatar').value
    };
    
    try {
        if (id) {
            await fetchAuth(`${BASE_API}/depoimentos/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
        } else {
            await fetchAuth(`${BASE_API}/depoimentos`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
        }
        closeModalDepoimento();
        loadDepoimentos();
    } catch(err) {
        alert("Erro ao salvar depoimento!");
    }
});
async function deleteDepoimento(id) {
    if(confirm("Deseja realmente apagar este depoimento?")) {
        try {
            await fetchAuth(`${BASE_API}/depoimentos/${id}`, { method: 'DELETE' });
            loadDepoimentos();
        } catch(e) { alert("Erro ao apagar"); }
    }
}

// ========================= GALERIA =======================
async function loadGaleria() {
    try {
        const res = await fetch(`${BASE_API}/fotos`);
        const fotos = await res.json();
        const grid = document.getElementById('galeriaGrid');
        grid.innerHTML = '';
        
        if(fotos.length === 0) {
            grid.innerHTML = '<p class="text-gray-500 col-span-4">Nenhuma foto cadastrada.</p>';
        }

        fotos.forEach(f => {
            const imagePath = f.caminhoFoto.startsWith('http') ? f.caminhoFoto : `http://localhost:5118/${f.caminhoFoto}`;
            grid.innerHTML += `
                <div class="bg-white rounded-xl overflow-hidden shadow border border-gray-100 flex flex-col relative group">
                    <img src="${imagePath}" class="w-full h-48 object-cover">
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="deleteFoto(${f.id})" class="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 shadow">Excluir</button>
                    </div>
                    <div class="p-4 text-center">
                        <span class="font-bold text-gray-800 text-lg">${f.nomeCachorro}</span>
                    </div>
                </div>
            `;
        });
    } catch(e) { console.error(e); }
}

document.getElementById('formFoto')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    btn.disabled = true;
    btn.innerText = 'Enviando...';

    const nome = document.getElementById('fotoNome').value;
    const file = document.getElementById('fotoArquivo').files[0];
    
    const formData = new FormData();
    formData.append('NomeCachorro', nome);
    formData.append('Arquivo', file);

    try {
        await fetchAuth(`${BASE_API}/fotos/upload`, {
            method: 'POST',
            body: formData
        });
        document.getElementById('formFoto').reset();
        loadGaleria();
    } catch(e) {
        alert("Erro ao fazer upload da foto.");
    } finally {
        btn.disabled = false;
        btn.innerText = 'Upload';
    }
});

async function deleteFoto(id) {
    if(confirm("Deseja deletar essa foto da galeria?")) {
        try {
            await fetchAuth(`${BASE_API}/fotos/${id}`, { method: 'DELETE' });
            loadGaleria();
        } catch(e) { alert("Erro ao apagar a foto."); }
    }
}
