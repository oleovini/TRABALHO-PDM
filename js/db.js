import { openDB } from "idb";

let db;
async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('anotacao', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    document.getElementById('btnCadastro').addEventListener('click', adicionarAnotacao);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasAnotacoes);
});

async function buscarTodasAnotacoes(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('anotacao', 'readonly');
    const store = await tx.objectStore('anotacao');
    const anotacoes = await store.getAll();
    if(anotacoes){
        const divLista = anotacoes.map(anotacao => {
            return ` <div class="item">

                            <style>
                            /* CSS para o card */
                            .item {
                                background-color: #673ab7; /* Cor de fundo do card (roxo) */
                                color: white; /* Cor do texto no card (branco) */
                                padding: 10px; /* Espaçamento interno do card */
                                border-radius: 5px; /* Borda arredondada */
                                margin-bottom: 10px; /* Espaçamento inferior entre os cards */
                            }
                            
                            /* Estilo para os nomes */
                            .categoria::before,
                            .titulo::before,
                            .data::before,
                            .descricao::before {
                                content: attr(data-label); /* Define o conteúdo do ::before com o valor do atributo data-label */
                                font-weight: bold; /* Texto em negrito */
                                color: white; /* Cor do texto dos nomes (branco) */
                                margin-right: 5px; /* Espaçamento à direita dos nomes */
                            }
                            
                            /* Estilo para os dados */
                            .categoria,
                            .titulo,
                            .data,
                            .descricao {
                                color: white; /* Cor do texto dos dados (branco) */
                                font-weight: normal; /* Texto não em negrito */
                            }
                            
                            </style>
                            <p class="categoria" data-label=Categoria:> ${anotacao.categoria}</p>
                            <p class="titulo" data-label=Título:> ${anotacao.titulo}</p>
                            <p class="data" data-label=Data:> ${anotacao.data}</p>
                            <p class="descricao" data-label=Descrição:> ${anotacao.descricao}</p>
                     </div>`;
        });
        listagem(divLista.join(' '));
    }
}

async function adicionarAnotacao() {
    let titulo = document.getElementById("titulo").value;
    let categoria = document.getElementById("categoria").value;
    let descricao = document.getElementById("descricao").value;
    let data = document.getElementById("data").value;
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');
    try {
        await store.add({ titulo: titulo, categoria: categoria, descricao: descricao, data: data });
        await tx.done;
        limparCampos();
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}

async function apagarTodosRegistros() {
    if (db == undefined) {
        console.log("O banco de dados está fechado.");
        return;
    }
    
    const tx = await db.transaction('anotacao', 'readwrite');
    const store = tx.objectStore('anotacao');
    
    try {
        await store.clear();
        await tx.done;
        console.log('Todos os registros foram apagados com sucesso!');
        limparCampos();
        document.getElementById('resultados').innerHTML = '';
    } catch (error) {
        console.error('Erro ao apagar registros:', error);
        tx.abort();
    }
}


async function buscarAnotacaoPorTitulo(titulo) {
    if (db == undefined) {
        console.log("O banco de dados está fechado.");
        return;
    }
    
    const tx = await db.transaction('anotacao', 'readonly');
    const store = tx.objectStore('anotacao');
    
    try {
        const anotacao = await store.get(titulo);
        
        if (anotacao) {
            console.log('Anotação encontrada:', anotacao);
            // Faça o que quiser com a anotação encontrada
        } else {
            console.log('Anotação com título ' + titulo + ' não encontrada.');
        }
    } catch (error) {
        console.error('Erro ao buscar anotação:', error);
    } finally {
        tx.abort(); // Certifique-se de encerrar a transação
    }
}

// Evento de clique no botão de pesquisa
document.getElementById('btnPesquisar').addEventListener('click', function() {
    const tituloPesquisa = document.getElementById('barraPesquisa').value;
    
    if (tituloPesquisa.trim() !== '') {
        // Chame a função de busca com o título inserido
        buscarAnotacaoPorTitulo(tituloPesquisa);
    } else {
        console.log('Por favor, insira um título válido na barra de pesquisa.');
    }
});

function limparCampos() {
    document.getElementById("titulo").value = '';
    document.getElementById("categoria").value = '';
    document.getElementById("descricao").value = '';
    document.getElementById("data").value = '';
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}

document.getElementById('btnApagar').addEventListener('click', apagarTodosRegistros);


