// ============================================================================
// COORDENADOR PRINCIPAL DA ENGINE (Engine)
// ============================================================================
// Esta classe é o ponto central da MDAV Engine. Ela cria e mantém as instâncias
// compartilhadas do core, do ECS e dos sistemas, além de definir a ordem exata
// em que um frame é processado.
//
// DIREÇÃO DAS DEPENDÊNCIAS:
// - O jogo cria e chama a Engine.
// - A Engine chama Managers, ComponentStorages e Systems.
// - Os Systems leem o EntityManager e os ComponentStorages.
// - EntityManager, ComponentStorages e Systems não conhecem a Engine.
//
// ORDEM ATUAL DE CADA FRAME:
// 1. TimeManager calcula o deltaTime.
// 2. DirectionalMovementInputSystem transforma teclas em velocidade.
// 3. MovementSystem aplica velocidade nas posições.
// 4. ReverseVelocityAtBoundsSystem inverte movimentos que alcançaram seus limites.
// 5. CollisionSystem detecta sobreposições AABB.
// 6. RenderSystem preenche o fundo e desenha as entidades.
// ============================================================================

import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { ParticleManager } from './core/ParticleManager.js';
import { TimeManager } from './core/TimeManager.js';
import { EntityManager } from './ecs/EntityManager.js';
import { CollisionSystem } from './ecs/fundamentals/system/CollisionSystem.js';
import { MovementSystem } from './ecs/fundamentals/system/MovementSystem.js';
import { RenderSystem } from './ecs/fundamentals/system/RenderSystem.js';
import { SpatialCollisionSystem } from './ecs/fundamentals/system/SpatialCollisionSystem.js';
import { DirectionalMovementInputSystem } from './ecs/framework/system/DirectionalMovementInputSystem.js';
import { OrbitSystem } from './ecs/framework/system/OrbitSystem.js';
import { ReverseVelocityAtBoundsSystem } from './ecs/framework/system/ReverseVelocityAtBoundsSystem.js';
import { ComponentManager } from './ecs/ComponentManager.js';

export class Engine {
  constructor(canvas, entityCapacity, particleCapacity, backgroundColor) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    // Core do game
    // Não tem haver com entidades ou ECS, mas são necessários para o funcionamento do jogo.
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    this.particleManager = new ParticleManager(particleCapacity);
    this.timeManager = new TimeManager();

    // Gerenciador de Entidades
    this.entityManager = new EntityManager(entityCapacity);

    // Managers — Conjunto de sistemas semelhantes
    this.componentManagers = new ComponentManager(entityCapacity);

    // Sistemas — funções com responsabilidades únicas
    this.directionalMovementInputSystem = new DirectionalMovementInputSystem();
    this.orbitSystem = new OrbitSystem();
    this.movementSystem = new MovementSystem();
    this.reverseVelocityAtBoundsSystem = new ReverseVelocityAtBoundsSystem();
    this.collisionSystem = null;
    this.renderSystem = new RenderSystem(backgroundColor);

    // O jogo pode atribuir uma função que receberá os IDs de cada sobreposição
    // com pelo menos um collider TRIGGER. Contatos IMPENETRABLE são resolvidos
    // internamente e não dependem deste callback.
    this.onTriggerCollision = null;

    // Função do jogo executada dentro do game loop, uma vez por frame.
    // A Engine controla quando ela roda e entrega o deltaTime já calculado.
    this.gameLoopCallback = null;

    this.isGameLoopRunning = false;
    this.animationFrameId = null;

