// Função para carregar componentes HTML de forma assíncrona
async function loadComponent(elementId, filePath) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            placeholder.innerHTML = html;
            
            if (elementId === 'header-placeholder') {
                initializeMenu();
            }
        }
    } catch (error) {
        console.error(`[CTG] Erro ao carregar ${filePath}:`, error);
    }
}

// Executa o carregamento quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", async () => {
    console.log("[CTG] Inicializando site...");
    
    // Carrega componentes dinâmicos
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        await loadComponent('header-placeholder', 'components/header.html');
    } else {
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
    
    // Inicializa formulário de contato
    const contactForm = document.querySelector('.form-tech');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitToFormspree(contactForm);
        });
        
        // Scroll suave para o formulário ao clicar em links internos
        document.querySelectorAll('a[href="#formulario-contato"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector('#formulario-contato');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
 });

/**
 * Seleção Dinâmica de Estados e Cidades (API IBGE)
 */
async function initializeLocationSelects() {
    const estadoSelect = document.getElementById('estado');
    const cidadeSelect = document.getElementById('cidade');

    if (!estadoSelect || !cidadeSelect) return;

    try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        const estados = await response.json();

        estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.sigla;
            option.textContent = `${estado.nome} (${estado.sigla})`;
            estadoSelect.appendChild(option);
        });

        estadoSelect.addEventListener('change', async (e) => {
            const uf = e.target.value;
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
    }
}

/**
 * Aplica máscara de telefone (00) 00000-0000
 */
function applyPhoneMask(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d{0,2})/, '($1');
    }
    input.value = value;
}

/**
 * Sistema de Revelação ao Scroll (Intersection Observer)
 */
function initScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elementos com classe reveal (padrão existente)
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
    
    // Elementos de animação da avicultura (scroll)
    const aviculturaElements = document.querySelectorAll(
        '.avicultura-anima-titulo, .avicultura-anima-intro, .avicultura-anima-grid, .avicultura-anima-img, .avicultura-anima-coluna, .avicultura-titulo-secao'
    );
    aviculturaElements.forEach(el => observer.observe(el));
}

/**
 * Envia formulário via Formspree
 */
async function submitToFormspree(form) {
    const formId = 'mojynegb';
    const endpoint = `https://formspree.io/f/${formId}`;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    const feedbackEl = document.getElementById('form-feedback') || createFeedbackElement(form);
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    feedbackEl.className = 'form-feedback';
    feedbackEl.textContent = '';
    feedbackEl.style.display = 'block';
    
    try {
        const formData = new FormData(form);
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            feedbackEl.classList.add('success');
            feedbackEl.textContent = 'Mensagem enviada com sucesso! Retornaremos em breve.';
            form.reset();
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao enviar');
        }
    } catch (error) {
        feedbackEl.classList.add('error');
        feedbackEl.textContent = 'Erro ao enviar. Tente novamente ou ENTRE EM CONTATO VIA WHATSAPP.';
        console.error('[CTG] Erro no formulário:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

function createFeedbackElement(form) {
    const el = document.createElement('div');
    el.id = 'form-feedback';
    el.className = 'form-feedback';
    el.style.marginTop = '20px';
    el.style.padding = '15px 20px';
    el.style.borderRadius = '10px';
    el.style.fontWeight = '600';
    el.style.display = 'none';
    form.appendChild(el);
    return el;
}

/**
 * Inicializa as funcionalidades do menu
 */
function initializeMenu() {
    console.log("[CTG] Configurando interações do menu...");

    const menuToggle = document.querySelector(".icone-menu");
    const mobileMenu = document.querySelector(".menu-navegacao");
    const submenuLinks = document.querySelectorAll(".menu-navegacao li.com-submenu > a");
    const header = document.querySelector(".cabecalho-principal");

    if (!header) return;

    const updateBodyPadding = () => {
        document.body.style.paddingTop = `${header.offsetHeight}px`;
    };
    
    updateBodyPadding();
    
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => updateBodyPadding());
        resizeObserver.observe(header);
    }
    
    window.addEventListener("resize", updateBodyPadding);

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("open");
            menuToggle.classList.toggle("open", isOpen);
            menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
            document.body.classList.toggle("menu-aberto", isOpen);
        });
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

    window.addEventListener("scroll", () => {
        if (window.scrollY > 60) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

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