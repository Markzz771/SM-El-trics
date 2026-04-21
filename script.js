/*
╔══════════════════════════════════════════════════════════════╗
║   SM ELÉTRICS — script.js                                   ║
║   JavaScript principal do site                              ║
║   Versão 2.1 | 2026 — Com melhorias de segurança            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   # ÍNDICE DE BLOCOS:                                       ║
║   ──────────────────────────────────────────────            ║
║   BLOCO 0:  SEGURANÇA              → Funções de proteção    ║
║   BLOCO 1:  CONFIGURAÇÃO INICIAL   → DOMContentLoaded       ║
║   BLOCO 2:  HEADER                 → Scroll + nav ativo     ║
║   BLOCO 3:  MENU MOBILE            → Hamburguer toggle      ║
║   BLOCO 4:  SCROLL SUAVE           → Âncoras internas       ║
║   BLOCO 5:  REVEAL                 → Animações no scroll    ║
║   BLOCO 6:  CONTADOR               → Números animados       ║
║   BLOCO 7:  FORMULÁRIO             → Validação + envio      ║
║   BLOCO 8:  BOTÃO TOPO             → Voltar ao início       ║
║   BLOCO 9:  ANO DINÂMICO           → Footer copyright       ║
║   BLOCO 10: 3D LAMBORGHINI         → Three.js Huracán       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
*/


/* ============================================================
   # BLOCO 0: FUNÇÕES DE SEGURANÇA
   ──────────────────────────────────────────────────────────
   Estas funções são usadas em todo o script para garantir
   que dados do usuário sejam tratados com segurança antes
   de serem processados ou exibidos.
   ============================================================ */

// ── 0.1 SANITIZAÇÃO DE TEXTO (proteção contra XSS) ──────────
// O que é XSS (Cross-Site Scripting)?
// É quando alguém digita código HTML/JavaScript num campo de texto
// na tentativa de executar scripts maliciosos.
// Exemplo de ataque: alguém digita no campo nome:
//   <script>document.location='https://site-malicioso.com'</script>
//
// Esta função substitui os caracteres perigosos por versões
// seguras (entidades HTML), tornando o código inofensivo.
//
// Como usar: sanitizar(textoDoUsuario)
// Retorna: texto sem nenhum caractere HTML especial ativo
function sanitizar(texto) {
  // # Se o texto estiver vazio, retorna string vazia
  if (!texto) return '';

  // # Converte cada caractere perigoso para sua versão segura:
  // & → &amp;   (ampersand — base de todas as entidades HTML)
  // < → &lt;    (menor que — abre tags HTML)
  // > → &gt;    (maior que — fecha tags HTML)
  // " → &quot;  (aspas duplas — fecha atributos HTML)
  // ' → &#x27;  (aspas simples — fecha atributos alternativos)
  // / → &#x2F;  (barra — fecha tags de auto-fechamento)
  return String(texto)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ── 0.2 LIMPEZA DE TEXTO (remove espaços e caracteres de controle) ──
// O que faz: Remove espaços no início/fim e caracteres invisíveis
// que poderiam ser usados para contornar validações.
// Exemplo de ataque: "   admin@site.com   " poderia confundir
// validações simples de e-mail.
function limpar(texto) {
  if (!texto) return '';

  // # Trim: remove espaços no início e no fim
  // # Replace: remove caracteres de controle (ASCII 0-31 e 127)
  // Esses caracteres são invisíveis mas podem quebrar parsers
  return String(texto)
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '');
}

// ── 0.3 VALIDAÇÃO DE E-MAIL ROBUSTA ──────────────────────────
// O que faz: Verifica se o e-mail tem um formato válido.
// Vai além do regex simples do bloco 7 original — bloqueia
// e-mails com IPs literais, domínios sem extensão, etc.
//
// Exemplos bloqueados:
//   admin@localhost     (sem extensão de domínio)
//   user@[127.0.0.1]    (IP literal)
//   a@b.c               (TLD muito curto)
function validarEmailRobusto(email) {
  const emailLimpo = limpar(email);

  // # Regex mais completo que verifica:
  // - parte local: letras, números, pontos, hífens, sublinhados, + (1-64 chars)
  // - @
  // - domínio: letras, números, hífens, pontos (máx. 253 chars)
  // - TLD: pelo menos 2 letras (evita "a@b.c")
  const regexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!regexEmail.test(emailLimpo)) return false;

  // # Rejeita domínios suspeitos comuns em spam/bots
  const dominiosBloqueados = ['localhost', 'example.com', 'test.com', 'dummy.com'];
  const dominio = emailLimpo.split('@')[1]?.toLowerCase();
  if (dominiosBloqueados.includes(dominio)) return false;

  return true;
}

