// ============================================================================
// LIMITES PARA INVERSÃO DE VELOCIDADE (ReverseVelocityAtBoundsComponentStorage)
// ============================================================================
// Guarda uma regra simples de movimento repetitivo para cada entidade. Por
// exemplo: um inimigo sobe até Y = 220, desce até Y = 360 e repete esse caminho.
//
// Este componente não move a entidade. Ele apenas informa em qual eixo e entre
// quais posições o ReverseVelocityAtBoundsSystem deve inverter sua velocidade.
// ============================================================================
export class ReverseVelocityAtBoundsComponentStorage {
  constructor(capacity) {
    this.capacity = capacity;

    this.axisUint8Array = new Uint8Array(capacity);
    this.minimumFloat32Array = new Float32Array(capacity);
    this.maximumFloat32Array = new Float32Array(capacity);
  }

  set(entityId, axis, minimum, maximum) {
    this.axisUint8Array[entityId] = axis;
    this.minimumFloat32Array[entityId] = minimum;
    this.maximumFloat32Array[entityId] = maximum;
  }

  remove(entityId) {
    this.axisUint8Array[entityId] = 0;
    this.minimumFloat32Array[entityId] = 0;
    this.maximumFloat32Array[entityId] = 0;
  }

  clearAll() {
    this.axisUint8Array.fill(0);
    this.minimumFloat32Array.fill(0);
    this.maximumFloat32Array.fill(0);
  }
}
