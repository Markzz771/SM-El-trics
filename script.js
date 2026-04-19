/*
╔══════════════════════════════════════════════════════════════╗
║   SM ELÉTRICS — script.js                                   ║
║   JavaScript principal do site                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   # ÍNDICE DE BLOCOS:                                       ║
║   ──────────────────────────────────────────────            ║
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
║   COMO USAR ESTE ARQUIVO:                                   ║
║   Cada bloco é independente. Se quiser desativar algo,      ║
║   basta comentar a linha que chama a função no início.      ║
╚══════════════════════════════════════════════════════════════╝
*/


/* ============================================================
   # BLOCO 1: CONFIGURAÇÃO INICIAL
   Aguarda o HTML carregar completamente antes de executar.
   Todas as funções são chamadas daqui.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Chama cada bloco na ordem ──
  // Para desativar um bloco: comente a linha correspondente

  iniciarHeader();          // BLOCO 2: efeito de scroll + link ativo
  iniciarMenuMobile();      // BLOCO 3: menu hamburguer
  iniciarScrollSuave();     // BLOCO 4: scroll suave em âncoras
  iniciarReveal();          // BLOCO 5: animar elementos na tela
  iniciarContadores();      // BLOCO 6: animar números das stats
  iniciarFormulario();      // BLOCO 7: validar e enviar formulário
  iniciarBotaoTopo();       // BLOCO 8: botão de voltar ao topo
  iniciarAnoDinamico();     // BLOCO 9: ano no copyright do footer
  iniciar3DLamborghini();   // BLOCO 10: Lamborghini 3D no hero

}); // Fim do DOMContentLoaded


/* ============================================================
   # BLOCO 2: HEADER
   Objetivo: mudar visual do header ao rolar + marcar link ativo
   Como funciona:
   - Ouve o evento "scroll" da janela
   - Ao rolar mais de 20px, adiciona a classe .scrolled ao header
   - Verifica qual seção está visível e marca o link correspondente
   ============================================================ */
function iniciarHeader() {

  // Pega os elementos necessários
  const header   = document.getElementById('header');
  const links    = document.querySelectorAll('.header__nav a');
  const secoes   = document.querySelectorAll('section[id]');

  // Função executada a cada scroll
  function aoRolar() {

    // ── Efeito de scroll no header ──
    // Se rolou mais de 20px, adiciona a classe .scrolled (fundo mais escuro)
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // ── Link ativo no menu ──
    // Verifica qual seção está no topo da viewport
    let secaoAtual = '';

    secoes.forEach(secao => {
      // offsetTop = distância do topo da página
      // 100 = margem para ativar um pouco antes de chegar
      const topo = secao.offsetTop - 100;
      if (window.scrollY >= topo) {
        secaoAtual = secao.getAttribute('id');
      }
    });

    // Remove .ativo de todos e adiciona só no link correto
    links.forEach(link => {
      link.classList.remove('ativo');
      if (link.getAttribute('href') === `#${secaoAtual}`) {
        link.classList.add('ativo');
      }
    });
  }

  // Registra o listener (passive = melhor performance)
  window.addEventListener('scroll', aoRolar, { passive: true });

  // Executa uma vez ao carregar (caso a página abra no meio)
  aoRolar();
}


/* ============================================================
   # BLOCO 3: MENU MOBILE
   Objetivo: abrir/fechar o menu hamburguer no mobile
   Como funciona:
   - Clique no botão hamburguer → toggle das classes .aberto
   - Clique nos links do menu → fecha o menu automaticamente
   - Clique fora do menu → fecha o menu
   ============================================================ */
