import { COMPONENT_FLAGS } from '../../ComponentFlags.js';

// Sistema responsável por atualizar a posição das entidades com base na velocidade e no tempo (deltaTime)
export class MovementSystem {
  // Atualiza as posições de todas as entidades que possuem Transform e Velocity.
  // Os dados são lidos diretamente dos TypedArrays usando o ID da entidade como índice.
  update(entityManager, masks, transforms, velocities, deltaTime) {
    // Este sistema não escreve velocidade: apenas a aplica à posição.
    // maxSpeed é responsabilidade dos sistemas que escrevem velocityX e velocityY.
    const requiredMask = COMPONENT_FLAGS.TRANSFORM | COMPONENT_FLAGS.VELOCITY;
    const totalEntities = entityManager.nextEntityId;

    // Referências locais evitam repetir a busca das propriedades dos storages em cada entidade.
    const activeStates = entityManager.activeStateUint8Array;
    const positionX = transforms.positionXFloat32Array;
    const positionY = transforms.positionYFloat32Array;
    const velocityX = velocities.velocityXFloat32Array;
    const velocityY = velocities.velocityYFloat32Array;

    // O laço direto evita criar um callback a cada frame e mantém visível todo o
    // caminho quente: estado ativo -> máscara -> leitura e escrita numérica.
    for (let entityId = 0; entityId < totalEntities; entityId++) {
      // Ignora entidades destruídas ou que não possuem simultaneamente os componentes Transform e Velocity.
      if (activeStates[entityId] === 0 || (masks[entityId] & requiredMask) !== requiredMask) {
        continue;
      }

      positionX[entityId] += velocityX[entityId] * deltaTime;
      positionY[entityId] += velocityY[entityId] * deltaTime;
    }
  }
}
