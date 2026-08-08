import { COMPONENT_FLAGS } from '../../ComponentFlags.js';
import { SpatialHashGrid } from '../../../spatial/SpatialHashGrid.js';
import {
  COLLIDER_REBUILD_TYPE,
  COLLIDER_RESPONSE_TYPE,
} from '../../../configuration/ColliderConfiguration.js';
import { SPATIAL_HASH_REBUILD_TYPE } from '../../../configuration/CollisionSystemConfiguration.js';


// ============================================================================
// SISTEMA DE COLISÃO COM PARTICIONAMENTO ESPACIAL (Spatial Hash Grid)
// ============================================================================
// Divide o mundo em células e procura colisões somente entre objetos próximos.
// Preparar e consultar essas células tem um custo extra, mas evita comparar
// objetos que não poderiam colidir porque estão em regiões distantes do mapa.
//
// É uma boa escolha para um labirinto com muitas paredes estáticas, mapas grandes
// de exploração, jogos com hordas de inimigos, bullet hell com muitos projéteis
// ou fases extensas em que os objetos ficam espalhados por regiões diferentes.
//
// SPATIAL_HASH_REBUILD_TYPE.ALL usa uma grade e reinsere todos os colliders em
// cada frame. É útil quando quase tudo se move. EVERY_FRAME_ONLY preserva uma
// grade BUILD_ONCE e reconstrói apenas a grade dos objetos móveis; é útil, por
// exemplo, em labirintos com muitas paredes estáticas.
// ============================================================================
export class SpatialCollisionSystem {
  constructor(cellSize, rebuildType) {
    if (!Number.isFinite(cellSize) || cellSize <= 0) {
      throw new Error('[SpatialCollisionSystem] cellSize deve ser maior que zero.');
    }

    if (
      rebuildType !== SPATIAL_HASH_REBUILD_TYPE.ALL &&
      rebuildType !== SPATIAL_HASH_REBUILD_TYPE.EVERY_FRAME_ONLY
    ) {
      throw new Error(`[SpatialCollisionSystem] Rebuild type desconhecido: ${rebuildType}`);
    }

    this.rebuildType = rebuildType;
    this.spatialGrid = rebuildType === SPATIAL_HASH_REBUILD_TYPE.ALL
      ? new SpatialHashGrid(cellSize)
      : null;
    this.buildOnceSpatialGrid = rebuildType === SPATIAL_HASH_REBUILD_TYPE.EVERY_FRAME_ONLY
      ? new SpatialHashGrid(cellSize)
      : null;
    this.everyFrameSpatialGrid = rebuildType === SPATIAL_HASH_REBUILD_TYPE.EVERY_FRAME_ONLY
      ? new SpatialHashGrid(cellSize)
      : null;
    this.isBuildOnceGridBuilt = false;
  }

  update(entityManager, masks, transforms, velocities, colliders, onTriggerCollision) {
    // A política é escolhida uma vez por frame. O custo desta decisão é pequeno
    // perto do trabalho de inserir entidades, consultar células e testar pares.
    if (this.rebuildType === SPATIAL_HASH_REBUILD_TYPE.ALL) {
      this._updateRebuildAll(
        entityManager, masks, transforms, velocities, colliders, onTriggerCollision
      );
      return;
    }

    this._updateEveryFrameOnly(
      entityManager, masks, transforms, velocities, colliders, onTriggerCollision
    );
  }