function iniciarMenuMobile() {

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const links     = document.querySelectorAll('.mnav-link, .mnav-cta');

  // Função que abre ou fecha o menu
  // force: true = forçar abrir | false = forçar fechar | undefined = alternar
  function toggleMenu(force) {
    const estaAberto = force !== undefined
      ? force
      : !hamburger.classList.contains('aberto');

    // Adiciona/remove classes nos dois elementos
    hamburger.classList.toggle('aberto', estaAberto);
    mobileNav.classList.toggle('aberto', estaAberto);

    // Acessibilidade: informa leitores de tela
    hamburger.setAttribute('aria-expanded', estaAberto);
    mobileNav.setAttribute('aria-hidden', !estaAberto);

    // Trava o scroll da página quando o menu está aberto
    document.body.style.overflow = estaAberto ? 'hidden' : '';
  }

  // Clique no hamburguer
  hamburger.addEventListener('click', () => toggleMenu());

  // Clique em qualquer link do menu → fecha
  links.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Clique fora do menu → fecha
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
   Objetivo: rolar suavemente para seções ao clicar em links âncora
   Como funciona:
   - Encontra todos os links que apontam para uma âncora (#algo)
   - Intercepta o clique padrão do browser
   - Calcula a posição correta (descontando a altura do header fixo)
   - Usa window.scrollTo com behavior:'smooth'
   ============================================================ */
function iniciarScrollSuave() {

  // Seleciona todos os links que começam com #
  const linksAncora = document.querySelectorAll('a[href^="#"]');
  const header = document.getElementById('header');

  linksAncora.forEach(link => {
    link.addEventListener('click', (evento) => {
      // Pega o href do link (ex: "#servicos")
      const alvo = document.querySelector(link.getAttribute('href'));
      if (!alvo) return;  // Se o elemento não existir, ignora

      evento.preventDefault();  // Cancela o comportamento padrão

      // Calcula posição: top do elemento - altura do header
      const alturaHeader = header ? header.offsetHeight : 0;
      const posicao = alvo.getBoundingClientRect().top
                    + window.scrollY
                    - alturaHeader;

      // Scroll suave até a posição calculada
      window.scrollTo({ top: posicao, behavior: 'smooth' });
    });
  });
}


/* ============================================================
   # BLOCO 5: REVEAL — Animar elementos ao entrar na tela
   Objetivo: fazer elementos aparecerem com animação ao rolar
   Como funciona:
   - Usa IntersectionObserver (API nativa, muito eficiente)
   - Quando um .reveal entra na viewport, recebe a classe .visivel
   - O CSS cuida da transição de opacidade e posição
   - Elementos irmãos recebem um delay progressivo (efeito stagger)
   ============================================================ */
function iniciarReveal() {

  // Seleciona todos os elementos que devem ser animados
  const elementos = document.querySelectorAll('.reveal');

  // Cria o observer — threshold: 0.12 = ativa quando 12% está visível
  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;  // Ignora saída da tela

      // Calcula o índice do elemento entre seus irmãos .reveal
      // Para criar o efeito de "stagger" (aparecer em sequência)
      const irmaos = entrada.target.parentElement.querySelectorAll('.reveal');
      let delay = 0;

      irmaos.forEach((irmao, indice) => {
        if (irmao === entrada.target) {
          delay = indice * 85;  // 85ms entre cada elemento
        }
      });

      // Aplica a classe .visivel com o delay calculado
      setTimeout(() => {
        entrada.target.classList.add('visivel');
      }, delay);

      // Para de observar o elemento (já animou, não precisa mais)
      observer.unobserve(entrada.target);
    });

  }, { threshold: 0.12 });

  // Registra cada elemento para ser observado
  elementos.forEach(el => observer.observe(el));
}


/* ============================================================
   # BLOCO 6: CONTADOR ANIMADO
   Objetivo: animar números de 0 até o valor em data-target
   Como funciona:
   - IntersectionObserver detecta quando a seção de stats entra na tela
   - Para cada .stat__num, usa requestAnimationFrame para incrementar
   - Curva de easing "ease-out cubic" = começa rápido, termina devagar
   - Duração total: 1800ms (1.8 segundos)
   ============================================================ */
function iniciarContadores() {

  const numeros = document.querySelectorAll('.stat__num');

  // Função que anima um único contador
  function animarContador(elemento) {
    const alvo     = parseInt(elemento.getAttribute('data-target'), 10);
    const duracao  = 1800;  // milissegundos totais
    const inicio   = performance.now();  // timestamp do início

    // Chamada recursiva a cada frame (~60fps)
    function atualizar(timestamp) {
      const decorrido  = timestamp - inicio;
      const progresso  = Math.min(decorrido / duracao, 1);  // 0 a 1

      // Fórmula do ease-out cubic: desacelera no final
      const suavizado = 1 - Math.pow(1 - progresso, 3);

      // Atualiza o texto com o valor atual
      elemento.textContent = Math.floor(suavizado * alvo);

      if (progresso < 1) {
        // Ainda não terminou — chama o próximo frame
        requestAnimationFrame(atualizar);
      } else {
        // Chegou ao final — garante o valor exato
        elemento.textContent = alvo;
      }
    }

    requestAnimationFrame(atualizar);
  }

  // Observer para iniciar a animação quando os contadores ficam visíveis
  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        animarContador(entrada.target);
        observer.unobserve(entrada.target);  // Anima só uma vez
      }
    });
  }, { threshold: 0.5 });  // Só quando 50% do número está visível

  numeros.forEach(num => observer.observe(num));
}


/* ============================================================
   # BLOCO 7: FORMULÁRIO DE CONTATO
   Objetivo: validar campos e simular o envio da mensagem
   Como funciona:
   - Validação em tempo real no evento "blur" (ao sair do campo)
   - Validação completa no submit
   - Simulação de envio com setTimeout (substitua por fetch() real)
   - Exibe mensagem de sucesso ou erro para o usuário
   ============================================================ */
