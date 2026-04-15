// Função para calcular o caminho relativo até a raiz do projeto
function getRootPath() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(p => p);
    
    if (segments.length === 0 || segments[segments.length - 1] === '' || 
        segments[segments.length - 1] === 'index.html') {
        return './';
    }
    
    const depth = segments.length - 1;
    return depth > 0 ? '../'.repeat(depth) : './';
}

// Função para carregar componentes HTML de forma assíncrona
async function loadComponent(elementId, filePath) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) {
        console.error(`[CTG] Placeholder ${elementId} não encontrado`);
        return;
    }

    // Usar caminho absoluto desde a raiz do projeto
    const fullPath = '/' + filePath;

    try {
        console.log(`[CTG] Carregando ${fullPath}...`);
        const response = await fetch(fullPath);
        if (response.ok) {
            const html = await response.text();
            placeholder.innerHTML = html;
            console.log(`[CTG] ${fullPath} carregado com sucesso`);
        } else {
            console.error(`[CTG] Erro ao carregar ${fullPath}: ${response.status} ${response.statusText}`);
            placeholder.innerHTML = `<div style="padding: 20px; color: red; text-align: center;">Erro ao carregar componente: ${fullPath}</div>`;
        }
    } catch (error) {
        console.error(`[CTG] Erro na requisição para ${fullPath}:`, error);

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

    // Carregar componentes imediatamente
    try {
        await loadComponent("espaco-cabecalho", "components/header.html");
        await loadComponent("espaco-rodape", "components/footer.html");

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
    const submenuLinks = document.querySelectorAll(".menu-navegacao > ul > li.com-submenu > a");
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