// ── 0.4 VALIDAÇÃO DE TELEFONE ─────────────────────────────────
// O que faz: Aceita apenas telefones com 8 a 15 dígitos.
// Remove caracteres de formatação antes de contar.
// Impede injeção de comandos em campo de telefone.
function validarTelefone(tel) {
  if (!tel) return true; // # Campo opcional — vazio é válido

  // # Remove tudo que não for dígito para contar apenas números
  const apenasDigitos = String(tel).replace(/\D/g, '');

  // # Telefones brasileiros têm entre 8 e 11 dígitos
  // Aceita também internacionais (até 15 dígitos — padrão E.164)
  return apenasDigitos.length >= 8 && apenasDigitos.length <= 15;
}

// ── 0.5 LIMITE DE ENVIOS (Rate Limiting no cliente) ──────────
// O que faz: Impede que alguém envie o formulário muitas vezes
// seguidas de forma automatizada.
//
// NOTA IMPORTANTE: Isso é uma proteção BÁSICA do lado do cliente.
// Para proteção real, você precisa também de rate limiting
// no servidor (backend). Esta proteção pode ser contornada
// por bots mais sofisticados, mas bloqueia os mais simples.
//
// Configuração: máximo de 3 envios a cada 10 minutos
const LIMITE_ENVIOS = 3;
const JANELA_TEMPO_MS = 10 * 60 * 1000; // # 10 minutos em milissegundos
const registroEnvios = []; // # Array com os timestamps dos envios recentes

function podEnviar() {
  const agora = Date.now();

  // # Remove registros mais antigos que a janela de tempo
  while (registroEnvios.length > 0 && agora - registroEnvios[0] > JANELA_TEMPO_MS) {
    registroEnvios.shift();
  }

  // # Verifica se ainda está dentro do limite
  return registroEnvios.length < LIMITE_ENVIOS;
}

function registrarEnvio() {
  registroEnvios.push(Date.now());
}


/* ============================================================
   # BLOCO 1: CONFIGURAÇÃO INICIAL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  iniciarHeader();
  iniciarMenuMobile();
  iniciarScrollSuave();
  iniciarReveal();
  iniciarContadores();
  iniciarFormulario();
  iniciarBotaoTopo();
  iniciarAnoDinamico();
  iniciar3DLamborghini();

});


/* ============================================================
   # BLOCO 2: HEADER
   ============================================================ */
function iniciarHeader() {

  const header   = document.getElementById('header');
  const links    = document.querySelectorAll('.header__nav a');
  const secoes   = document.querySelectorAll('section[id]');

  function aoRolar() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let secaoAtual = '';
    secoes.forEach(secao => {
      const topo = secao.offsetTop - 100;
      if (window.scrollY >= topo) {
        secaoAtual = secao.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.remove('ativo');
      if (link.getAttribute('href') === `#${secaoAtual}`) {
        link.classList.add('ativo');
      }
    });
  }

  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
}


/* ============================================================
   # BLOCO 3: MENU MOBILE
   ============================================================ */
function iniciarMenuMobile() {

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const links     = document.querySelectorAll('.mnav-link, .mnav-cta');

  function toggleMenu(force) {
    const estaAberto = force !== undefined
      ? force
      : !hamburger.classList.contains('aberto');

    hamburger.classList.toggle('aberto', estaAberto);
    mobileNav.classList.toggle('aberto', estaAberto);
    hamburger.setAttribute('aria-expanded', estaAberto);
    mobileNav.setAttribute('aria-hidden', !estaAberto);
    document.body.style.overflow = estaAberto ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());
  links.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('click', (evento) => {
    const clicouFora = !mobileNav.contains(evento.target)
                    && !hamburger.contains(evento.target);
    if (mobileNav.classList.contains('aberto') && clicouFora) {
      toggleMenu(false);
    }
  });
}


/* ============================================================
   # BLOCO 4: SCROLL SUAVE
   ============================================================ */
function iniciarScrollSuave() {

  const linksAncora = document.querySelectorAll('a[href^="#"]');
  const header = document.getElementById('header');

  linksAncora.forEach(link => {
    link.addEventListener('click', (evento) => {
      const alvo = document.querySelector(link.getAttribute('href'));
      if (!alvo) return;

      evento.preventDefault();
      const alturaHeader = header ? header.offsetHeight : 0;
      const posicao = alvo.getBoundingClientRect().top
                    + window.scrollY
                    - alturaHeader;

      window.scrollTo({ top: posicao, behavior: 'smooth' });
    });
  });
}


/* ============================================================
   # BLOCO 5: REVEAL — Animar elementos ao entrar na tela
   ============================================================ */
function iniciarReveal() {

  const elementos = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;

      const irmaos = entrada.target.parentElement.querySelectorAll('.reveal');
      let delay = 0;

      irmaos.forEach((irmao, indice) => {
        if (irmao === entrada.target) {
          delay = indice * 85;
        }
      });

      setTimeout(() => {
        entrada.target.classList.add('visivel');
      }, delay);

      observer.unobserve(entrada.target);
    });

  }, { threshold: 0.12 });

  elementos.forEach(el => observer.observe(el));
}