function iniciarFormulario() {

  const form     = document.getElementById('formContato');
  if (!form) return;  // Proteção: se o form não existir, sai

  const feedback = document.getElementById('formFeedback');

  // ── Funções auxiliares ──

  // Exibe ou limpa a mensagem de erro de um campo
  // campoId: id do input | erroId: id do span de erro | msg: texto do erro
  function exibirErro(campoId, erroId, msg) {
    const campo = document.getElementById(campoId);
    const erro  = document.getElementById(erroId);
    if (!campo || !erro) return;

    // Borda vermelha no campo com erro, limpa se sem erro
    campo.style.borderColor = msg ? 'var(--erro)' : '';
    erro.textContent = msg || '';
  }

  // Valida um campo e retorna a mensagem de erro (ou '' se válido)
  function validarCampo(campo) {
    const valor = campo.value.trim();

    // Verifica se campo obrigatório está vazio
    if (campo.required && !valor) {
      return 'Este campo é obrigatório.';
    }

    // Validação específica para email
    if (campo.type === 'email' && valor) {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(valor)) {
        return 'Informe um endereço de e-mail válido.';
      }
    }

    return '';  // Sem erros
  }

  // ── Validação em tempo real (ao sair de cada campo) ──
  form.querySelectorAll('input, textarea').forEach(campo => {

    // "blur" = quando o usuário clica fora do campo
    campo.addEventListener('blur', () => {
      const erroId = `erro${campo.id.charAt(0).toUpperCase()}${campo.id.slice(1)}`;
      exibirErro(campo.id, erroId, validarCampo(campo));
    });

    // Remove o erro enquanto o usuário digita
    campo.addEventListener('input', () => {
      const erroId = `erro${campo.id.charAt(0).toUpperCase()}${campo.id.slice(1)}`;
      if (campo.value.trim()) exibirErro(campo.id, erroId, '');
    });
  });

  // ── Envio do formulário ──
  form.addEventListener('submit', (evento) => {
    evento.preventDefault();  // Impede recarregamento da página

    // Valida todos os campos obrigatórios
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

    // Se tem erro, não envia
    if (!formularioValido) return;

    // ── Simula o envio ──
    const botao = form.querySelector('.form__submit');
    const textoOriginal = botao.innerHTML;

    // Estado de "enviando..."
    botao.disabled = true;
    botao.innerHTML = '<i class="ri-loader-4-line"></i> Enviando…';

    /*
       ATENÇÃO DESENVOLVEDOR:
       Substitua o setTimeout abaixo por uma chamada real ao seu backend.
       Exemplo com fetch():

       fetch('/api/contato', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           nome: document.getElementById('nome').value,
           email: document.getElementById('email').value,
           mensagem: document.getElementById('mensagem').value,
         })
       })
       .then(res => res.json())
       .then(data => { mostrarSucesso(); })
       .catch(err => { mostrarErro(); });
    */
    setTimeout(() => {
      botao.disabled  = false;
      botao.innerHTML = textoOriginal;

      // Mensagem de sucesso
      feedback.textContent = '✅ Mensagem enviada com sucesso! Entraremos em contato em breve.';
      feedback.className   = 'form__feedback sucesso';

      // Reseta o formulário
      form.reset();

      // Rola até o feedback para o usuário ver
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Esconde a mensagem após 7 segundos
      setTimeout(() => {
        feedback.className   = 'form__feedback';
        feedback.textContent = '';
      }, 7000);

    }, 1600);  // Simula 1.6s de "carregando"
  });
}


/* ============================================================
   # BLOCO 8: BOTÃO VOLTAR AO TOPO
   Objetivo: exibir botão após rolar 500px e voltar ao início ao clicar
   Como funciona:
   - Listener de scroll verifica a posição da página
   - Se passou de 500px, adiciona a classe .visivel ao botão
   - O clique executa window.scrollTo para o topo
   ============================================================ */
function iniciarBotaoTopo() {

  const botao = document.getElementById('topoBtn');
  if (!botao) return;

  // Mostra/esconde baseado na posição do scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      botao.classList.add('visivel');
    } else {
      botao.classList.remove('visivel');
    }
  }, { passive: true });

  // Clique: volta ao topo suavemente
  botao.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
   # BLOCO 9: ANO DINÂMICO NO FOOTER
   Objetivo: atualizar o ano automaticamente no copyright
   Como funciona:
   - Pega o span #anoAtual no HTML
   - Insere o ano atual do sistema
   - Nunca precisará ser atualizado manualmente
   ============================================================ */
function iniciarAnoDinamico() {
  const span = document.getElementById('anoAtual');
  if (span) {
    span.textContent = new Date().getFullYear();
  }
}


/* ============================================================
   # BLOCO 10: 3D LAMBORGHINI HURACÁN — Three.js
   ──────────────────────────────────────────────────────────
   Objetivo: renderizar uma Lamborghini Huracán 3D no hero
   Biblioteca: Three.js r128 (carregada no HTML)

   ESTRUTURA DO BLOCO 3D:
   ├── 10.1  Setup da cena (renderer, camera, cena)
   ├── 10.2  Iluminação (ambiente + pontos dourados)
   ├── 10.3  Piso reflexivo
   ├── 10.4  Materiais (dourado metálico, vidro, carbono)
   ├── 10.5  Carroceria Huracán (geometrias compostas)
   ├── 10.6  Rodas com raios
   ├── 10.7  Faróis LED e lanternas
   ├── 10.8  Aerofólio + detalhes
   ├── 10.9  Raio / logo decorativo
   ├── 10.10 Partículas de fundo
   ├── 10.11 Grade do HUD
   ├── 10.12 Efeito de luz no chão
   ├── 10.13 Interação com mouse
   └── 10.14 Loop de animação
   ============================================================ */
