import { COMPONENT_FLAGS } from '../../ComponentFlags.js';

// Move entidades em uma circunferência usando ângulo, centro e raio explícitos.
export class OrbitSystem {
  update(entityManager, masks, transforms, orbits, deltaTime) {
    const requiredMask = COMPONENT_FLAGS.TRANSFORM | COMPONENT_FLAGS.ORBIT;
    const totalEntities = entityManager.nextEntityId;
    const activeStates = entityManager.activeStateUint8Array;
    const positionX = transforms.positionXFloat32Array;
    const positionY = transforms.positionYFloat32Array;
    const widths = transforms.widthFloat32Array;
    const heights = transforms.heightFloat32Array;
    const centerX = orbits.centerXFloat32Array;
    const centerY = orbits.centerYFloat32Array;
    const radii = orbits.radiusFloat32Array;
    const angularVelocities = orbits.angularVelocityFloat32Array;
    const angles = orbits.angleFloat32Array;

    for (let entityId = 0; entityId < totalEntities; entityId++) {
      if (activeStates[entityId] === 0 || (masks[entityId] & requiredMask) !== requiredMask) {
        continue;
      }

      const angle = angles[entityId] + angularVelocities[entityId] * deltaTime;
      angles[entityId] = angle;

      // O centro da entidade percorre a circunferência. A metade do tamanho
      // converte esse ponto para o canto superior esquerdo do Transform.
      positionX[entityId] = centerX[entityId] + Math.cos(angle) * radii[entityId] - widths[entityId] * 0.5;
      positionY[entityId] = centerY[entityId] + Math.sin(angle) * radii[entityId] - heights[entityId] * 0.5;
    }
  }
}