/* ============================================================
   # BLOCO 6: CONTADOR ANIMADO
   ============================================================ */
function iniciarContadores() {

  const numeros = document.querySelectorAll('.stat__num');

  function animarContador(elemento) {
    const alvo     = parseInt(elemento.getAttribute('data-target'), 10);
    const duracao  = 1800;
    const inicio   = performance.now();

    function atualizar(timestamp) {
      const decorrido  = timestamp - inicio;
      const progresso  = Math.min(decorrido / duracao, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3);

      elemento.textContent = Math.floor(suavizado * alvo);

      if (progresso < 1) {
        requestAnimationFrame(atualizar);
      } else {
        elemento.textContent = alvo;
      }
    }

    requestAnimationFrame(atualizar);
  }

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        animarContador(entrada.target);
        observer.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.5 });

  numeros.forEach(num => observer.observe(num));
}


/* ============================================================
   # BLOCO 7: FORMULÁRIO DE CONTATO
   ──────────────────────────────────────────────────────────
   Versão 2.1: Adicionadas as seguintes proteções de segurança:
   - Verificação do campo honeypot (armadilha para bots)
   - Sanitização de todos os inputs antes de usar
   - Validação de e-mail mais robusta
   - Validação de telefone
   - Limite de envios (rate limiting básico)
   - Verificação de valores permitidos no select
   ============================================================ */
