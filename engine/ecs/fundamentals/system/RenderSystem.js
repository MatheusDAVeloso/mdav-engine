import { COMPONENT_FLAGS } from '../../ComponentFlags.js';

// Sistema responsável por desenhar as entidades no Canvas 2D
export class RenderSystem {
  constructor(backgroundColor) {
    // A cor é obrigatória para que o estado inicial do Canvas seja uma decisão
    // explícita do jogo, em vez de um padrão escondido dentro da engine.
    this.backgroundColor = backgroundColor;
  }

  // Permite trocar a cor do fundo sem recriar o sistema de renderização.
  setBackgroundColor(backgroundColor) {
    this.backgroundColor = backgroundColor;
  }

  // Preenche o fundo e desenha todas as entidades visíveis com Transform e Renderer.
  update(context, entityManager, masks, transforms, colors, width, height) {
    if (!context) return;

    // O preenchimento cobre completamente o frame anterior e também define o fundo.
    context.fillStyle = this.backgroundColor;
    context.fillRect(0, 0, width, height);

    const requiredMask = COMPONENT_FLAGS.TRANSFORM | COMPONENT_FLAGS.COLOR;
    const totalEntities = entityManager.nextEntityId;

    const activeStates = entityManager.activeStateUint8Array;
    const positionX = transforms.positionXFloat32Array;
    const positionY = transforms.positionYFloat32Array;
    const widths = transforms.widthFloat32Array;
    const heights = transforms.heightFloat32Array;
    const colorValues = colors.colorArray;

    for (let entityId = 0; entityId < totalEntities; entityId++) {
      // A ausência da flag COLOR também representa uma entidade temporariamente
      // invisível, evitando manter outro array somente para essa informação.
      if (
        activeStates[entityId] === 0 ||
        (masks[entityId] & requiredMask) !== requiredMask
      ) {
        continue;
      }
      
      // Renderiza a entidade
      context.fillStyle = colorValues[entityId];
      context.fillRect(
        positionX[entityId],
        positionY[entityId],
        widths[entityId],
        heights[entityId]
      );
    }
  }
}
