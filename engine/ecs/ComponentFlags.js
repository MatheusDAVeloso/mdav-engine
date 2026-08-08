// MÁSCARAS DE BITS PADRÃO PARA COMPONENTES DA ENGINE
// Cada componente possui uma flag de bit única (potências de 2).
// O operador Bit Shift (1 << n) desloca o bit '1' para a esquerda 'n' posições na memória.
// Isso garante que cada componente tenha um único bit ativado, permitindo combinar até 32 componentes em um Uint32Array sem sobreposição:
// - 1 << 0 = binário 00000001 = decimal 1
// - 1 << 1 = binário 00000010 = decimal 2
// - 1 << 2 = binário 00000100 = decimal 4
// - 1 << 3 = binário 00001000 = decimal 8
// - 1 << 4 = binário 00010000 = decimal 16
export const COMPONENT_FLAGS = {
  TRANSFORM: 1 << 0,        // 00000001 (1)  - Posição, Rotação e Escala no mundo
  VELOCITY: 1 << 1,         // 00000010 (2)  - Vetor de Movimento (vx, vy)
  COLLIDER: 1 << 2,         // 00000100 (4)  - Caixa de Colisão AABB / Retangular
  COLOR: 1 << 3,            // 00001000 (8)  - Cor CSS usada na renderização
  DIRECTIONAL_MOVEMENT_INPUT: 1 << 4, // 00010000 (16) - Binding que controla Velocity em dois eixos
  REVERSE_VELOCITY_AT_BOUNDS: 1 << 5, // 00100000 (32) - Inverte velocidade ao alcançar limites
  ORBIT: 1 << 6                       // 01000000 (64) - Movimento circular ao redor de um ponto
};