  // ============================================================================
  // REBUILD ALL — UMA GRADE RECONSTRUÍDA POR COMPLETO EM CADA FRAME
  // ============================================================================
  _updateRebuildAll(
    entityManager, masks, transforms, velocities, colliders, onTriggerCollision
  ) {
    // Este caminho é indicado quando grande parte dos objetos pode se mover.
    // Como a posição anterior deixa de ser confiável, a grade inteira é apagada
    // e preenchida novamente usando o estado atual dos TransformComponents.
    const requiredMask = COMPONENT_FLAGS.TRANSFORM | COMPONENT_FLAGS.COLLIDER;
    const totalEntities = entityManager.nextEntityId;
    const activeStates = entityManager.activeStateUint8Array;
    const positionX = transforms.positionXFloat32Array;
    const positionY = transforms.positionYFloat32Array;
    const widths = colliders.widthFloat32Array;
    const heights = colliders.heightFloat32Array;
    const offsetX = colliders.offsetXFloat32Array;
    const offsetY = colliders.offsetYFloat32Array;
    const rebuildTypes = colliders.rebuildTypeUint8Array;

    // clearAll() remove as posições registradas no frame anterior. Ele não remove
    // entidades do ECS; limpa somente a estrutura usada para procurar vizinhos.
    this.spatialGrid.clearAll();

    for (let entityAId = 0; entityAId < totalEntities; entityAId++) {
      // Uma entidade precisa estar ativa e possuir Transform + Collider. A
      // máscara permite verificar os dois requisitos com uma única comparação.
      if (
        activeStates[entityAId] === 0 ||
        (masks[entityAId] & requiredMask) !== requiredMask
      ) {
        continue;
      }

      const leftA = positionX[entityAId] + offsetX[entityAId];
      const topA = positionY[entityAId] + offsetY[entityAId];

      // Inserimos antes de consultar. A grade contém somente entidades com IDs
      // visitados anteriormente e a própria A, que getNearby() ignora. Assim o
      // par A-B é processado uma vez, sem aparecer novamente como B-A.
      this.spatialGrid.insert(
        entityAId, leftA, topA, widths[entityAId], heights[entityAId]
      );

      const nearbyEntities = this.spatialGrid.getNearby(
        entityAId, leftA, topA, widths[entityAId], heights[entityAId]
      );

      for (const entityBId of nearbyEntities) {
        // Dois BUILD_ONCE não se movem nem precisam de separação entre si. O par
        // pode ser descartado antes do cálculo matemático de sobreposição AABB.
        if (
          rebuildTypes[entityAId] === COLLIDER_REBUILD_TYPE.BUILD_ONCE &&
          rebuildTypes[entityBId] === COLLIDER_REBUILD_TYPE.BUILD_ONCE
        ) {
          continue;
        }

        this._testPair(
          entityAId, entityBId, positionX, positionY,
          widths, heights, offsetX, offsetY,
          masks, velocities, colliders, onTriggerCollision
        );
      }
    }
  }