function iniciarFormulario() {

  const form     = document.getElementById('formContato');
  if (!form) return;

  const feedback = document.getElementById('formFeedback');

  // ── Funções auxiliares de exibição de erro ──

  function exibirErro(campoId, erroId, msg) {
    const campo = document.getElementById(campoId);
    const erro  = document.getElementById(erroId);
    if (!campo || !erro) return;

    campo.style.borderColor = msg ? 'var(--erro)' : '';
    erro.textContent = msg || '';
  }

  // ── Validação de campo (versão segura) ──
  // # SEGURANÇA: Agora usa validações mais robustas do Bloco 0
  function validarCampo(campo) {
    // # Limpa o valor antes de qualquer validação
    const valor = limpar(campo.value);

    if (campo.required && !valor) {
      return 'Este campo é obrigatório.';
    }

    if (campo.type === 'email' && valor) {
      // # SEGURANÇA: Usa validação robusta em vez do regex simples
      if (!validarEmailRobusto(valor)) {
        return 'Informe um endereço de e-mail válido.';
      }
    }

    if (campo.type === 'tel' && valor) {
      // # SEGURANÇA: Valida formato do telefone
      if (!validarTelefone(valor)) {
        return 'Informe um telefone válido (somente números).';
      }
    }

    // # SEGURANÇA: Verifica limite de caracteres (redundante com maxlength, mas mais seguro)
    const limite = parseInt(campo.getAttribute('maxlength'), 10);
    if (limite && valor.length > limite) {
      return `Máximo de ${limite} caracteres.`;
    }

    return '';
  }

  // ── Validação em tempo real ──
  form.querySelectorAll('input, textarea').forEach(campo => {
    campo.addEventListener('blur', () => {
      const erroId = `erro${campo.id.charAt(0).toUpperCase()}${campo.id.slice(1)}`;
      exibirErro(campo.id, erroId, validarCampo(campo));
    });

    campo.addEventListener('input', () => {
      const erroId = `erro${campo.id.charAt(0).toUpperCase()}${campo.id.slice(1)}`;
      if (campo.value.trim()) exibirErro(campo.id, erroId, '');
    });
  });

  // ── Envio do formulário ──
  form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    // ── 7.1 VERIFICAÇÃO HONEYPOT ─────────────────────────────
    // # SEGURANÇA: Lê o campo oculto que só bots preenchem.
    // Se tiver qualquer conteúdo, é quase certamente um bot.
    // Bloqueamos silenciosamente (sem avisar o bot que foi detectado).
    const campoHoneypot = document.getElementById('website');
    if (campoHoneypot && campoHoneypot.value.trim() !== '') {
      // # Bot detectado — simula sucesso para não alertar o bot
      // mas NÃO faz nada de verdade
      console.warn('SM Elétrics Security: envio de bot bloqueado (honeypot).');
      form.reset();
      return;
    }

    // ── 7.2 RATE LIMITING ─────────────────────────────────────
    // # SEGURANÇA: Verifica se o usuário não está enviando
    // muitas mensagens em pouco tempo.
    if (!podEnviar()) {
      feedback.textContent = '⚠️ Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
      feedback.className   = 'form__feedback erro-geral';
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // ── 7.3 VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS ────────────────
    const camposObrig = [
      { id: 'nome',     erroId: 'erroNome'     },
      { id: 'email',    erroId: 'erroEmail'    },
      { id: 'mensagem', erroId: 'erroMensagem' },
    ];

    let formularioValido = true;

    camposObrig.forEach(({ id, erroId }) => {
      const campo = document.getElementById(id);
      const msg   = validarCampo(campo);
      exibirErro(id, erroId, msg);
      if (msg) formularioValido = false;
    });

    if (!formularioValido) return;

    // ── 7.4 PREPARAÇÃO DOS DADOS (com sanitização) ───────────
    const botao = form.querySelector('.form__submit');
    const textoOriginal = botao.innerHTML;

    botao.disabled = true;
    botao.innerHTML = '<i class="ri-loader-4-line"></i> Abrindo WhatsApp…';

    // # SEGURANÇA: Sanitiza TODOS os valores antes de usar.
    // Mesmo que o usuário tente enviar código, ele será neutralizado.
    const nome     = sanitizar(limpar(document.getElementById('nome').value));
    const email    = sanitizar(limpar(document.getElementById('email').value));
    const telefone = sanitizar(limpar(document.getElementById('telefone').value));
    const mensagem = sanitizar(limpar(document.getElementById('mensagem').value));

    // # SEGURANÇA: Valida o valor do select contra uma lista
    // de valores permitidos (whitelist). Isso impede que alguém
    // modifique o HTML e injete um valor inesperado.
    const valoresPermitidos = ['', 'som', 'eletronico', 'bateria', 'farois', 'outro'];
    const servicoRaw = document.getElementById('servico').value;
    const servico = valoresPermitidos.includes(servicoRaw) ? servicoRaw : '';

    const nomesServico = {
      'som':        'Instalacao de Som Automotivo',
      'eletronico': 'Servicos Eletronicos Basicos',
      'bateria':    'Troca de Bateria',
      'farois':     'Polimento de Farois',
      'outro':      'Outro / Consulta Geral',
    };
    const servicoFormatado = nomesServico[servico] || '';

    // # SEGURANÇA: Registra o envio (para o rate limiting)
    registrarEnvio();

    const textoWhatsApp = encodeURIComponent(
      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      '     SM ELETRICS\n' +
      '  Nova Solicitacao de Servico\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n\n' +

      'Ola! Vim pelo site da SM Eletrics\n' +
      'e gostaria de solicitar um servico.\n\n' +

      '[ DADOS DO CLIENTE ]\n' +
      '------------------------------\n' +
      'Nome:     ' + nome + '\n' +
      'E-mail:   ' + email + '\n' +
      (telefone ? 'Telefone: ' + telefone + '\n' : '') +

      '\n[ SERVICO SOLICITADO ]\n' +
      '------------------------------\n' +
      (servicoFormatado ? servicoFormatado + '\n' : 'Nao informado\n') +

      '\n[ MENSAGEM DO CLIENTE ]\n' +
      '------------------------------\n' +
      mensagem + '\n\n' +

      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Aguardo o retorno. Obrigado!'
    );

    const numeroEmpresa = '5517996746002';

    feedback.textContent = '✅ Redirecionando para o WhatsApp…';
    feedback.className   = 'form__feedback sucesso';
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
      botao.disabled  = false;
      botao.innerHTML = textoOriginal;

      window.open('https://wa.me/' + numeroEmpresa + '?text=' + textoWhatsApp, '_blank', 'noopener,noreferrer');

      form.reset();

      setTimeout(() => {
        feedback.className   = 'form__feedback';
        feedback.textContent = '';
      }, 5000);

    }, 1000);
  });
}


/* ============================================================
   # BLOCO 8: BOTÃO VOLTAR AO TOPO
   ============================================================ */
function iniciarBotaoTopo() {

  const botao = document.getElementById('topoBtn');
  if (!botao) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      botao.classList.add('visivel');
    } else {
      botao.classList.remove('visivel');
    }
  }, { passive: true });

  botao.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
   # BLOCO 9: ANO DINÂMICO NO FOOTER
   ============================================================ */
function iniciarAnoDinamico() {
  const span = document.getElementById('anoAtual');
  if (span) {
    span.textContent = new Date().getFullYear();
  }
}


/* ============================================================
   # BLOCO 10: 3D LAMBORGHINI HURACÁN — Three.js
   (Código original preservado integralmente — sem alterações)
   ============================================================ */
