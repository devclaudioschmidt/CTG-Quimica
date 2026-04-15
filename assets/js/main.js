// ==========================================
// CONFIGURAÇÃO DO MENU - Edite aqui!
// ==========================================
const menuConfig = {
    items: [
        {
            name: "Página Inicial",
            href: "index.html",
            active: true,
            submenu: [
                { name: "Serviços", href: "index.html#servicos" },
                { name: "Novidades", href: "index.html#novidades" },
                { name: "Cases", href: "index.html#cases" },
                { name: "Blog", href: "index.html#blog" }
            ]
        },
        {
            name: "Sobre",
            href: "empresa.html",
            submenu: [
                { name: "Nossa História", href: "empresa.html#nossa-historia" },
                { name: "Missão e Visão", href: "empresa.html#missao" },
                { name: "Equipe", href: "empresa.html#equipe" },
                { name: "Certificações", href: "empresa.html#certificacoes" }
            ]
        },
        {
            name: "Segmentos",
            href: "#",
            isDropdown: true,
            submenu: [
                {
                    name: "Cadeia de Produção de Proteína Animal",
                    href: "#",
                    isDropdown: true,
                    submenu: [
                        { name: "Avicultura", href: "aviculture.html" },
                        { name: "Suínocultura", href: "suinocultura.html" },
                        { name: "Bovinocultura", href: "bovinocultura.html" },
                        { name: "Aquicultura", href: "aquicultura.html" }
                    ]
                },
                { name: "Insumos", href: "#" },
                { name: "Processamento", href: "#" },
                { name: "Subprodutos", href: "#" },
                { name: "Tratamento de Água e Efluentes", href: "#" },
                { name: "Bem estar animal", href: "#" }
            ]
        },
        {
            name: "Contato",
            href: "#",
            submenu: [
                { name: "Orçamento", href: "#orcamento" },
                { name: "Suporte Técnico", href: "#suporte" },
                { name: "Localização", href: "#localizacao" },
                { name: "Trabalhe Conosco", href: "#trabalhe-conosco" }
            ]
        }
    ]
};

// ==========================================
// FUNÇÃO PARA GERAR O MENU
// ==========================================
function generateMenu(config) {
    const urlAtual = window.location.pathname.split('/').pop() || 'index.html';
    
    function criarItem(item, nivel = 0) {
        const isActive = item.href === urlAtual || (item.href === 'index.html' && urlAtual === '');
        const activeClass = isActive ? ' class="active"' : '';
        const comSubmenuClass = item.submenu ? ' com-submenu' : '';
        
        let html = `<li${comSubmenuClass}>`;
        html += `<a href="${item.href}"${activeClass}>${item.name}</a>`;
        
        if (item.submenu) {
            html += `<ul class="submenu">`;
            item.submenu.forEach(subItem => {
                html += criarItem(subItem, nivel + 1);
            });
            html += `</ul>`;
        }
        
        html += `</li>`;
        return html;
    }
    
    let menuHTML = '<ul class="menu-navegacao" data-menu>';
    config.items.forEach(item => {
        menuHTML += criarItem(item);
    });
    menuHTML += '</ul>';
    
    return menuHTML;
}

function renderMenu() {
    const menuContainer = document.querySelector('.menu-navegacao[data-menu]');
    if (menuContainer) {
        menuContainer.innerHTML = generateMenu(menuConfig);
    }
}

// Função para carregar componentes HTML de forma assíncrona
async function loadComponent(elementId, filePath) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) {
        console.error(`[CTG] Placeholder ${elementId} não encontrado`);
        return;
    }

    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            placeholder.innerHTML = html;
            console.log(`[CTG] ${filePath} carregado com sucesso`);
        } else {
            console.error(`[CTG] Erro ao carregar ${filePath}: ${response.status}`);
            placeholder.innerHTML = `<div style="padding: 20px; color: red; text-align: center;">Erro ao carregar componente: ${filePath}</div>`;
        }
    } catch (error) {
        console.error(`[CTG] Erro na requisição para ${filePath}:`, error);
    }
}

        // Alerta amigável para erro de CORS (comum ao abrir via file://)
        if (window.location.protocol === 'file:') {
            console.warn("%c[CTG Química] AVISO DE SEGURANÇA:", "color: orange; font-weight: bold; font-size: 14px;");
            console.warn("Navegadores bloqueiam o carregamento de componentes locais via 'file://'.");
            console.warn("Para ver o menu e o rodapé, por favor abra o projeto usando um servidor local (ex: Live Server no VS Code).");

            placeholder.innerHTML = `
                <div style="background: #fff3e0; color: #e65100; padding: 15px; border-radius: 8px; border: 1px solid #ffe0b2; margin: 10px; font-size: 14px; text-align: center;">
                    <b>Aviso:</b> O menu não pode ser carregado via <i>file://</i> por segurança do navegador.<br>
                    Use o <b>Live Server</b> ou um servidor local para visualizar corretamente.
                </div>`;
        }
    }
}

// Executa o carregamento quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", async () => {
    console.log("[CTG] DOM carregado, iniciando componentes...");

    // Gerar menu automaticamente
    renderMenu();

    // Carregar componentes (se ainda estiverem sendo usados)
    try {
        await loadComponent("espaco-cabecalho", "components/header.html");
        await loadComponent("espaco-rodape", "components/footer.html");
        console.log("[CTG] Todos os componentes carregados com sucesso");

        // Inicializar menu após carregamento
        setTimeout(() => {
            initializeMenu();
        }, 100);

    } catch (error) {
        console.error("[CTG] Erro geral no carregamento de componentes:", error);
    }
});

// Função separada para inicializar o menu
function initializeMenu() {
    console.log("[CTG] Inicializando funcionalidades do menu...");

    const menuToggle = document.querySelector(".icone-menu");
    const mobileMenu = document.querySelector(".menu-navegacao");
    const submenuLinks = document.querySelectorAll(".menu-navegacao li.com-submenu > a");
    const header = document.querySelector(".cabecalho-principal");

    // Lógica para compensar dinamicamente o padding do header no body
    if (header) {
        const updateBodyPadding = () => {
            document.body.style.paddingTop = `${header.offsetHeight}px`;
        };
        
        // Aplica o padding inicial
        updateBodyPadding();
        
        // Observa mudanças de tamanho no header (ex: expansão do menu)
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                updateBodyPadding();
            });
            resizeObserver.observe(header);
        }
        
        // Em caso de redimensionamento da tela
        window.addEventListener("resize", updateBodyPadding);
    }

    function toggleMobileMenu() {
        if (!mobileMenu || !menuToggle) return;
        const isOpen = mobileMenu.classList.toggle("open");
        menuToggle.classList.toggle("open", isOpen);
        menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
        document.body.classList.toggle("menu-aberto", isOpen);
    }

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", toggleMobileMenu);
    }

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

    // Efeito de "encolhimento" do header ao fazer scroll
    window.addEventListener("scroll", () => {
        if (header) {
            if (window.scrollY > 60) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
    });

    // Reset menu on resize
    window.addEventListener("resize", () => {
        if (window.innerWidth > 991 && mobileMenu) {
            mobileMenu.classList.remove("open");
            document.body.classList.remove("menu-aberto");
            menuToggle?.classList.remove("open");
            menuToggle?.setAttribute("aria-expanded", "false");
            document.querySelectorAll(".menu-navegacao li.open").forEach((item) => item.classList.remove("open"));
        }
    });

    console.log("[CTG] Menu inicializado");
}