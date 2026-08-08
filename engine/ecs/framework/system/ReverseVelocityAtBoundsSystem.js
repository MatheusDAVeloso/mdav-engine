import { REVERSE_VELOCITY_AT_BOUNDS_AXIS } from '../../../configuration/ReverseVelocityAtBoundsConfiguration.js';
import { COMPONENT_FLAGS } from '../../ComponentFlags.js';

// ============================================================================
// INVERSÃO DE VELOCIDADE NOS LIMITES (ReverseVelocityAtBoundsSystem)
// ============================================================================
// Cria movimentos de ida e volta, como inimigos atravessando repetidamente um
// corredor, plataformas móveis e obstáculos que sobem e descem.
//
// O MovementSystem realiza o deslocamento primeiro. Depois, este sistema impede
// que a entidade continue além do intervalo configurado e troca o sentido da
// velocidade. Ele é útil para percursos simples; trajetórias com curvas, vários
// pontos ou decisões precisam de outro comportamento.
// ============================================================================
export class ReverseVelocityAtBoundsSystem {
  update(entityManager, masks, transforms, velocities, reverseVelocityAtBounds) {
    const requiredMask = COMPONENT_FLAGS.TRANSFORM
      | COMPONENT_FLAGS.VELOCITY
      | COMPONENT_FLAGS.REVERSE_VELOCITY_AT_BOUNDS;
      
    const totalEntities = entityManager.nextEntityId;

    const activeStates = entityManager.activeStateUint8Array;
    const positionX = transforms.positionXFloat32Array;
    const positionY = transforms.positionYFloat32Array;
    const velocityX = velocities.velocityXFloat32Array;
    const velocityY = velocities.velocityYFloat32Array;
    const axes = reverseVelocityAtBounds.axisUint8Array;
    const minimums = reverseVelocityAtBounds.minimumFloat32Array;
    const maximums = reverseVelocityAtBounds.maximumFloat32Array;

    for (let entityId = 0; entityId < totalEntities; entityId++) {
      if (activeStates[entityId] === 0 || (masks[entityId] & requiredMask) !== requiredMask) {
        continue;
      }

      const minimum = minimums[entityId];
      const maximum = maximums[entityId];

      if (axes[entityId] === REVERSE_VELOCITY_AT_BOUNDS_AXIS.X) {
        if (positionX[entityId] <= minimum && velocityX[entityId] < 0) {
          positionX[entityId] = minimum;
          velocityX[entityId] = -velocityX[entityId];
        } else if (positionX[entityId] >= maximum && velocityX[entityId] > 0) {
          positionX[entityId] = maximum;
          velocityX[entityId] = -velocityX[entityId];
        }
      } else if (axes[entityId] === REVERSE_VELOCITY_AT_BOUNDS_AXIS.Y) {
        if (positionY[entityId] <= minimum && velocityY[entityId] < 0) {
          positionY[entityId] = minimum;
          velocityY[entityId] = -velocityY[entityId];
        } else if (positionY[entityId] >= maximum && velocityY[entityId] > 0) {
          positionY[entityId] = maximum;
          velocityY[entityId] = -velocityY[entityId];
        }
      }
    }
  }
}
