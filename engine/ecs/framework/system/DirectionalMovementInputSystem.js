import { COMPONENT_FLAGS } from '../../ComponentFlags.js';

// Sistema responsável por aplicar os bindings do InputManager em todas as entidades controláveis.
export class DirectionalMovementInputSystem {
  // Atualiza a velocidade de todas as entidades com Input e Velocity.
  update(entityManager, masks, inputs, velocities, inputManager) {
    const requiredMask = COMPONENT_FLAGS.DIRECTIONAL_MOVEMENT_INPUT | COMPONENT_FLAGS.VELOCITY;
    const totalEntities = entityManager.nextEntityId;

    const activeStates = entityManager.activeStateUint8Array;
    const directionalBindingIds = inputs.directionalBindingIdUint16Array;
    const velocityX = velocities.velocityXFloat32Array;
    const velocityY = velocities.velocityYFloat32Array;
    const maxSpeeds = velocities.maxSpeedFloat32Array;

    for (let entityId = 0; entityId < totalEntities; entityId++) {
      // Ignora entidades destruídas ou sem os componentes Input e Velocity.
      if (activeStates[entityId] === 0 || (masks[entityId] & requiredMask) !== requiredMask) {
        continue;
      }

      const directionalBindingId = directionalBindingIds[entityId];
      const moveX = inputManager.getDirectionalBindingMoveX(directionalBindingId);
      const moveY = inputManager.getDirectionalBindingMoveY(directionalBindingId);

      // Como os eixos usam somente -1, 0 e 1, apenas a diagonal precisa ser
      // normalizada. Math.SQRT1_2 equivale a 1 / Math.sqrt(2).
      // Como este sistema escreve velocidade, ele deve respeitar maxSpeed.
      // A normalização mantém a magnitude do vetor dentro desse limite na diagonal.
      const diagonalMultiplier = moveX !== 0 && moveY !== 0 ? Math.SQRT1_2 : 1;
      const maxSpeed = maxSpeeds[entityId];

      velocityX[entityId] = moveX * diagonalMultiplier * maxSpeed;
      velocityY[entityId] = moveY * diagonalMultiplier * maxSpeed;
    }
  }
}