  // ============================================================================
  // EVERY FRAME ONLY — GRADES ESTÁTICA E DINÂMICA SEPARADAS
  // ============================================================================
  _updateEveryFrameOnly(
    entityManager, masks, transforms, velocities, colliders, onTriggerCollision
  ) {
    // Este caminho é indicado para mapas com muitos objetos imóveis, como as
    // paredes de um labirinto. BUILD_ONCE fica guardado entre frames, enquanto
    // jogadores, inimigos e projéteis EVERY_FRAME são atualizados continuamente.
    const requiredMask = COMPONENT_FLAGS.TRANSFORM | COMPONENT_FLAGS.COLLIDER;
    const totalEntities = entityManager.nextEntityId;
    const activeStates = entityManager.activeStateUint8Array;
    const positionX = transforms.positionXFloat32Array;
    const positionY = transforms.positionYFloat32Array;
    const widths = colliders.widthFloat32Array;
    const heights = colliders.heightFloat32Array;
    const offsetX = colliders.offsetXFloat32Array;
    const offsetY = colliders.offsetYFloat32Array;
    const rebuildTypes = colliders.rebuildTypeUint8Array;

    // ETAPA 1 — CONSTRUIR A GRADE ESTÁTICA UMA ÚNICA VEZ
    // A primeira execução registra paredes e outros BUILD_ONCE. Nas execuções
    // seguintes, a grade continua representando as mesmas posições.
    if (!this.isBuildOnceGridBuilt) {
      this.buildOnceSpatialGrid.clearAll();

      for (let entityId = 0; entityId < totalEntities; entityId++) {
        // EVERY_FRAME não entra aqui porque sua posição pode mudar. Também são
        // ignorados IDs destruídos ou sem os componentes necessários.
        if (
          activeStates[entityId] === 0 ||
          (masks[entityId] & requiredMask) !== requiredMask ||
          rebuildTypes[entityId] !== COLLIDER_REBUILD_TYPE.BUILD_ONCE
        ) {
          continue;
        }

        // O offset permite que a caixa de colisão fique deslocada do desenho ou
        // da posição principal da entidade armazenada no TransformComponent.
        this.buildOnceSpatialGrid.insert(
          entityId,
          positionX[entityId] + offsetX[entityId],
          positionY[entityId] + offsetY[entityId],
          widths[entityId],
          heights[entityId]
        );
      }

      this.isBuildOnceGridBuilt = true;
    }

    // ETAPA 2 — RECONSTRUIR SOMENTE A GRADE DINÂMICA
    // As posições dos EVERY_FRAME podem ter sido alteradas pelo MovementSystem,
    // portanto os registros do frame anterior não podem ser reaproveitados.
    this.everyFrameSpatialGrid.clearAll();

    // ETAPA 3 — INSERIR CADA DINÂMICO E PROCURAR VIZINHOS PRÓXIMOS
    for (let entityAId = 0; entityAId < totalEntities; entityAId++) {
      // Somente EVERY_FRAME inicia buscas neste caminho. Os BUILD_ONCE já estão
      // guardados na grade estática e serão encontrados quando estiverem perto.
      if (
        activeStates[entityAId] === 0 ||
        (masks[entityAId] & requiredMask) !== requiredMask ||
        rebuildTypes[entityAId] !== COLLIDER_REBUILD_TYPE.EVERY_FRAME
      ) {
        continue;
      }

      const leftA = positionX[entityAId] + offsetX[entityAId];
      const topA = positionY[entityAId] + offsetY[entityAId];

      // A posição atual é registrada antes da consulta. getNearby() remove a
      // própria entidade do resultado, evitando uma colisão dela com ela mesma.
      this.everyFrameSpatialGrid.insert(
        entityAId,
        leftA,
        topA,
        widths[entityAId],
        heights[entityAId]
      );

      const nearbyBuildOnceEntities = this.buildOnceSpatialGrid.getNearby(
        entityAId, leftA, topA, widths[entityAId], heights[entityAId]
      );
      const nearbyEveryFrameEntities = this.everyFrameSpatialGrid.getNearby(
        entityAId, leftA, topA, widths[entityAId], heights[entityAId]
      );

      // BUILD_ONCE não inicia buscas. Cada dinâmico consulta as paredes próximas
      // e envia somente esses candidatos para a confirmação exata da colisão.
      for (const entityBId of nearbyBuildOnceEntities) {
        this._testPair(
          entityAId, entityBId, positionX, positionY,
          widths, heights, offsetX, offsetY,
          masks, velocities, colliders, onTriggerCollision
        );
      }

      // A grade dinâmica contém apenas EVERY_FRAME visitados anteriormente.
      // Isso evita testar duas vezes o mesmo par de jogadores ou projéteis.
      for (const entityBId of nearbyEveryFrameEntities) {
        this._testPair(
          entityAId, entityBId, positionX, positionY,
          widths, heights, offsetX, offsetY,
          masks, velocities, colliders, onTriggerCollision
        );
      }
    }
  }

  // ============================================================================
  // TEST PAIR
  // ============================================================================

