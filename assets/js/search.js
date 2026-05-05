/**
 * CTG Química - Sistema de Pesquisa
 * 
 * PARA ATUALIZAR OS DADOS DE PESQUISA:
 * 1. Manual: Edite assets/data/search-data.json
 * 2. Automático (futuro): Execute `node generate-search-data.js`
 *    - Script lê todos os .html e gera o JSON automaticamente
 */

// Configuração
const SEARCH_CONFIG = {
    minChars: 2,           // Mínimo de caracteres para pesquisar
    debounceTime: 300,     // Tempo de debounce (ms)
    maxResults: 10,         // Máximo de resultados no dropdown
    dataFile: 'assets/data/search-data.json'
};

// Estado global
let searchData = [];
let isDataLoaded = false;

/**
 * Carrega os dados de pesquisa do JSON
 */
async function loadSearchData() {
    if (isDataLoaded) return searchData;
    
    try {
        const response = await fetch(SEARCH_CONFIG.dataFile);
        if (!response.ok) throw new Error('Erro ao carregar dados');
        searchData = await response.json();
        isDataLoaded = true;
        return searchData;
    } catch (error) {
        console.error('Erro ao carregar search-data.json:', error);
        return [];
    }
}

/**
 * Função de pesquisa
 * @param {string} query - Termo de pesquisa
 * @returns {Array} Resultados filtrados
 */
function search(query) {
    if (!query || query.trim().length < SEARCH_CONFIG.minChars) return [];
    
    const searchTerm = query.toLowerCase().trim();
    
    return searchData.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchTerm);
        const contentMatch = item.content.toLowerCase().includes(searchTerm);
        const keywordMatch = item.keywords.some(kw => 
            kw.toLowerCase().includes(searchTerm)
        );
        const typeMatch = item.type.toLowerCase().includes(searchTerm);
        
        return titleMatch || contentMatch || keywordMatch || typeMatch;
    });
}

/**
 * OPÇÃO A: Redirecionar para página de resultados
 * Usado em: search-option-a.html
 */
async function initSearchOptionA() {
    await loadSearchData();
    
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (!searchInput || !searchBtn) {
        console.error('Elementos de pesquisa não encontrados');
        return;
    }
    
    // Pesquisar ao clicar no botão
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query.length >= SEARCH_CONFIG.minChars) {
            window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
        }
    });
    
    // Pesquisar ao pressionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query.length >= SEARCH_CONFIG.minChars) {
                window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
            }
        }
    });
}

/**
 * OPÇÃO B: Dropdown na mesma página
 * Usado em: search-option-b.html
 */