function iniciar3DLamborghini() {

  if (typeof THREE === 'undefined') {
    console.warn('SM Elétrics 3D: Three.js não encontrado. Verifique a tag <script> no HTML.');
    return;
  }

  const canvas = document.getElementById('lambo-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha:     true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  const cena = new THREE.Scene();
  cena.fog = new THREE.FogExp2(0x000000, 0.028);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 150);
  camera.position.set(0, 2.2, 9);

  function redimensionar() {
    const w = canvas.parentElement?.offsetWidth  || window.innerWidth;
    const h = canvas.parentElement?.offsetHeight || window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  redimensionar();
  window.addEventListener('resize', redimensionar);

  const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.18);
  cena.add(luzAmbiente);

  const luzDouradaPrincipal = new THREE.PointLight(0xD4A017, 5, 25);
  luzDouradaPrincipal.position.set(5, 4, 5);
  luzDouradaPrincipal.castShadow = true;
  cena.add(luzDouradaPrincipal);

  const luzRim = new THREE.PointLight(0xffffff, 2.5, 18);
  luzRim.position.set(-5, 3, -2);
  cena.add(luzRim);

  const luzTraseira = new THREE.PointLight(0xD4A017, 2, 14);
  luzTraseira.position.set(-1, 0.5, -5);
  cena.add(luzTraseira);

  const luzSpot = new THREE.SpotLight(0xffffff, 3, 20, Math.PI / 6, 0.3);
  luzSpot.position.set(0, 10, 2);
  luzSpot.target.position.set(0, 0, 0);
  luzSpot.castShadow = true;
  cena.add(luzSpot);
  cena.add(luzSpot.target);

  const geoChao = new THREE.PlaneGeometry(30, 30);
  const matChao = new THREE.MeshStandardMaterial({
    color:     0x050505,
    metalness: 0.85,
    roughness: 0.25,
  });
  const chao = new THREE.Mesh(geoChao, matChao);
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = -1.3;
  chao.receiveShadow = true;
  cena.add(chao);

  const matDourado = new THREE.MeshStandardMaterial({ color: 0xD4A017, metalness: 0.96, roughness: 0.04 });
  const matDouradoEscuro = new THREE.MeshStandardMaterial({ color: 0x8A6010, metalness: 0.9, roughness: 0.1 });
  const matPretoFosco = new THREE.MeshStandardMaterial({ color: 0x0A0A0A, metalness: 0.1, roughness: 0.9 });
  const matCromo = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 1.0, roughness: 0.02 });
  const matVidro = new THREE.MeshStandardMaterial({ color: 0x4488BB, metalness: 0.05, roughness: 0.0, transparent: true, opacity: 0.28 });
  const matVermelho = new THREE.MeshStandardMaterial({ color: 0xFF1500, emissive: 0xFF0800, emissiveIntensity: 2.5 });
  const matFarol = new THREE.MeshStandardMaterial({ color: 0xFFFFCC, emissive: 0xFFFFAA, emissiveIntensity: 3 });
  const matCarbono = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.6, roughness: 0.5 });

  const grupoCarro = new THREE.Group();

  const geoBase = new THREE.BoxGeometry(4.8, 0.5, 2.0);
  const base = new THREE.Mesh(geoBase, matDourado);
  base.position.y = 0.1;
  base.castShadow = true;
  grupoCarro.add(base);

  [-1.08, 1.08].forEach(z => {
    const geoSaia = new THREE.BoxGeometry(4.6, 0.22, 0.12);
    const saia = new THREE.Mesh(geoSaia, matDouradoEscuro);
    saia.position.set(0, -0.14, z);
    grupoCarro.add(saia);
  });

  const geoCapoDiant = new THREE.BoxGeometry(1.4, 0.28, 1.9);
  const capoDiant = new THREE.Mesh(geoCapoDiant, matDourado);
  capoDiant.position.set(1.85, 0.3, 0);
  capoDiant.rotation.z = -0.22;
  grupoCarro.add(capoDiant);

  const geoCorpo = new THREE.BoxGeometry(2.2, 0.52, 1.95);
  const corpo = new THREE.Mesh(geoCorpo, matDourado);
  corpo.position.set(0.1, 0.48, 0);
  grupoCarro.add(corpo);

  const geoCabine = new THREE.BoxGeometry(1.9, 0.48, 1.75);
  const cabine = new THREE.Mesh(geoCabine, matDourado);
  cabine.position.set(-0.1, 0.86, 0);
  grupoCarro.add(cabine);

  const geoTeto = new THREE.BoxGeometry(1.3, 0.1, 1.6);
  const teto = new THREE.Mesh(geoTeto, matDouradoEscuro);
  teto.position.set(-0.15, 1.1, 0);
  grupoCarro.add(teto);

  const geoParaChoqueDiant = new THREE.BoxGeometry(0.18, 0.35, 1.95);
  const paraChoqueDiant = new THREE.Mesh(geoParaChoqueDiant, matDourado);
  paraChoqueDiant.position.set(2.45, 0.22, 0);
  grupoCarro.add(paraChoqueDiant);

  const geoGrade = new THREE.BoxGeometry(0.08, 0.22, 1.4);
  const grade = new THREE.Mesh(geoGrade, matPretoFosco);
  grade.position.set(2.52, 0.18, 0);
  grupoCarro.add(grade);

  [-0.72, 0.72].forEach(z => {
    const geoIntake = new THREE.BoxGeometry(0.28, 0.2, 0.38);
    const intake = new THREE.Mesh(geoIntake, matPretoFosco);
    intake.position.set(2.2, 0.14, z);
    grupoCarro.add(intake);
  });

  const geoTraseira = new THREE.BoxGeometry(0.22, 0.45, 1.95);
  const traseira = new THREE.Mesh(geoTraseira, matDourado);
  traseira.position.set(-2.35, 0.28, 0);
  grupoCarro.add(traseira);

  const geoDifusor = new THREE.BoxGeometry(0.6, 0.14, 1.8);
  const difusor = new THREE.Mesh(geoDifusor, matCarbono);
  difusor.position.set(-2.45, -0.12, 0);
  grupoCarro.add(difusor);

  const geoParaBrisa = new THREE.BoxGeometry(0.1, 0.52, 1.65);
  const paraBrisa = new THREE.Mesh(geoParaBrisa, matVidro);
  paraBrisa.position.set(0.9, 0.84, 0);
  paraBrisa.rotation.z = -0.65;
  grupoCarro.add(paraBrisa);

  const geoVidroTras = new THREE.BoxGeometry(0.1, 0.5, 1.6);
  const vidroTras = new THREE.Mesh(geoVidroTras, matVidro);
  vidroTras.position.set(-0.95, 0.84, 0);
  vidroTras.rotation.z = 0.62;
  grupoCarro.add(vidroTras);

  [0.4, -0.15].forEach((x) => {
    const geoJanela = new THREE.BoxGeometry(0.52, 0.36, 0.06);
    [-0.89, 0.89].forEach(z => {
      const janela = new THREE.Mesh(geoJanela, matVidro);
      janela.position.set(x, 0.9, z);
      grupoCarro.add(janela);
    });
  });

  const geoTampaMotor = new THREE.BoxGeometry(1.0, 0.06, 1.5);
  const tampaMotor = new THREE.Mesh(geoTampaMotor, matVidro);
  tampaMotor.position.set(-1.5, 0.5, 0);
  grupoCarro.add(tampaMotor);

  const geoMotor = new THREE.BoxGeometry(0.8, 0.35, 1.2);
  const motor = new THREE.Mesh(geoMotor, matCarbono);
  motor.position.set(-1.5, 0.38, 0);
  grupoCarro.add(motor);

  const posicoesRodas = [
    [1.6,  -0.42,  1.1],
    [1.6,  -0.42, -1.1],
    [-1.55, -0.42,  1.1],
    [-1.55, -0.42, -1.1],
  ];

  posicoesRodas.forEach(([x, y, z]) => {
    const grupoRoda = new THREE.Group();

    const geoPneu = new THREE.CylinderGeometry(0.44, 0.44, 0.3, 36);
    const pneu = new THREE.Mesh(geoPneu, matPretoFosco);
    pneu.rotation.x = Math.PI / 2;
    grupoRoda.add(pneu);

    const geoAro = new THREE.CylinderGeometry(0.3, 0.3, 0.32, 24);
    const aro = new THREE.Mesh(geoAro, matCromo);
    aro.rotation.x = Math.PI / 2;
    grupoRoda.add(aro);

    const qtdRaios = 5;
    for (let r = 0; r < qtdRaios; r++) {
      const angulo = (r / qtdRaios) * Math.PI * 2;
      const geoRaio = new THREE.BoxGeometry(0.04, 0.04, 0.56);
      const raio = new THREE.Mesh(geoRaio, matCromo);
      raio.position.set(Math.cos(angulo) * 0.16, Math.sin(angulo) * 0.16, 0);
      raio.rotation.z = angulo;
      raio.rotation.x = Math.PI / 2;
      grupoRoda.add(raio);

      const anguloOffset = angulo + 0.18;
      const geoRaio2 = new THREE.BoxGeometry(0.035, 0.035, 0.48);
      const raio2 = new THREE.Mesh(geoRaio2, matCromo);
      raio2.position.set(Math.cos(anguloOffset) * 0.14, Math.sin(anguloOffset) * 0.14, 0);
      raio2.rotation.z = anguloOffset;
      raio2.rotation.x = Math.PI / 2;
      grupoRoda.add(raio2);
    }

    const geoCentro = new THREE.CylinderGeometry(0.1, 0.1, 0.34, 12);
    const centro = new THREE.Mesh(geoCentro, matDourado);
    centro.rotation.x = Math.PI / 2;
    grupoRoda.add(centro);

    const geoLogo = new THREE.CylinderGeometry(0.06, 0.06, 0.36, 6);
    const logoRoda = new THREE.Mesh(geoLogo, matDouradoEscuro);
    logoRoda.rotation.x = Math.PI / 2;
    grupoRoda.add(logoRoda);

    grupoRoda.position.set(x, y, z);
    grupoCarro.add(grupoRoda);
  });

  [[2.5, 0.3, 0.72], [2.5, 0.3, -0.72]].forEach(([x, y, z]) => {
    for (let l = 0; l < 3; l++) {
      const geoLed = new THREE.SphereGeometry(0.065, 14, 14);
      const led = new THREE.Mesh(geoLed, matFarol);
      led.position.set(x, y + l * 0.1 - 0.1, z);
      grupoCarro.add(led);
    }
    const luzFarol = new THREE.PointLight(0xFFFFCC, 2.5, 5);
    luzFarol.position.set(x + 0.6, y, z);
    cena.add(luzFarol);
  });

  [[-2.5, 0.3, 0.72], [-2.5, 0.3, -0.72]].forEach(([x, y, z]) => {
    const geoLanterna = new THREE.BoxGeometry(0.06, 0.28, 0.12);
    const lanterna = new THREE.Mesh(geoLanterna, matVermelho);
    lanterna.position.set(x, y, z);
    grupoCarro.add(lanterna);

    const geoDRL = new THREE.BoxGeometry(0.06, 0.06, 0.38);
    const drl = new THREE.Mesh(geoDRL, matVermelho);
    drl.position.set(x, y - 0.12, z);
    grupoCarro.add(drl);

    const luzTrasLanterna = new THREE.PointLight(0xFF0000, 1.5, 3);
    luzTrasLanterna.position.set(x - 0.3, y, z);
    cena.add(luzTrasLanterna);
  });

  [0.65, -0.65].forEach(z => {
    const geoSuporteAero = new THREE.BoxGeometry(0.08, 0.35, 0.08);
    const suporteAero = new THREE.Mesh(geoSuporteAero, matCromo);
    suporteAero.position.set(-2.1, 0.68, z);
    grupoCarro.add(suporteAero);
  });

  const geoAsa = new THREE.BoxGeometry(0.7, 0.08, 1.6);
  const asa = new THREE.Mesh(geoAsa, matDourado);
  asa.position.set(-2.3, 0.85, 0);
  asa.rotation.x = 0.2;
  grupoCarro.add(asa);

  const escapePosicoes = [[-2.52, -0.2, 0.28], [-2.52, -0.2, -0.28],
                          [-2.52, -0.2, 0.56], [-2.52, -0.2, -0.56]];
  escapePosicoes.forEach(([x, y, z]) => {
    const geoEscape = new THREE.CylinderGeometry(0.07, 0.07, 0.12, 12);
    const escape = new THREE.Mesh(geoEscape, matCromo);
    escape.rotation.x = Math.PI / 2;
    escape.position.set(x, y, z);
    grupoCarro.add(escape);

    const luzEscape = new THREE.PointLight(0xFF5500, 0.8, 1.2);
    luzEscape.position.set(x - 0.1, y, z);
    cena.add(luzEscape);
  });

  [-0.65, 0.65].forEach(z => {
    const geoNaca = new THREE.BoxGeometry(0.5, 0.08, 0.28);
    const naca = new THREE.Mesh(geoNaca, matPretoFosco);
    naca.position.set(-1.8, 0.5, z * 1.2);
    grupoCarro.add(naca);
  });

  const formaRaio = new THREE.Shape();
  formaRaio.moveTo(0,     0);
  formaRaio.lineTo(-0.15, 0.45);
  formaRaio.lineTo(0.04,  0.45);
  formaRaio.lineTo(-0.12, 0.85);
  formaRaio.lineTo(0.22,  0.36);
  formaRaio.lineTo(0.06,  0.36);
  formaRaio.lineTo(0.22,  0);

  const extrusaoRaio = { depth: 0.05, bevelEnabled: false };
  const geoRaio = new THREE.ExtrudeGeometry(formaRaio, extrusaoRaio);

  const matRaio = new THREE.MeshStandardMaterial({
    color:             0xD4A017,
    emissive:          0xD4A017,
    emissiveIntensity: 0.6,
    metalness:         0.9,
    roughness:         0.1,
  });

  const raioMesh = new THREE.Mesh(geoRaio, matRaio);
  raioMesh.position.set(0.8, 0.36, 0);
  raioMesh.rotation.y = Math.PI / 2;
  grupoCarro.add(raioMesh);

  grupoCarro.position.set(0, 0.15, 0);
  grupoCarro.castShadow = true;
  cena.add(grupoCarro);

  const qtdParticulas = 2500;
  const geoParticulas = new THREE.BufferGeometry();
  const posParticulas = new Float32Array(qtdParticulas * 3);

  for (let i = 0; i < qtdParticulas * 3; i += 3) {
    posParticulas[i]     = (Math.random() - 0.5) * 60;
    posParticulas[i + 1] = (Math.random() - 0.5) * 60;
    posParticulas[i + 2] = (Math.random() - 0.5) * 60;
  }

  geoParticulas.setAttribute('position', new THREE.BufferAttribute(posParticulas, 3));

  const matParticulas = new THREE.PointsMaterial({
    color:       0xD4A017,
    size:        0.07,
    transparent: true,
    opacity:     0.45,
  });

  const sistemaParticulas = new THREE.Points(geoParticulas, matParticulas);
  cena.add(sistemaParticulas);

  const materialGrade = new THREE.LineBasicMaterial({
    color:       0xD4A017,
    transparent: true,
    opacity:     0.06,
  });

  for (let i = -10; i <= 10; i++) {
    const pontosZ = [new THREE.Vector3(i * 1.5, -1.28, -15), new THREE.Vector3(i * 1.5, -1.28,  15)];
    const geoLinhaZ = new THREE.BufferGeometry().setFromPoints(pontosZ);
    cena.add(new THREE.Line(geoLinhaZ, materialGrade));

    const pontosX = [new THREE.Vector3(-15, -1.28, i * 1.5), new THREE.Vector3( 15, -1.28, i * 1.5)];
    const geoLinhaX = new THREE.BufferGeometry().setFromPoints(pontosX);
    cena.add(new THREE.Line(geoLinhaX, materialGrade));
  }

  const geoAnel = new THREE.RingGeometry(2.0, 2.6, 80);
  const matAnel = new THREE.MeshBasicMaterial({ color: 0xD4A017, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
  const anel = new THREE.Mesh(geoAnel, matAnel);
  anel.rotation.x = -Math.PI / 2;
  anel.position.y = -1.28;
  cena.add(anel);

  const geoAnelExterno = new THREE.RingGeometry(2.8, 3.2, 80);
  const anelExterno = new THREE.Mesh(geoAnelExterno, new THREE.MeshBasicMaterial({
    color: 0xD4A017, side: THREE.DoubleSide, transparent: true, opacity: 0.04,
  }));
  anelExterno.rotation.x = -Math.PI / 2;
  anelExterno.position.y = -1.28;
  cena.add(anelExterno);

  let mouseX = 0, mouseY = 0;
  let rotacaoAlvoY = 0, rotacaoAlvoX = 0;
  let rotacaoAtualY = 0, rotacaoAtualX = 0;
  let autoRotar = true;
  let timerMouse;

  document.addEventListener('mousemove', (evento) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((evento.clientX - rect.left) / rect.width  - 0.5) * 2;
    mouseY = ((evento.clientY - rect.top)  / rect.height - 0.5) * 2;
    autoRotar = false;

    clearTimeout(timerMouse);
    timerMouse = setTimeout(() => { autoRotar = true; }, 4000);
  });

  document.addEventListener('touchmove', (evento) => {
    const toque = evento.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouseX = ((toque.clientX - rect.left) / rect.width  - 0.5) * 2;
    mouseY = ((toque.clientY - rect.top)  / rect.height - 0.5) * 2;
  }, { passive: true });

  let tempoAnterior = 0;

  function animar(timestamp) {
    requestAnimationFrame(animar);

    const delta = (timestamp - tempoAnterior) / 1000;
    tempoAnterior = timestamp;

    const t = timestamp * 0.001;

    if (autoRotar) {
      rotacaoAtualY += 0.004;
    } else {
      rotacaoAlvoY =  mouseX * Math.PI * 0.5;
      rotacaoAlvoX = -mouseY * Math.PI * 0.12;
      rotacaoAtualY += (rotacaoAlvoY - rotacaoAtualY) * 0.04;
      rotacaoAtualX += (rotacaoAlvoX - rotacaoAtualX) * 0.04;
    }

    grupoCarro.rotation.y = rotacaoAtualY;
    grupoCarro.rotation.x = rotacaoAtualX;
    grupoCarro.position.y = 0.15 + Math.sin(t * 0.7) * 0.08;

    luzDouradaPrincipal.position.x = Math.sin(t * 0.4) * 6;
    luzDouradaPrincipal.position.z = Math.cos(t * 0.4) * 6;
    luzDouradaPrincipal.intensity  = 4 + Math.sin(t * 1.5) * 0.8;

    anel.material.opacity       = 0.07 + Math.sin(t * 1.2) * 0.05;
    anelExterno.material.opacity = 0.025 + Math.sin(t * 0.9 + 1) * 0.015;
    anel.scale.setScalar(1 + Math.sin(t * 0.9) * 0.03);

    const posArray = geoParticulas.attributes.position.array;
    for (let i = 0; i < 30; i += 3) {
      posArray[i] += Math.sin(t + i) * 0.0005;
      posArray[i + 1] += 0.0005;
      if (posArray[i + 1] > 30) posArray[i + 1] = -30;
    }
    geoParticulas.attributes.position.needsUpdate = true;

    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.025;
    camera.position.y += (-mouseY * 0.8 + 2.2 - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);

    renderer.render(cena, camera);
  }

  animar(0);

}
