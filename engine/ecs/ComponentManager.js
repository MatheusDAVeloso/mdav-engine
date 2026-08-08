import { COMPONENT_FLAGS } from './ComponentFlags.js';
import { ColliderComponentStorage } from './fundamentals/components/ColliderComponentStorage.js';
import { ColorComponentStorage } from './fundamentals/components/ColorComponentStorage.js';
import { TransformComponentStorage } from './fundamentals/components/TransformComponentStorage.js';
import { VelocityComponentStorage } from './fundamentals/components/VelocityComponentStorage.js';
import { DirectionalMovementInputComponentStorage } from './framework/components/DirectionalMovementInputComponentStorage.js';
import { OrbitComponentStorage } from './framework/components/OrbitComponentStorage.js';
import { ReverseVelocityAtBoundsComponentStorage } from './framework/components/ReverseVelocityAtBoundsComponentStorage.js';

// ============================================================================
// PONTO DE ACESSO AOS COMPONENT STORAGES (ComponentManager)
// ============================================================================
// Organiza os dados de todos os componentes e mantém suas máscaras ECS.
//
// COMO FUNCIONAM AS MÁSCARAS DE COMPONENTES:
// - Cada componente possui uma flag com somente um bit ativo.
// - masksUint32Array[entityId] combina as flags dos componentes da entidade.
// - Adicionar usa OR (|) para ativar o bit sem alterar os demais.
// - Remover usa AND NOT (& ~) para desativar somente aquele bit.
// - Uma máscara igual a 0 já significa ausência de componentes; não é necessária
//   uma flag NONE porque nenhum sistema aceitará essa entidade em seu filtro.
// - Os sistemas combinam as flags exigidas e verificam todos os requisitos com
//   uma única comparação bitwise, sem procurar dados em objetos separados.
//
// As operações públicas escrevem ou limpam o ComponentStorage correspondente e
// atualizam a máscara no mesmo lugar, evitando que o jogo esqueça uma das etapas.
// Propriedades com _ permanecem inspecionáveis para testes e experimentação, mas
// não fazem parte do caminho público principal.
// ============================================================================
export class ComponentManager {
  constructor(entityCapacity) {
    this.masksUint32Array = new Uint32Array(entityCapacity);
    this._transformComponentStorage = new TransformComponentStorage(entityCapacity);
    this._velocityComponentStorage = new VelocityComponentStorage(entityCapacity);
    this._colliderComponentStorage = new ColliderComponentStorage(entityCapacity);
    this._colorComponentStorage = new ColorComponentStorage(entityCapacity);
    this._directionalMovementInputComponentStorage = new DirectionalMovementInputComponentStorage(entityCapacity);
    this._orbitComponentStorage = new OrbitComponentStorage(entityCapacity);
    this._reverseVelocityAtBoundsComponentStorage = new ReverseVelocityAtBoundsComponentStorage(entityCapacity);
  }

  // ============================================================================
  // COMPONENT SETTERS — ESCREVEM OS DADOS E ATIVAM A FLAG CORRESPONDENTE
  // ============================================================================
  transformAdd(entityId, positionX, positionY, width, height) {
    this._transformComponentStorage.set(entityId, positionX, positionY, width, height);
    this._addComponent(entityId, COMPONENT_FLAGS.TRANSFORM);
  }

  // Atualiza somente a posição de uma entidade que já possui Transform.
  transformSetPosition(entityId, positionX, positionY) {
    this._transformComponentStorage.positionXFloat32Array[entityId] = positionX;
    this._transformComponentStorage.positionYFloat32Array[entityId] = positionY;
  }

  velocityAdd(entityId, velocityX, velocityY, maxSpeed) {
    this._velocityComponentStorage.set(entityId, velocityX, velocityY, maxSpeed);
    this._addComponent(entityId, COMPONENT_FLAGS.VELOCITY);
  }

  colliderAdd(entityId, width, height, responseType, rebuildType, offsetX, offsetY) {
    this._colliderComponentStorage.set(entityId, width, height, responseType, rebuildType, offsetX, offsetY);
    this._addComponent(entityId, COMPONENT_FLAGS.COLLIDER);
  }

  colorAdd(entityId, color) {
    this._colorComponentStorage.set(entityId, color);
    this._addComponent(entityId, COMPONENT_FLAGS.COLOR);
  }

