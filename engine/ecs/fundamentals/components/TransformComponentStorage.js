// ============================================================================
// ARMAZENAMENTO DOS COMPONENTES DE TRANSFORMAÇÃO (TransformComponentStorage)
// ============================================================================
// Existe uma única instância deste armazenamento por mundo ECS. Em vez de criar
// um objeto Transform para cada entidade, cada propriedade possui um TypedArray
// próprio e usa o ID da entidade como índice.
//
// Exemplo: positionXFloat32Array[7] guarda a posição X da entidade de ID 7.
// Isso mantém valores do mesmo tipo juntos e evita objetos individuais no heap.
// A máscara do EntityManager continua sendo a fonte que informa se uma entidade
// realmente possui o componente Transform.
// ============================================================================
export class TransformComponentStorage {
  constructor(capacity) {
    this.capacity = capacity;

    this.positionXFloat32Array = new Float32Array(capacity);
    this.positionYFloat32Array = new Float32Array(capacity);
    this.widthFloat32Array = new Float32Array(capacity);
    this.heightFloat32Array = new Float32Array(capacity);
  }

  // Grava ou sobrescreve os dados Transform de uma entidade.
  set(entityId, positionX, positionY, width, height) {
    this.positionXFloat32Array[entityId] = positionX;
    this.positionYFloat32Array[entityId] = positionY;
    this.widthFloat32Array[entityId] = width;
    this.heightFloat32Array[entityId] = height;
  }

  // Zera o espaço de uma entidade para não preservar dados quando seu ID for reciclado.
  remove(entityId) {
    this.positionXFloat32Array[entityId] = 0;
    this.positionYFloat32Array[entityId] = 0;
    this.widthFloat32Array[entityId] = 0;
    this.heightFloat32Array[entityId] = 0;
  }

  // Limpa todos os componentes de uma vez ao reiniciar o mundo.
  clearAll() {
    this.positionXFloat32Array.fill(0);
    this.positionYFloat32Array.fill(0);
    this.widthFloat32Array.fill(0);
    this.heightFloat32Array.fill(0);
  }
}