    // bind() cria uma única função estável. Isso preserva o `this` quando o método
    // é entregue ao requestAnimationFrame e evita criar uma função a cada frame.
    this._executeGameLoopFrame = this._executeGameLoopFrame.bind(this);
  }

  // ============================================================================
  // CONFIGURAÇÃO PÚBLICA DO SISTEMA DE COLISÃO
  // ============================================================================
  // Substituir o sistema durante o jogo descarta qualquer grade espacial anterior.
  setDirectCollisionSystem() {
    this.collisionSystem = new CollisionSystem();
  }

  setSpatialCollisionSystem(cellSize, rebuildType) {
    this.collisionSystem = new SpatialCollisionSystem(cellSize, rebuildType);
  }

  removeCollisionSystem() {
    this.collisionSystem = null;
  }

  // ============================================================================
  // ESTADO DO MUNDO — TROCA DE CENA, FASE OU PARTIDA
  // ============================================================================
  // Cria a identidade numérica que receberá componentes posteriormente.
  createEntity() {
    return this.entityManager.createEntity();
  }

  // Limpa os componentes antes de devolver o ID para a pilha de reciclagem.
  destroyEntity(entityId) {
    this.componentManagers._clearEntityComponents(entityId);
    this.entityManager.destroyEntity(entityId);
  }

  // Remove todas as entidades e componentes sem recriar os TypedArrays.
  // Configurações globais, como input, áudio e sistemas, permanecem disponíveis.
  clearEntityData() {
    this.componentManagers.clearAll();
    this.entityManager.clearAll();
    this.onTriggerCollision = null;
  }

  // ============================================================================
  // GAME LOOP — CONTROLE PÚBLICO
  // ============================================================================
  // Registra a lógica que o jogo precisa executar uma vez a cada frame.
  // Existe somente um callback para manter a ordem de execução explícita.
  onGameLoop(callback) {
    this.gameLoopCallback = callback;
  }

  // Inicia o primeiro frame. Se o loop já estiver ativo, não cria um segundo loop.
  startGameLoop() {
    if (this.isGameLoopRunning) return;

    this.isGameLoopRunning = true;
    this.animationFrameId = requestAnimationFrame(this._executeGameLoopFrame);
  }

  stopGameLoop() {
    if (!this.isGameLoopRunning) return;

    this.isGameLoopRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // ============================================================================
  // UNDER THE HOOD — EXECUÇÃO INTERNA DE CADA FRAME
  // ============================================================================
  // Executa um frame completo e agenda o próximo enquanto o loop estiver ativo.
  _executeGameLoopFrame(currentTime) {
    if (!this.isGameLoopRunning) return;

    const deltaTime = this.timeManager.update(currentTime);

    // A regra do jogo roda antes dos sistemas ECS. Assim, entidades criadas aqui
    // já podem receber input, mover, colidir e ser renderizadas neste mesmo frame.
    if (this.gameLoopCallback) {
      this.gameLoopCallback(deltaTime);
    }

    this.directionalMovementInputSystem.update(
      this.entityManager,
      this.componentManagers.masksUint32Array,
      this.componentManagers._directionalMovementInputComponentStorage,
      this.componentManagers._velocityComponentStorage,
      this.inputManager
    );

    this.movementSystem.update(
      this.entityManager,
      this.componentManagers.masksUint32Array,
      this.componentManagers._transformComponentStorage,
      this.componentManagers._velocityComponentStorage,
      deltaTime
    );

    this.orbitSystem.update(
      this.entityManager,
      this.componentManagers.masksUint32Array,
      this.componentManagers._transformComponentStorage,
      this.componentManagers._orbitComponentStorage,
      deltaTime
    );

    this.reverseVelocityAtBoundsSystem.update(
      this.entityManager,
      this.componentManagers.masksUint32Array,
      this.componentManagers._transformComponentStorage,
      this.componentManagers._velocityComponentStorage,
      this.componentManagers._reverseVelocityAtBoundsComponentStorage
    );

    if (this.collisionSystem) {
      this.collisionSystem.update(
        this.entityManager,
        this.componentManagers.masksUint32Array,
        this.componentManagers._transformComponentStorage,
        this.componentManagers._velocityComponentStorage,
        this.componentManagers._colliderComponentStorage,
        this.onTriggerCollision
      );
    }

    this.particleManager._update(deltaTime);

    this.renderFrame();

    // Um sistema ou callback pode interromper a Engine durante o próprio frame.
    // Nesse caso, não deve existir um novo requestAnimationFrame pendente.
    if (this.isGameLoopRunning) {
      this.animationFrameId = requestAnimationFrame(this._executeGameLoopFrame);
    }
  }

  // ============================================================================
  // RENDERIZAÇÃO SOB DEMANDA
  // ============================================================================
  // Desenha o estado atual sem atualizar tempo, input, movimento ou colisões e
  // sem agendar outro frame. Útil para telas iniciais, pausa e debug de cenas.
  renderFrame() {
    this.renderSystem.update(
      this.context,
      this.entityManager,
      this.componentManagers.masksUint32Array,
      this.componentManagers._transformComponentStorage,
      this.componentManagers._colorComponentStorage,
      this.canvas.width,
      this.canvas.height
    );

    this.particleManager._render(this.context);
  }
}
