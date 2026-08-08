// ============================================================================
// GERENCIADOR DE ENTRADA DO USUÁRIO (InputManager)
// ============================================================================
// O QUE É E PARA QUE SERVE:
// Este módulo captura todos os eventos de teclado (teclas pressionadas ou soltas)
// do navegador e mantém um registro em tempo real.
//
// POR QUE USAR ISSO EM VEZ DE `addEventListener` DIRETO NOS SISTEMAS?
// 1. Desempenho e Organização: Ouvir eventos em múltiplos lugares espalha o código.
// 2. Consulta Instantânea (Polling): Nos jogos, o Game Loop roda 60 vezes por segundo.
//    Um sistema de movimento precisa perguntar a qualquer momento: "A tecla 'ArrowRight'
//    está pressionada AGORA?". O InputManager responde isso instantaneamente em O(1).
//
// POR QUE REGISTRAR BINDINGS DIRECIONAIS EM VEZ DE GUARDAR TECLAS EM CADA ENTIDADE?
// 1. Reutilização: Um binding é configurado uma única vez e pode ser compartilhado por
//    várias entidades. Cada DirectionalMovementInputComponentStorage guarda apenas seu ID numérico.
// 2. Controles Independentes: Entidades diferentes podem usar bindings diferentes,
//    permitindo multiplayer local, veículos e esquemas de controle específicos.
// 3. Menos Memória: As listas e strings das teclas não são duplicadas em cada entidade.
// 4. Sem Alocação por Frame: Os objetos dos bindings são criados durante a configuração;
//    durante o Game Loop, o sistema apenas consulta bindings e estados já existentes.
// 5. Remapeamento Centralizado: Alterar um binding atualiza o controle de todas as
//    entidades associadas a ele sem percorrer ou modificar cada componente individual.
// ============================================================================

export class InputManager {
  constructor() {
    // Guarda o estado atual de cada tecla (true se estiver pressionada, false se solta)
    // Exemplo: { "ArrowLeft": true, "KeyW": false }
    this.keys = {};

    // Conjuntos de teclas direcionais reutilizáveis, acessados por um ID numérico.
    // O objeto de configuração é criado apenas no registro, nunca durante o game loop.
    this.directionalBindings = [];

    // Liga os ouvintes globais de teclado no objeto window
    this._bindEvents();
  }

  // Configura os escutadores de eventos do navegador
  _bindEvents() {
    window.addEventListener('keydown', (event) => {
      // Evita rolagem de página padrão para teclas direcionais comuns
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }
      // Registrar que a tecla está pressionada
      this.keys[event.code] = true;
    });

    window.addEventListener('keyup', (event) => {
      // Registrar que a tecla foi solta
      this.keys[event.code] = false;
    });
  }

  // Registra as teclas direcionais de um binding. Cada direção exige um Array
  // de teclas equivalentes. Use [] quando uma direção não existir no jogo.
  registerDirectionalBinding(bindingId, leftKeys, rightKeys, upKeys, downKeys) {
    this.directionalBindings[bindingId] = {
      left: leftKeys,
      right: rightKeys,
      up: upKeys,
      down: downKeys,
    };
  }

  // Verifica uma lista de teclas sem criar callbacks ou Arrays durante a consulta.
  isAnyKeyPressed(keyList) {
    for (let index = 0; index < keyList.length; index++) {
      if (this.keys[keyList[index]] === true) return true;
    }
    return false;
  }

  // Retorna a intenção horizontal (-1, 0 ou 1) do binding solicitado.
  getDirectionalBindingMoveX(bindingId) {
    const binding = this.directionalBindings[bindingId];
    if (!binding) return 0;

    let value = 0;
    if (this.isAnyKeyPressed(binding.left)) value -= 1;
    if (this.isAnyKeyPressed(binding.right)) value += 1;
    return value;
  }

  // Retorna a intenção vertical (-1, 0 ou 1) do binding solicitado.
  getDirectionalBindingMoveY(bindingId) {
    const binding = this.directionalBindings[bindingId];
    if (!binding) return 0;

    let value = 0;
    if (this.isAnyKeyPressed(binding.up)) value -= 1;
    if (this.isAnyKeyPressed(binding.down)) value += 1;
    return value;
  }

  // Limpa as teclas pressionadas sem apagar os bindings direcionais registrados.
  // Útil quando o jogo pausa ou a janela perde o foco.
  clearPressedKeys() {
    this.keys = {};
  }
}
