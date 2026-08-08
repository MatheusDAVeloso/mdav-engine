import { COMPONENT_FLAGS } from '../../ComponentFlags.js';
import {
  COLLIDER_REBUILD_TYPE,
  COLLIDER_RESPONSE_TYPE,
} from '../../../configuration/ColliderConfiguration.js';

// ============================================================================
// SISTEMA DE COLISÃO DIRETA (CollisionSystem)
// ============================================================================
// Verifica cada collider contra todos os outros, sem organizar o espaço antes.
// Isso deixa o começo do processamento leve, mas cria comparações demais quando
// a fase possui muitos objetos, mesmo que eles estejam muito distantes entre si.
//
// É uma boa escolha para uma sala pequena com jogador, paredes e poucos inimigos;
// uma arena compacta de chefe; ou um minigame em que quase tudo está próximo e
// pode realmente colidir. Não precisa preparar nem manter estruturas auxiliares.
//
// Pares somente entre BUILD_ONCE são descartados cedo. Ainda assim, mapas grandes
// com muitas paredes, decorações, inimigos ou projéteis fazem o sistema percorrer
// muitos pares, inclusive objetos que estão em lados opostos da fase.
// ============================================================================
export class CollisionSystem {
  // Verifica colisões entre todas as entidades ativas com Transform e Collider.
  update(entityManager, masks, transforms, velocities, colliders, onTriggerCollision) {
    const requiredMask = COMPONENT_FLAGS.TRANSFORM | COMPONENT_FLAGS.COLLIDER;
    const totalEntities = entityManager.nextEntityId;

    const activeStates = entityManager.activeStateUint8Array;
    const positionX = transforms.positionXFloat32Array;
    const positionY = transforms.positionYFloat32Array;
    const widths = colliders.widthFloat32Array;
    const heights = colliders.heightFloat32Array;
    const offsetX = colliders.offsetXFloat32Array;
    const offsetY = colliders.offsetYFloat32Array;
    const responseTypes = colliders.responseTypeUint8Array;
    const rebuildTypes = colliders.rebuildTypeUint8Array;
    const velocityX = velocities.velocityXFloat32Array;
    const velocityY = velocities.velocityYFloat32Array;

    // ALGORITMO DE COMBINAÇÃO DE PARES ÚNICOS (Combinação N escolha 2):
    // O segundo laço sempre começa no ID seguinte ao primeiro. Assim, uma entidade
    // nunca é testada contra si mesma e o par A-B nunca se repete como B-A.
    //
    // Exemplo com IDs [0, 1, 2]: testa 0-1, 0-2 e 1-2.
    for (let entityAId = 0; entityAId < totalEntities; entityAId++) {
      // Ignora entidades destruídas ou sem Transform e Collider.
      if (activeStates[entityAId] === 0 || (masks[entityAId] & requiredMask) !== requiredMask) {
        continue;
      }

      for (let entityBId = entityAId + 1; entityBId < totalEntities; entityBId++) {
        if (activeStates[entityBId] === 0 || (masks[entityBId] & requiredMask) !== requiredMask) {
          continue;
        }

        if (
          rebuildTypes[entityAId] === COLLIDER_REBUILD_TYPE.BUILD_ONCE &&
          rebuildTypes[entityBId] === COLLIDER_REBUILD_TYPE.BUILD_ONCE
        ) continue;

        // Uma colisão anterior pode ter corrigido A durante este mesmo update.
        // Por isso suas bordas são relidas antes de testar cada novo par.
        const leftA = positionX[entityAId] + offsetX[entityAId];
        const rightA = leftA + widths[entityAId];
        const topA = positionY[entityAId] + offsetY[entityAId];
        const bottomA = topA + heights[entityAId];
        const leftB = positionX[entityBId] + offsetX[entityBId];
        const rightB = leftB + widths[entityBId];
        const topB = positionY[entityBId] + offsetY[entityBId];
        const bottomB = topB + heights[entityBId];

        // MATEMÁTICA DE SOBREPOSIÇÃO AABB (Axis-Aligned Bounding Box)
        // Para duas caixas colidirem, elas precisam se sobrepor TANTO no eixo X QUANTO no eixo Y simultaneamente.
        // É mais fácil pensar pelo oposto: Se qualquer um dos lados estiver completamente fora do outro, NÃO há colisão.
        //
        // 1. leftA < rightB  -> A borda esquerda de A está antes da borda direita de B (A não está totalmente à direita de B)
        // 2. rightA > leftB  -> A borda direita de A está depois da borda esquerda de B (A não está totalmente à esquerda de B)
        // 3. topA < bottomB  -> O topo de A está acima da base de B (A não está totalmente abaixo de B)
        // 4. bottomA > topB  -> A base de A está abaixo do topo de B (A não está totalmente acima de B)
        const isOverlapping =
          leftA < rightB &&
          rightA > leftB &&
          topA < bottomB &&
          bottomA > topB;

        if (isOverlapping) {
          // ETAPA 1 — ESCOLHER A RESPOSTA DO CONTATO
          // A geometria já confirmou a colisão. Agora o tipo configurado em cada
          // collider decide se haverá somente evento ou correção de penetração.
          // Trigger apenas comunica a sobreposição; não altera posição ou velocidade.
          if (
            responseTypes[entityAId] === COLLIDER_RESPONSE_TYPE.TRIGGER ||
            responseTypes[entityBId] === COLLIDER_RESPONSE_TYPE.TRIGGER
          ) {
            if (onTriggerCollision) onTriggerCollision(entityAId, entityBId);
            continue;
          }

          // ETAPA 2 — DESCOBRIR QUEM PODE SER REPOSICIONADO
          // BUILD_ONCE representa uma localização fixa durante a cena.
          // EVERY_FRAME pode receber correção porque sua configuração declara
          // que a localização pode mudar durante a simulação da cena.
          const entityARebuildsEveryFrame = rebuildTypes[entityAId] === COLLIDER_REBUILD_TYPE.EVERY_FRAME;
          const entityBRebuildsEveryFrame = rebuildTypes[entityBId] === COLLIDER_REBUILD_TYPE.EVERY_FRAME;

          // ETAPA 3 — CALCULAR A MENOR DISTÂNCIA PARA SEPARAR AS CAIXAS
          // Em cada eixo existem duas saídas possíveis. Math.min escolhe a menor
          // penetração sem precisar descobrir primeiro de qual lado A chegou.
          const overlapX = Math.min(rightA - leftB, rightB - leftA);
          const overlapY = Math.min(bottomA - topB, bottomB - topA);

          // Compara os centros sem dividir por 2: somar as duas bordas produz o
          // dobro do centro. O resultado define o sinal da correção de A.
          const correctionX = leftA + rightA < leftB + rightB ? -overlapX : overlapX;
          const correctionY = topA + bottomA < topB + bottomB ? -overlapY : overlapY;

          // ETAPA 4 — CORRIGIR SOMENTE O EIXO DE MENOR PENETRAÇÃO
          // Corrigir os dois eixos prenderia o movimento diagonal. Corrigir apenas
          // o menor permite que a entidade continue deslizando ao longo da parede.
          if (overlapX <= overlapY) {
            // Se ambos usam EVERY_FRAME, cada um percorre metade da distância.
            // Caso contrário, toda a correção é aplicada ao único que pode mudar.
            if (entityARebuildsEveryFrame && entityBRebuildsEveryFrame) {
              positionX[entityAId] += correctionX * 0.5;
              positionX[entityBId] -= correctionX * 0.5;
            } else if (entityARebuildsEveryFrame) {
              positionX[entityAId] += correctionX;
            } else {
              positionX[entityBId] -= correctionX;
            }

            // A posição já não atravessa a barreira. Zerar somente velocityX
            // impede que a velocidade continue apontando para dentro dela.
            if (entityARebuildsEveryFrame && (masks[entityAId] & COMPONENT_FLAGS.VELOCITY) !== 0) {
              velocityX[entityAId] = 0;
            }
            if (entityBRebuildsEveryFrame && (masks[entityBId] & COMPONENT_FLAGS.VELOCITY) !== 0) {
              velocityX[entityBId] = 0;
            }
            continue;
          }

          // overlapY foi menor: aplica a mesma regra no eixo vertical.
          if (entityARebuildsEveryFrame && entityBRebuildsEveryFrame) {
            positionY[entityAId] += correctionY * 0.5;
            positionY[entityBId] -= correctionY * 0.5;
          } else if (entityARebuildsEveryFrame) {
            positionY[entityAId] += correctionY;
          } else {
            positionY[entityBId] -= correctionY;
          }

          // Somente o eixo corrigido é zerado; velocityX permanece disponível
          // para que a entidade deslize horizontalmente sobre a superfície.
          if (entityARebuildsEveryFrame && (masks[entityAId] & COMPONENT_FLAGS.VELOCITY) !== 0) {
            velocityY[entityAId] = 0;
          }
          if (entityBRebuildsEveryFrame && (masks[entityBId] & COMPONENT_FLAGS.VELOCITY) !== 0) {
            velocityY[entityBId] = 0;
          }
        }
      }
    }
  }
}