function iniciar3DLamborghini() {

  // Verifica se o Three.js foi carregado corretamente
  if (typeof THREE === 'undefined') {
    console.warn('SM Elétrics 3D: Three.js não encontrado. Verifique a tag <script> no HTML.');
    return;
  }

  // Pega o canvas do HTML
  const canvas = document.getElementById('lambo-canvas');
  if (!canvas) return;


  /* ── 10.1 SETUP DA CENA ── */

  // Renderer: converte a cena 3D em pixels na tela
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,     // Suaviza as bordas
    alpha:     true,     // Fundo transparente (o fundo preto vem do CSS)
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));  // Máx. 2x para performance
  renderer.shadowMap.enabled = true;                              // Habilita sombras
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;           // Sombras suaves
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;      // Correção de cor cinematográfica
  renderer.toneMappingExposure = 1.3;

  // Cena: container de todos os objetos 3D
  const cena = new THREE.Scene();

  // Neblina: cria profundidade, objetos distantes ficam mais escuros
  cena.fog = new THREE.FogExp2(0x000000, 0.028);

  // Câmera perspectiva: simula visão humana
  // (ângulo de visão, proporção largura/altura, clipping near, far)
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 150);
  camera.position.set(0, 2.2, 9);  // Posição: x=0, y=2.2 (levemente acima), z=9 (afastado)

  // Função para redimensionar quando a janela muda de tamanho
  function redimensionar() {
    const w = canvas.parentElement?.offsetWidth  || window.innerWidth;
    const h = canvas.parentElement?.offsetHeight || window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  redimensionar();
  window.addEventListener('resize', redimensionar);


  /* ── 10.2 ILUMINAÇÃO ── */

  // Luz ambiente: iluminação base suave em toda a cena
  const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.18);
  cena.add(luzAmbiente);

  // Luz dourada principal (direita frontal) — cria brilho metálico
  const luzDouradaPrincipal = new THREE.PointLight(0xD4A017, 5, 25);
  luzDouradaPrincipal.position.set(5, 4, 5);
  luzDouradaPrincipal.castShadow = true;
  cena.add(luzDouradaPrincipal);

  // Luz de rim esquerda — destaca as bordas do carro
  const luzRim = new THREE.PointLight(0xffffff, 2.5, 18);
  luzRim.position.set(-5, 3, -2);
  cena.add(luzRim);

  // Luz traseira baixa — ilumina a traseira agressiva
  const luzTraseira = new THREE.PointLight(0xD4A017, 2, 14);
  luzTraseira.position.set(-1, 0.5, -5);
  cena.add(luzTraseira);

  // Luz spot de cima — como um holofote de showroom
  const luzSpot = new THREE.SpotLight(0xffffff, 3, 20, Math.PI / 6, 0.3);
  luzSpot.position.set(0, 10, 2);
  luzSpot.target.position.set(0, 0, 0);
  luzSpot.castShadow = true;
  cena.add(luzSpot);
  cena.add(luzSpot.target);


  /* ── 10.3 PISO REFLEXIVO ── */

  // Plano do chão com reflexo metálico
  const geoChao = new THREE.PlaneGeometry(30, 30);
  const matChao = new THREE.MeshStandardMaterial({
    color:     0x050505,
    metalness: 0.85,
    roughness: 0.25,
  });
  const chao = new THREE.Mesh(geoChao, matChao);
  chao.rotation.x = -Math.PI / 2;  // Deita o plano na horizontal
  chao.position.y = -1.3;
  chao.receiveShadow = true;
  cena.add(chao);


  /* ── 10.4 MATERIAIS ── */

  // Material dourado metálico (carroceria)
  const matDourado = new THREE.MeshStandardMaterial({
    color:     0xD4A017,
    metalness: 0.96,
    roughness: 0.04,
  });

  // Material dourado escuro (detalhes)
  const matDouradoEscuro = new THREE.MeshStandardMaterial({
    color:     0x8A6010,
    metalness: 0.9,
    roughness: 0.1,
  });

  // Material preto fosco (pneus, interior)
  const matPretoFosco = new THREE.MeshStandardMaterial({
    color:     0x0A0A0A,
    metalness: 0.1,
    roughness: 0.9,
  });

  // Material cromado (raios, detalhes)
  const matCromo = new THREE.MeshStandardMaterial({
    color:     0xCCCCCC,
    metalness: 1.0,
    roughness: 0.02,
  });

  // Material de vidro (para-brisa)
  const matVidro = new THREE.MeshStandardMaterial({
    color:       0x4488BB,
    metalness:   0.05,
    roughness:   0.0,
    transparent: true,
    opacity:     0.28,
  });

  // Material vermelho (lanternas traseiras)
  const matVermelho = new THREE.MeshStandardMaterial({
    color:             0xFF1500,
    emissive:          0xFF0800,
    emissiveIntensity: 2.5,
  });

  // Material amarelo-branco (faróis)
  const matFarol = new THREE.MeshStandardMaterial({
    color:             0xFFFFCC,
    emissive:          0xFFFFAA,
    emissiveIntensity: 3,
  });

  // Material fibra de carbono (detalhes internos)
  const matCarbono = new THREE.MeshStandardMaterial({
    color:     0x1A1A1A,
    metalness: 0.6,
    roughness: 0.5,
  });


  /* ── 10.5 CARROCERIA LAMBORGHINI HURACÁN ── */
  // O carro é composto de múltiplas geometrias para criar
  // o visual agressivo e angular característico da Lamborghini.

  const grupoCarro = new THREE.Group();

  // ── Chassi / Base ──
  // Caixa principal que forma a base do carro
  const geoBase = new THREE.BoxGeometry(4.8, 0.5, 2.0);
  const base = new THREE.Mesh(geoBase, matDourado);
  base.position.y = 0.1;
  base.castShadow = true;
  grupoCarro.add(base);

  // ── Saia lateral (skirt) — detalhe agressivo de supercar ──
  [-1.08, 1.08].forEach(z => {
    const geoSaia = new THREE.BoxGeometry(4.6, 0.22, 0.12);
    const saia = new THREE.Mesh(geoSaia, matDouradoEscuro);
    saia.position.set(0, -0.14, z);
    grupoCarro.add(saia);
  });

  // ── Capô dianteiro baixo (Huracán tem frente muito baixa) ──
  const geoCapoDiant = new THREE.BoxGeometry(1.4, 0.28, 1.9);
  const capoDiant = new THREE.Mesh(geoCapoDiant, matDourado);
  capoDiant.position.set(1.85, 0.3, 0);
  capoDiant.rotation.z = -0.22;  // Inclinação aerodinâmica
  grupoCarro.add(capoDiant);

  // ── Seção central da carroceria ──
  const geoCorpo = new THREE.BoxGeometry(2.2, 0.52, 1.95);
  const corpo = new THREE.Mesh(geoCorpo, matDourado);
  corpo.position.set(0.1, 0.48, 0);
  grupoCarro.add(corpo);

  // ── Cabine baixa (teto de supercar) ──
  const geoCabine = new THREE.BoxGeometry(1.9, 0.48, 1.75);
  const cabine = new THREE.Mesh(geoCabine, matDourado);
  cabine.position.set(-0.1, 0.86, 0);
  grupoCarro.add(cabine);

  // ── Teto com corte angular ──
  const geoTeto = new THREE.BoxGeometry(1.3, 0.1, 1.6);
  const teto = new THREE.Mesh(geoTeto, matDouradoEscuro);
  teto.position.set(-0.15, 1.1, 0);
  grupoCarro.add(teto);

  // ── Para-choque dianteiro ──
  const geoParaChoqueDiant = new THREE.BoxGeometry(0.18, 0.35, 1.95);
  const paraChoqueDiant = new THREE.Mesh(geoParaChoqueDiant, matDourado);
  paraChoqueDiant.position.set(2.45, 0.22, 0);
  grupoCarro.add(paraChoqueDiant);

  // ── Grade dianteira (air intake central Huracán) ──
  const geoGrade = new THREE.BoxGeometry(0.08, 0.22, 1.4);
  const grade = new THREE.Mesh(geoGrade, matPretoFosco);
  grade.position.set(2.52, 0.18, 0);
  grupoCarro.add(grade);

  // ── Air intakes laterais dianteiros ──
  [-0.72, 0.72].forEach(z => {
    const geoIntake = new THREE.BoxGeometry(0.28, 0.2, 0.38);
    const intake = new THREE.Mesh(geoIntake, matPretoFosco);
    intake.position.set(2.2, 0.14, z);
    grupoCarro.add(intake);
  });

  // ── Traseira agressiva ──
  const geoTraseira = new THREE.BoxGeometry(0.22, 0.45, 1.95);
  const traseira = new THREE.Mesh(geoTraseira, matDourado);
  traseira.position.set(-2.35, 0.28, 0);
  grupoCarro.add(traseira);

  // ── Difusor traseiro (peça de carbono abaixo) ──
  const geoDifusor = new THREE.BoxGeometry(0.6, 0.14, 1.8);
  const difusor = new THREE.Mesh(geoDifusor, matCarbono);
  difusor.position.set(-2.45, -0.12, 0);
  grupoCarro.add(difusor);

  // ── Para-brisa dianteiro muito inclinado (característica Lambo) ──
  const geoParaBrisa = new THREE.BoxGeometry(0.1, 0.52, 1.65);
  const paraBrisa = new THREE.Mesh(geoParaBrisa, matVidro);
  paraBrisa.position.set(0.9, 0.84, 0);
  paraBrisa.rotation.z = -0.65;  // Inclinação pronunciada
  grupoCarro.add(paraBrisa);

  // ── Vidro traseiro ──
  const geoVidroTras = new THREE.BoxGeometry(0.1, 0.5, 1.6);
  const vidroTras = new THREE.Mesh(geoVidroTras, matVidro);
  vidroTras.position.set(-0.95, 0.84, 0);
  vidroTras.rotation.z = 0.62;
  grupoCarro.add(vidroTras);

  // ── Janelas laterais ──
  [0.4, -0.15].forEach((x) => {
    const geoJanela = new THREE.BoxGeometry(0.52, 0.36, 0.06);
    [-0.89, 0.89].forEach(z => {
      const janela = new THREE.Mesh(geoJanela, matVidro);
      janela.position.set(x, 0.9, z);
      grupoCarro.add(janela);
    });
  });

  // ── Motor visível (tampa traseira de vidro — característica Huracán) ──
  const geoTampaMotor = new THREE.BoxGeometry(1.0, 0.06, 1.5);
  const tampaMotor = new THREE.Mesh(geoTampaMotor, matVidro);
  tampaMotor.position.set(-1.5, 0.5, 0);
  grupoCarro.add(tampaMotor);

  // ── V10 Engine block (visível pela tampa) ──
  const geoMotor = new THREE.BoxGeometry(0.8, 0.35, 1.2);
  const motor = new THREE.Mesh(geoMotor, matCarbono);
  motor.position.set(-1.5, 0.38, 0);
  grupoCarro.add(motor);


  /* ── 10.6 RODAS ── */
  // 4 rodas nas posições características do Huracán

  const posicoesRodas = [
    [1.6,  -0.42,  1.1],   // Dianteira direita
    [1.6,  -0.42, -1.1],   // Dianteira esquerda
    [-1.55, -0.42,  1.1],  // Traseira direita
    [-1.55, -0.42, -1.1],  // Traseira esquerda
  ];

  posicoesRodas.forEach(([x, y, z], indice) => {
    const grupoRoda = new THREE.Group();

    // Pneu
    const geoPneu = new THREE.CylinderGeometry(0.44, 0.44, 0.3, 36);
    const pneu = new THREE.Mesh(geoPneu, matPretoFosco);
    pneu.rotation.x = Math.PI / 2;
    grupoRoda.add(pneu);

    // Aro (rim)
    const geoAro = new THREE.CylinderGeometry(0.3, 0.3, 0.32, 24);
    const aro = new THREE.Mesh(geoAro, matCromo);
    aro.rotation.x = Math.PI / 2;
    grupoRoda.add(aro);

    // Raios — 5 raios em Y style (como as rodas do Huracán)
    const qtdRaios = 5;
    for (let r = 0; r < qtdRaios; r++) {
      const angulo = (r / qtdRaios) * Math.PI * 2;

      // Raio principal
      const geoRaio = new THREE.BoxGeometry(0.04, 0.04, 0.56);
      const raio = new THREE.Mesh(geoRaio, matCromo);
      raio.position.set(
        Math.cos(angulo) * 0.16,
        Math.sin(angulo) * 0.16,
        0
      );
      raio.rotation.z = angulo;
      raio.rotation.x = Math.PI / 2;
      grupoRoda.add(raio);

      // Raio duplo (Y-spoke)
      const anguloOffset = angulo + 0.18;
      const geoRaio2 = new THREE.BoxGeometry(0.035, 0.035, 0.48);
      const raio2 = new THREE.Mesh(geoRaio2, matCromo);
      raio2.position.set(
        Math.cos(anguloOffset) * 0.14,
        Math.sin(anguloOffset) * 0.14,
        0
      );
      raio2.rotation.z = anguloOffset;
      raio2.rotation.x = Math.PI / 2;
      grupoRoda.add(raio2);
    }

    // Centro do aro (cubo)
    const geoCentro = new THREE.CylinderGeometry(0.1, 0.1, 0.34, 12);
    const centro = new THREE.Mesh(geoCentro, matDourado);
    centro.rotation.x = Math.PI / 2;
    grupoRoda.add(centro);

    // Logo no centro (touro/roda)
    const geoLogo = new THREE.CylinderGeometry(0.06, 0.06, 0.36, 6);
    const logoRoda = new THREE.Mesh(geoLogo, matDouradoEscuro);
    logoRoda.rotation.x = Math.PI / 2;
    grupoRoda.add(logoRoda);

    grupoRoda.position.set(x, y, z);
    grupoCarro.add(grupoRoda);
  });


  /* ── 10.7 FARÓIS LED E LANTERNAS ── */

  // Faróis dianteiros LED (formato em V — característico do Huracán)
  [[2.5, 0.3, 0.72], [2.5, 0.3, -0.72]].forEach(([x, y, z]) => {
    // Conjunto de 3 LEDs por farol
    for (let l = 0; l < 3; l++) {
      const geoLed = new THREE.SphereGeometry(0.065, 14, 14);
      const led = new THREE.Mesh(geoLed, matFarol);
      led.position.set(x, y + l * 0.1 - 0.1, z);
      grupoCarro.add(led);
    }

    // Luz pontual emanada pelos faróis
    const luzFarol = new THREE.PointLight(0xFFFFCC, 2.5, 5);
    luzFarol.position.set(x + 0.6, y, z);
    cena.add(luzFarol);
  });

  // Lanternas traseiras (DRL em L — estilo Huracán)
  [[-2.5, 0.3, 0.72], [-2.5, 0.3, -0.72]].forEach(([x, y, z]) => {
    // Lanterna principal
    const geoLanterna = new THREE.BoxGeometry(0.06, 0.28, 0.12);
    const lanterna = new THREE.Mesh(geoLanterna, matVermelho);
    lanterna.position.set(x, y, z);
    grupoCarro.add(lanterna);

    // DRL horizontal
    const geoDRL = new THREE.BoxGeometry(0.06, 0.06, 0.38);
    const drl = new THREE.Mesh(geoDRL, matVermelho);
    drl.position.set(x, y - 0.12, z);
    grupoCarro.add(drl);

    // Luz pontual vermelha
    const luzTrasLanterna = new THREE.PointLight(0xFF0000, 1.5, 3);
    luzTrasLanterna.position.set(x - 0.3, y, z);
    cena.add(luzTrasLanterna);
  });


  /* ── 10.8 AEROFÓLIO E DETALHES ── */

  // Suportes do aerofólio
  [0.65, -0.65].forEach(z => {
    const geoSuporteAero = new THREE.BoxGeometry(0.08, 0.35, 0.08);
    const suporteAero = new THREE.Mesh(geoSuporteAero, matCromo);
    suporteAero.position.set(-2.1, 0.68, z);
    grupoCarro.add(suporteAero);
  });

  // Asa do aerofólio
  const geoAsa = new THREE.BoxGeometry(0.7, 0.08, 1.6);
  const asa = new THREE.Mesh(geoAsa, matDourado);
  asa.position.set(-2.3, 0.85, 0);
  asa.rotation.x = 0.2;  // Leve angulação para baixo (downforce)
  grupoCarro.add(asa);

  // Saídas de escape duplas (Huracán tem 4 saídas centrais)
  const escapePosicoes = [[-2.52, -0.2, 0.28], [-2.52, -0.2, -0.28],
                          [-2.52, -0.2, 0.56], [-2.52, -0.2, -0.56]];
  escapePosicoes.forEach(([x, y, z]) => {
    const geoEscape = new THREE.CylinderGeometry(0.07, 0.07, 0.12, 12);
    const escape = new THREE.Mesh(geoEscape, matCromo);
    escape.rotation.x = Math.PI / 2;
    escape.position.set(x, y, z);
    grupoCarro.add(escape);

    // Luz de calor do escape
    const luzEscape = new THREE.PointLight(0xFF5500, 0.8, 1.2);
    luzEscape.position.set(x - 0.1, y, z);
    cena.add(luzEscape);
  });

  // Entradas de ar traseiras (NACA ducts)
  [-0.65, 0.65].forEach(z => {
    const geoNaca = new THREE.BoxGeometry(0.5, 0.08, 0.28);
    const naca = new THREE.Mesh(geoNaca, matPretoFosco);
    naca.position.set(-1.8, 0.5, z * 1.2);
    grupoCarro.add(naca);
  });


  /* ── 10.9 RAIO DECORATIVO (logo SM Elétrics) ── */

  // Raio extrudado no capô
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


  /* ── Posicionamento final do carro ── */
  grupoCarro.position.set(0, 0.15, 0);
  grupoCarro.castShadow = true;
  cena.add(grupoCarro);


  /* ── 10.10 PARTÍCULAS DE FUNDO ── */
  // 2500 pontos pequenos criam o efeito de "faíscas" no fundo

  const qtdParticulas = 2500;
  const geoParticulas = new THREE.BufferGeometry();
  const posParticulas = new Float32Array(qtdParticulas * 3);

  for (let i = 0; i < qtdParticulas * 3; i += 3) {
    posParticulas[i]     = (Math.random() - 0.5) * 60;  // x
    posParticulas[i + 1] = (Math.random() - 0.5) * 60;  // y
    posParticulas[i + 2] = (Math.random() - 0.5) * 60;  // z
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


  /* ── 10.11 GRADE DO HUD (holographic grid) ── */
  // Grade de linhas no chão — efeito tecnológico/futurista

  const materialGrade = new THREE.LineBasicMaterial({
    color:       0xD4A017,
    transparent: true,
    opacity:     0.06,
  });

  for (let i = -10; i <= 10; i++) {
    // Linhas paralelas ao eixo Z
    const pontosZ = [
      new THREE.Vector3(i * 1.5, -1.28, -15),
      new THREE.Vector3(i * 1.5, -1.28,  15),
    ];
    const geoLinhaZ = new THREE.BufferGeometry().setFromPoints(pontosZ);
    cena.add(new THREE.Line(geoLinhaZ, materialGrade));

    // Linhas paralelas ao eixo X
    const pontosX = [
      new THREE.Vector3(-15, -1.28, i * 1.5),
      new THREE.Vector3( 15, -1.28, i * 1.5),
    ];
    const geoLinhaX = new THREE.BufferGeometry().setFromPoints(pontosX);
    cena.add(new THREE.Line(geoLinhaX, materialGrade));
  }


  /* ── 10.12 ANEL DE LUZ NO CHÃO ── */
  // Anel dourado embaixo do carro — efeito showroom

  const geoAnel = new THREE.RingGeometry(2.0, 2.6, 80);
  const matAnel = new THREE.MeshBasicMaterial({
    color:       0xD4A017,
    side:        THREE.DoubleSide,
    transparent: true,
    opacity:     0.1,
  });
  const anel = new THREE.Mesh(geoAnel, matAnel);
  anel.rotation.x = -Math.PI / 2;
  anel.position.y = -1.28;
  cena.add(anel);

  // Anel externo maior, mais sutil
  const geoAnelExterno = new THREE.RingGeometry(2.8, 3.2, 80);
  const anelExterno = new THREE.Mesh(geoAnelExterno, new THREE.MeshBasicMaterial({
    color:       0xD4A017,
    side:        THREE.DoubleSide,
    transparent: true,
    opacity:     0.04,
  }));
  anelExterno.rotation.x = -Math.PI / 2;
  anelExterno.position.y = -1.28;
  cena.add(anelExterno);


  /* ── 10.13 INTERAÇÃO COM MOUSE ── */
  // O carro gira suavemente para seguir o cursor do mouse

  let mouseX = 0, mouseY = 0;
  let rotacaoAlvoY = 0, rotacaoAlvoX = 0;
  let rotacaoAtualY = 0, rotacaoAtualX = 0;
  let autoRotar = true;  // Rotação automática quando o mouse não está ativo
  let timerMouse;

  document.addEventListener('mousemove', (evento) => {
    const rect = canvas.getBoundingClientRect();
    // Normaliza de -1 a +1
    mouseX = ((evento.clientX - rect.left) / rect.width  - 0.5) * 2;
    mouseY = ((evento.clientY - rect.top)  / rect.height - 0.5) * 2;
    // # ALTERADO: autoRotar permanece sempre true — carro gira continuamente
  });

  // Suporte a touch (mobile)
  document.addEventListener('touchmove', (evento) => {
    const toque = evento.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouseX = ((toque.clientX - rect.left) / rect.width  - 0.5) * 2;
    mouseY = ((toque.clientY - rect.top)  / rect.height - 0.5) * 2;
  }, { passive: true });


  /* ── 10.14 LOOP DE ANIMAÇÃO ── */
  // requestAnimationFrame: chama a função ~60 vezes por segundo

  let tempoAnterior = 0;

  function animar(timestamp) {
    requestAnimationFrame(animar);

    // Delta time: tempo desde o último frame (para animação consistente)
    const delta = (timestamp - tempoAnterior) / 1000;
    tempoAnterior = timestamp;

    const t = timestamp * 0.001;  // Tempo em segundos

    // ── Rotação do carro ──
    if (autoRotar) {
      // Auto-rotação suave quando não tem interação do mouse
      rotacaoAtualY += 0.004;
    } else {
      // Segue o mouse com interpolação suave (lerp)
      rotacaoAlvoY =  mouseX * Math.PI * 0.5;
      rotacaoAlvoX = -mouseY * Math.PI * 0.12;
      rotacaoAtualY += (rotacaoAlvoY - rotacaoAtualY) * 0.04;
      rotacaoAtualX += (rotacaoAlvoX - rotacaoAtualX) * 0.04;
    }

    grupoCarro.rotation.y = rotacaoAtualY;
    grupoCarro.rotation.x = rotacaoAtualX;

    // ── Flutuação vertical ── (leve movimento para cima e para baixo)
    grupoCarro.position.y = 0.15 + Math.sin(t * 0.7) * 0.08;

    // ── Animação das luzes ──
    // Luz dourada orbita em volta do carro
    luzDouradaPrincipal.position.x = Math.sin(t * 0.4) * 6;
    luzDouradaPrincipal.position.z = Math.cos(t * 0.4) * 6;
    luzDouradaPrincipal.intensity  = 4 + Math.sin(t * 1.5) * 0.8;

    // Pulso no anel do chão
    anel.material.opacity       = 0.07 + Math.sin(t * 1.2) * 0.05;
    anelExterno.material.opacity = 0.025 + Math.sin(t * 0.9 + 1) * 0.015;
    anel.scale.setScalar(1 + Math.sin(t * 0.9) * 0.03);

    // ── Partículas ── leve drift
    const posArray = geoParticulas.attributes.position.array;
    for (let i = 0; i < 30; i += 3) {
      posArray[i] += Math.sin(t + i) * 0.0005;
      posArray[i + 1] += 0.0005;
      if (posArray[i + 1] > 30) posArray[i + 1] = -30;
    }
    geoParticulas.attributes.position.needsUpdate = true;

    // ── Parallax da câmera com o mouse ──
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.025;
    camera.position.y += (-mouseY * 0.8 + 2.2 - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);

    // Renderiza o frame
    renderer.render(cena, camera);
  }

  // Inicia o loop
  animar(0);

} // fim de iniciar3DLamborghini