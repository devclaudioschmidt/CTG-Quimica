// Função para carregar componentes HTML de forma assíncrona
async function loadComponent(elementId, filePath) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) {
        // Silenciosamente ignora se o placeholder não existir na página atual
        return;
    }

    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            placeholder.innerHTML = html;
            console.log(`[CTG] ${filePath} carregado com sucesso em #${elementId}`);
            
            // Se for o header, precisamos reinicializar os eventos do menu
            if (elementId === 'header-placeholder') {
                initializeMenu();
            }
        } else {
            console.error(`[CTG] Erro ao carregar ${filePath}: ${response.status}`);
            if (window.location.protocol === 'file:') {
                placeholder.innerHTML = `
                    <div style="background: #fff3e0; color: #e65100; padding: 15px; border-radius: 8px; border: 1px solid #ffe0b2; margin: 10px; font-size: 14px; text-align: center;">
                        <b>Aviso:</b> O navegador bloqueou o carregamento dinâmico via <i>file://</i>.<br>
                        Use o <b>Live Server</b> para visualizar o menu e rodapé.
                    </div>`;
            }
        }
    } catch (error) {
        console.error(`[CTG] Erro na requisição para ${filePath}:`, error);
    }
}

// Executa o carregamento quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", async () => {
    console.log("[CTG] Inicializando site...");
    
    // Carrega componentes dinâmicos (se os placeholders existirem)
    // Se o header já estiver inline no HTML, o initializeMenu será chamado diretamente
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        await loadComponent('header-placeholder', 'components/header.html');
    } else {
        // Se o header já estiver no HTML de forma estática
        initializeMenu();
    }

    if (footerPlaceholder) {
        await loadComponent('footer-placeholder', 'components/footer.html');
    }

    // Inicializa animações ao scroll (Intersection Observer)
    initScrollReveal();

    // Inicializa máscara de telefone
    const phoneInput = document.getElementById('telefone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => applyPhoneMask(e.target));
    }

    // Inicializa seleção dinâmica de Localização (IBGE)
    initializeLocationSelects();
});

/**
 * Seleção Dinâmica de Estados e Cidades (API IBGE)
 */
async function initializeLocationSelects() {
    const estadoSelect = document.getElementById('estado');
    const cidadeSelect = document.getElementById('cidade');

    if (!estadoSelect || !cidadeSelect) return;

    try {
        // 1. Carregar Estados
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        const estados = await response.json();

        estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.sigla;
            option.textContent = `${estado.nome} (${estado.sigla})`;
            estadoSelect.appendChild(option);
        });

        // 2. Evento ao mudar Estado
        estadoSelect.addEventListener('change', async (e) => {
            const uf = e.target.value;
            
            // Limpa e desabilita cidades
            cidadeSelect.innerHTML = '<option value="">Carregando cidades...</option>';
            cidadeSelect.disabled = true;

            if (!uf) {
                cidadeSelect.innerHTML = '<option value="">Selecione o Estado primeiro</option>';
                return;
            }

            try {
                const cityResponse = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
                const cidades = await cityResponse.json();

                cidadeSelect.innerHTML = '<option value="">Selecione a Cidade</option>';
                cidades.forEach(cidade => {
                    const option = document.createElement('option');
                    option.value = cidade.nome;
                    option.textContent = cidade.nome;
                    cidadeSelect.appendChild(option);
                });
                cidadeSelect.disabled = false;
            } catch (error) {
                console.error("[CTG] Erro ao carregar cidades:", error);
                cidadeSelect.innerHTML = '<option value="">Erro ao carregar cidades</option>';
            }
        });

    } catch (error) {
        console.error("[CTG] Erro ao carregar estados:", error);
        // Fallback: se a API falhar, poderíamos reverter para input de texto aqui se necessário
    }
}

/**
 * Aplica máscara de telefone (00) 00000-0000
 */
function applyPhoneMask(input) {
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos

    if (value.length > 10) {
        // Formato Celular: (00) 00000-0000
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
        // Formato Intermediário: (00) 0000-0000
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        // Formato Intermediário: (00) 0000
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (value.length > 0) {
        // Formato Inicial: (00
        value = value.replace(/^(\d{0,2})/, '($1');
    }

    input.value = value;
}

function initScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
}

// Função para inicializar as funcionalidades do menu
function initializeMenu() {
    console.log("[CTG] Configurando interações do menu...");

    const menuToggle = document.querySelector(".icone-menu");
    const mobileMenu = document.querySelector(".menu-navegacao");
    const submenuLinks = document.querySelectorAll(".menu-navegacao li.com-submenu > a");
    const header = document.querySelector(".cabecalho-principal");

    if (!header) return;

    // Lógica para compensar dinamicamente o padding do header no body
    const updateBodyPadding = () => {
        document.body.style.paddingTop = `${header.offsetHeight}px`;
    };
    
    updateBodyPadding();
    
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => updateBodyPadding());
        resizeObserver.observe(header);
    }
    
    window.addEventListener("resize", updateBodyPadding);

    // Toggle Menu Mobile
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("open");
            menuToggle.classList.toggle("open", isOpen);
            menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
            document.body.classList.toggle("menu-aberto", isOpen);
        });
    }

    // Submenus no Mobile
    submenuLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            if (window.innerWidth <= 991) {
                const parentItem = link.parentElement;
                if (parentItem && parentItem.classList.contains("com-submenu")) {
                    event.preventDefault();
                    parentItem.classList.toggle("open");
                }
            }
        });
    });

    // Efeito Scrolled
    window.addEventListener("scroll", () => {
        if (window.scrollY > 60) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // Reset ao redimensionar
    window.addEventListener("resize", () => {
        if (window.innerWidth > 991 && mobileMenu) {
            mobileMenu.classList.remove("open");
            document.body.classList.remove("menu-aberto");
            menuToggle?.classList.remove("open");
            menuToggle?.setAttribute("aria-expanded", "false");
            document.querySelectorAll(".menu-navegacao li.open").forEach((item) => item.classList.remove("open"));
        }
    });
}