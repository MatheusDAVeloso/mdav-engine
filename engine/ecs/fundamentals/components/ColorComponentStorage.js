// Armazena a cor CSS das entidades que podem ser desenhadas pelo RenderSystem.
export class ColorComponentStorage {
  constructor(capacity) {
    this.capacity = capacity;

    // CanvasRenderingContext2D.fillStyle recebe strings CSS diretamente.
    // As strings podem ser compartilhadas entre entidades e não são recriadas por frame.
    this.colorArray = new Array(capacity);
  }

  set(entityId, color) {
    this.colorArray[entityId] = color;
  }

  remove(entityId) {
    this.colorArray[entityId] = undefined;
  }

  clearAll() {
    this.colorArray.fill(undefined);
  }
}