  _testPair(
    entityAId,
    entityBId,
    positionX,
    positionY,
    widths,
    heights,
    offsetX,
    offsetY,
    masks,
    velocities,
    colliders,
    onTriggerCollision
  ) {
    // _testPair recebe um par candidato encontrado pela grade. Compartilhar uma
    // célula reduz a busca, mas não garante que as caixas realmente se toquem.
    // ETAPA 4 — CONFIRMAR A SOBREPOSIÇÃO AABB (narrow phase)
    // Chegar até aqui significa apenas que as entidades ocupam pelo menos uma
    // célula em comum. Agora suas quatro bordas reais precisam ser comparadas.
    const leftA = positionX[entityAId] + offsetX[entityAId];
    const topA = positionY[entityAId] + offsetY[entityAId];
    const leftB = positionX[entityBId] + offsetX[entityBId];
    const topB = positionY[entityBId] + offsetY[entityBId];

    const isOverlapping =
      leftA < leftB + widths[entityBId] &&
      leftA + widths[entityAId] > leftB &&
      topA < topB + heights[entityBId] &&
      topA + heights[entityAId] > topB;

    if (isOverlapping) {
      // ETAPA 5 — ESCOLHER A RESPOSTA DO CONTATO
      // A partir daqui o Spatial Grid já terminou seu trabalho. A resposta usa
      // somente as bordas confirmadas e as configurações dos dois colliders.
      const responseTypes = colliders.responseTypeUint8Array;

      // Basta um dos colliders ser TRIGGER para o par inteiro não produzir
      // separação física. O jogo recebe somente os dois IDs envolvidos.
      if (
        responseTypes[entityAId] === COLLIDER_RESPONSE_TYPE.TRIGGER ||
        responseTypes[entityBId] === COLLIDER_RESPONSE_TYPE.TRIGGER
      ) {
        if (onTriggerCollision) onTriggerCollision(entityAId, entityBId);
        return;
      }

      // ETAPA 6 — DESCOBRIR QUEM PODE SER REPOSICIONADO
      // BUILD_ONCE permanece na posição usada para construir sua grade.
      // EVERY_FRAME pode mudar porque será reinserido no próximo frame.
      const rebuildTypes = colliders.rebuildTypeUint8Array;
      const entityARebuildsEveryFrame = rebuildTypes[entityAId] === COLLIDER_REBUILD_TYPE.EVERY_FRAME;
      const entityBRebuildsEveryFrame = rebuildTypes[entityBId] === COLLIDER_REBUILD_TYPE.EVERY_FRAME;
      const rightA = leftA + widths[entityAId];
      const bottomA = topA + heights[entityAId];
      const rightB = leftB + widths[entityBId];
      const bottomB = topB + heights[entityBId];

      // ETAPA 7 — CALCULAR PROFUNDIDADE E DIREÇÃO
      // Math.min escolhe, em cada eixo, a menor distância capaz de desfazer a
      // sobreposição. Comparar os centros determina o sinal dessa distância.
      const overlapX = Math.min(rightA - leftB, rightB - leftA);
      const overlapY = Math.min(bottomA - topB, bottomB - topA);
      const correctionX = leftA + rightA < leftB + rightB ? -overlapX : overlapX;
      const correctionY = topA + bottomA < topB + bottomB ? -overlapY : overlapY;
      const velocityX = velocities.velocityXFloat32Array;
      const velocityY = velocities.velocityYFloat32Array;

      // ETAPA 8 — RESOLVER SOMENTE O EIXO DE MENOR PENETRAÇÃO
      // Isso impede atravessamento sem bloquear o outro eixo, permitindo que uma
      // entidade continue deslizando paralelamente à superfície atingida.
      if (overlapX <= overlapY) {
        // Dois EVERY_FRAME dividem igualmente a correção. Contra BUILD_ONCE,
        // somente o EVERY_FRAME percorre a distância completa.
        if (entityARebuildsEveryFrame && entityBRebuildsEveryFrame) {
          positionX[entityAId] += correctionX * 0.5;
          positionX[entityBId] -= correctionX * 0.5;
        } else if (entityARebuildsEveryFrame) {
          positionX[entityAId] += correctionX;
        } else {
          positionX[entityBId] -= correctionX;
        }

        // A velocidade é opcional. Quando existe, apenas o eixo que apontava
        // para a barreira é zerado; o eixo perpendicular continua intacto.
        if (entityARebuildsEveryFrame && (masks[entityAId] & COMPONENT_FLAGS.VELOCITY) !== 0) {
          velocityX[entityAId] = 0;
        }
        if (entityBRebuildsEveryFrame && (masks[entityBId] & COMPONENT_FLAGS.VELOCITY) !== 0) {
          velocityX[entityBId] = 0;
        }
        return;
      }

      // A penetração vertical foi menor; repete a mesma distribuição no eixo Y.
      if (entityARebuildsEveryFrame && entityBRebuildsEveryFrame) {
        positionY[entityAId] += correctionY * 0.5;
        positionY[entityBId] -= correctionY * 0.5;
      } else if (entityARebuildsEveryFrame) {
        positionY[entityAId] += correctionY;
      } else {
        positionY[entityBId] -= correctionY;
      }

      // velocityX não é alterada nesta ramificação, preservando o deslizamento.
      if (entityARebuildsEveryFrame && (masks[entityAId] & COMPONENT_FLAGS.VELOCITY) !== 0) {
        velocityY[entityAId] = 0;
      }
      if (entityBRebuildsEveryFrame && (masks[entityBId] & COMPONENT_FLAGS.VELOCITY) !== 0) {
        velocityY[entityBId] = 0;
      }
    }
  }
}