async function initSearchOptionB() {
    await loadSearchData();
    
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const dropdown = document.getElementById('search-dropdown');
    
    if (!searchInput || !dropdown) {
        console.error('Elementos de pesquisa não encontrados');
        return;
    }
    
    let debounceTimer;
    
    // Criar dropdown se não existir
    if (!dropdown) {
        console.error('Dropdown não encontrado');
        return;
    }
    
    // Função para mostrar resultados no dropdown
    function showDropdown(results, query) {
        if (results.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results">Nenhum resultado encontrado para "${query}"</div>`;
        } else {
            const html = results.slice(0, SEARCH_CONFIG.maxResults).map(item => `
                <a href="${item.page}" class="search-result-item">
                    <div class="search-result-title">${highlightText(item.title, query)}</div>
                    <div class="search-result-type">${item.type}</div>
                    <div class="search-result-content">${highlightText(item.content.substring(0, 100), query)}...</div>
                </a>
            `).join('');
            dropdown.innerHTML = html;
        }
        
        dropdown.classList.add('active');
    }
    
    // Função para esconder dropdown
    function hideDropdown() {
        setTimeout(() => {
            dropdown.classList.remove('active');
        }, 200);
    }
    
    // Debounce na pesquisa
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();
        
        if (query.length < SEARCH_CONFIG.minChars) {
            dropdown.classList.remove('active');
            return;
        }
        
        debounceTimer = setTimeout(() => {
            const results = search(query);
            showDropdown(results, query);
        }, SEARCH_CONFIG.debounceTime);
    });
    
    // Pesquisar ao clicar no botão
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query.length >= SEARCH_CONFIG.minChars) {
                const results = search(query);
                if (results.length > 0) {
                    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

/**
 * Destacar texto pesquisado
 */
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Inicializar página de resultados (search-results.html)
 */
async function initSearchResultsPage() {
    await loadSearchData();
    
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    const resultsContainer = document.getElementById('search-results');
    const queryDisplay = document.getElementById('search-query');
    
    if (!query) {
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p class="search-no-results">Nenhum termo de pesquisa fornecido.</p>';
        }
        return;
    }
    
    if (queryDisplay) {
        queryDisplay.textContent = query;
    }
    
    const results = search(query);
    
    if (resultsContainer) {
        if (results.length === 0) {
            resultsContainer.innerHTML = `<p class="search-no-results">Nenhum resultado encontrado para "<strong>${query}</strong>"</p>
                <p class="search-suggestion">Tente usar palavras-chave diferentes ou verifique a ortografia.</p>`;
        } else {
            const html = `
                <p class="search-results-count">${results.length} resultado(s) encontrado(s) para "<strong>${query}</strong>"</p>
                <div class="search-results-list">
                    ${results.map(item => `
                        <a href="${item.page}" class="search-result-card">
                            <div class="search-result-card-type">${item.type}</div>
                            <h3 class="search-result-card-title">${highlightText(item.title, query)}</h3>
                            <p class="search-result-card-content">${highlightText(item.content.substring(0, 150), query)}...</p>
                            <span class="search-result-card-page">Ir para: ${item.page}</span>
                        </a>
                    `).join('')}
                </div>
            `;
            resultsContainer.innerHTML = html;
        }
    }
}

// Auto-inicializar baseado na página atual
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname;
    
    if (page.includes('search-option-a.html')) {
        initSearchOptionA();
    } else if (page.includes('search-option-b.html')) {
        initSearchOptionB();
    } else if (page.includes('search-results.html')) {
        initSearchResultsPage();
    } else if (page.includes('index.html') || page.endsWith('/')) {
        // Ativar pesquisa na página principal (usar Opção B como padrão)
        loadSearchData().then(() => {
            // Adicionar eventos à barra de pesquisa existente
            const searchInput = document.querySelector('.busca-destaque input');
            const searchBtn = document.querySelector('.busca-destaque button');
            
            if (searchInput && searchBtn) {
                // Criar dropdown se não existir
                let dropdown = document.getElementById('search-dropdown');
                if (!dropdown) {
                    dropdown = document.createElement('div');
                    dropdown.id = 'search-dropdown';
                    dropdown.className = 'search-dropdown';
                    searchInput.parentElement.appendChild(dropdown);
                }
                
                // Usar lógica da Opção B
                let debounceTimer;
                
                searchInput.addEventListener('input', () => {
                    clearTimeout(debounceTimer);
                    const query = searchInput.value.trim();
                    
                    if (query.length < SEARCH_CONFIG.minChars) {
                        dropdown.classList.remove('active');
                        return;
                    }
                    
                    debounceTimer = setTimeout(() => {
                        const results = search(query);
                        
                        if (results.length === 0) {
                            dropdown.innerHTML = `<div class="search-no-results">Nenhum resultado para "${query}"</div>`;
                        } else {
                            const html = results.slice(0, SEARCH_CONFIG.maxResults).map(item => `
                                <a href="${item.page}" class="search-result-item">
                                    <div class="search-result-title">${highlightText(item.title, query)}</div>
                                    <div class="search-result-type">${item.type} - ${item.page}</div>
                                </a>
                            `).join('');
                            dropdown.innerHTML = html;
                        }
                        
                        dropdown.classList.add('active');
                    }, SEARCH_CONFIG.debounceTime);
                });
                
                searchBtn.addEventListener('click', () => {
                    const query = searchInput.value.trim();
                    if (query.length >= SEARCH_CONFIG.minChars) {
                        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                    }
                });
                
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const query = searchInput.value.trim();
                        if (query.length >= SEARCH_CONFIG.minChars) {
                            window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                        }
                    }
                });
                
                document.addEventListener('click', (e) => {
                    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.classList.remove('active');
                    }
                });
            }
        });
    }
});