  // Atualiza somente a cor de uma entidade que já possui Render.
  colorSet(entityId, color) {
    this._colorComponentStorage.colorArray[entityId] = color;
  }

  // Oculta ou mostra sem apagar os dados de renderização já armazenados.
  colorSetVisibility(entityId, visible) {
    if (visible) {
      this._addComponent(entityId, COMPONENT_FLAGS.COLOR);
    } else {
      this._removeComponent(entityId, COMPONENT_FLAGS.COLOR);
    }
  }

  directionalMovementInputAdd(entityId, directionalBindingId) {
    this._directionalMovementInputComponentStorage.set(entityId, directionalBindingId);
    this._addComponent(entityId, COMPONENT_FLAGS.DIRECTIONAL_MOVEMENT_INPUT);
  }

  reverseVelocityAtBoundsAdd(entityId, axis, minimum, maximum) {
    this._reverseVelocityAtBoundsComponentStorage.set(entityId, axis, minimum, maximum);
    this._addComponent(entityId, COMPONENT_FLAGS.REVERSE_VELOCITY_AT_BOUNDS);
  }

  orbitAdd(entityId, centerX, centerY, radius, angularVelocity, initialAngle) {
    this._orbitComponentStorage.set(entityId, centerX, centerY, radius, angularVelocity, initialAngle);
    this._addComponent(entityId, COMPONENT_FLAGS.ORBIT);
  }

  // ============================================================================
  // COMPONENT REMOVERS — LIMPAM OS DADOS E DESATIVAM A FLAG CORRESPONDENTE
  // ============================================================================
  transformRemove(entityId) {
    this._transformComponentStorage.remove(entityId);
    this._removeComponent(entityId, COMPONENT_FLAGS.TRANSFORM);
  }

  velocityRemove(entityId) {
    this._velocityComponentStorage.remove(entityId);
    this._removeComponent(entityId, COMPONENT_FLAGS.VELOCITY);
  }

  colliderRemove(entityId) {
    this._colliderComponentStorage.remove(entityId);
    this._removeComponent(entityId, COMPONENT_FLAGS.COLLIDER);
  }

  colorRemove(entityId) {
    this._colorComponentStorage.remove(entityId);
    this._removeComponent(entityId, COMPONENT_FLAGS.COLOR);
  }

  directionalMovementInputRemove(entityId) {
    this._directionalMovementInputComponentStorage.remove(entityId);
    this._removeComponent(entityId, COMPONENT_FLAGS.DIRECTIONAL_MOVEMENT_INPUT);
  }

  reverseVelocityAtBoundsRemove(entityId) {
    this._reverseVelocityAtBoundsComponentStorage.remove(entityId);
    this._removeComponent(entityId, COMPONENT_FLAGS.REVERSE_VELOCITY_AT_BOUNDS);
  }

  orbitRemove(entityId) {
    this._orbitComponentStorage.remove(entityId);
    this._removeComponent(entityId, COMPONENT_FLAGS.ORBIT);
  }

  // ============================================================================
  // RESET GERAL — LIMPA OS DADOS DE TODOS OS COMPONENTES
  // ============================================================================
  clearAll() {
    this.masksUint32Array.fill(0);
    this._transformComponentStorage.clearAll();
    this._velocityComponentStorage.clearAll();
    this._colliderComponentStorage.clearAll();
    this._colorComponentStorage.clearAll();
    this._directionalMovementInputComponentStorage.clearAll();
    this._orbitComponentStorage.clearAll();
    this._reverseVelocityAtBoundsComponentStorage.clearAll();
  }

  // ============================================================================
  // UNDER THE HOOD — MANUTENÇÃO DAS MÁSCARAS ECS
  // ============================================================================
  _addComponent(entityId, componentFlag) {
    this.masksUint32Array[entityId] |= componentFlag;
  }

  _removeComponent(entityId, componentFlag) {
    this.masksUint32Array[entityId] &= ~componentFlag;
  }

  _clearEntityComponents(entityId) {
    this._transformComponentStorage.remove(entityId);
    this._velocityComponentStorage.remove(entityId);
    this._colliderComponentStorage.remove(entityId);
    this._colorComponentStorage.remove(entityId);
    this._directionalMovementInputComponentStorage.remove(entityId);
    this._orbitComponentStorage.remove(entityId);
    this._reverseVelocityAtBoundsComponentStorage.remove(entityId);
    this.masksUint32Array[entityId] = 0;
  }
}
