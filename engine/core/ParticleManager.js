// ============================================================================
// GERENCIADOR DE PARTÍCULAS (ParticleManager)
// ============================================================================
// Mantém um pool fixo de partículas visuais independentes das entidades ECS.
// O jogo solicita um efeito somente por emit(). A Engine chama _update() e
// _render() internamente enquanto o game loop estiver em execução.
//
// A velocidade recebida representa a intensidade do movimento. Para cada
// partícula, emit() escolhe um ângulo dentro do arco informado e decompõe essa
// velocidade em velocityX e velocityY uma única vez.
// ============================================================================
export class ParticleManager {
  constructor(capacity) {
    this.capacity = capacity;
    this.nextSearchIndex = 0;

    this.activeStateUint8Array = new Uint8Array(capacity);
    this.positionXFloat32Array = new Float32Array(capacity);
    this.positionYFloat32Array = new Float32Array(capacity);
    this.velocityXFloat32Array = new Float32Array(capacity);
    this.velocityYFloat32Array = new Float32Array(capacity);
    this.remainingLifetimeFloat32Array = new Float32Array(capacity);
    this.initialLifetimeFloat32Array = new Float32Array(capacity);
    this.sizeFloat32Array = new Float32Array(capacity);
    this.colorArray = new Array(capacity);
  }

  // Emite até quantity partículas nos slots livres do pool.
  // Retorna quantas realmente foram emitidas caso o pool esteja cheio.
  emit(
    positionX,
    positionY,
    colors,
    quantity,
    minimumSpeed,
    maximumSpeed,
    minimumLifetime,
    maximumLifetime,
    minimumSize,
    maximumSize,
    angleStart,
    angleEnd
  ) {
    let emittedCount = 0;
    const searchStartIndex = this.nextSearchIndex;

    for (let particleIndex = 0; particleIndex < this.capacity && emittedCount < quantity; particleIndex++) {
      const slotIndex = (searchStartIndex + particleIndex) % this.capacity;
      if (this.activeStateUint8Array[slotIndex] === 1) continue;

      const angle = angleStart + Math.random() * (angleEnd - angleStart);
      const speed = minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
      const lifetime = minimumLifetime + Math.random() * (maximumLifetime - minimumLifetime);
      const size = minimumSize + Math.random() * (maximumSize - minimumSize);
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.activeStateUint8Array[slotIndex] = 1;
      this.positionXFloat32Array[slotIndex] = positionX;
      this.positionYFloat32Array[slotIndex] = positionY;
      this.velocityXFloat32Array[slotIndex] = Math.cos(angle) * speed;
      this.velocityYFloat32Array[slotIndex] = Math.sin(angle) * speed;
      this.remainingLifetimeFloat32Array[slotIndex] = lifetime;
      this.initialLifetimeFloat32Array[slotIndex] = lifetime;
      this.sizeFloat32Array[slotIndex] = size;
      this.colorArray[slotIndex] = color;

      emittedCount++;
      this.nextSearchIndex = (slotIndex + 1) % this.capacity;
    }

    return emittedCount;
  }

  clearAll() {
    this.activeStateUint8Array.fill(0);
    this.positionXFloat32Array.fill(0);
    this.positionYFloat32Array.fill(0);
    this.velocityXFloat32Array.fill(0);
    this.velocityYFloat32Array.fill(0);
    this.remainingLifetimeFloat32Array.fill(0);
    this.initialLifetimeFloat32Array.fill(0);
    this.sizeFloat32Array.fill(0);
    this.colorArray.fill(null);
    this.nextSearchIndex = 0;
  }

  // Atualiza somente slots ativos. Quando o tempo termina, o slot volta
  // imediatamente ao pool e poderá ser reutilizado pela próxima emissão.
  _update(deltaTime) {
    for (let particleId = 0; particleId < this.capacity; particleId++) {
      if (this.activeStateUint8Array[particleId] === 0) continue;

      const remainingLifetime = this.remainingLifetimeFloat32Array[particleId] - deltaTime;
      if (remainingLifetime <= 0) {
        this.activeStateUint8Array[particleId] = 0;
        this.remainingLifetimeFloat32Array[particleId] = 0;
        continue;
      }

      this.remainingLifetimeFloat32Array[particleId] = remainingLifetime;
      this.positionXFloat32Array[particleId] += this.velocityXFloat32Array[particleId] * deltaTime;
      this.positionYFloat32Array[particleId] += this.velocityYFloat32Array[particleId] * deltaTime;
    }
  }

  // O alpha diminui proporcionalmente ao tempo restante, sem criar objetos.
  _render(context) {
    if (!context) return;

    context.save();

    for (let particleId = 0; particleId < this.capacity; particleId++) {
      if (this.activeStateUint8Array[particleId] === 0) continue;

      context.globalAlpha = this.remainingLifetimeFloat32Array[particleId] / this.initialLifetimeFloat32Array[particleId];
      context.fillStyle = this.colorArray[particleId];
      const size = this.sizeFloat32Array[particleId];
      context.fillRect(
        this.positionXFloat32Array[particleId] - size * 0.5,
        this.positionYFloat32Array[particleId] - size * 0.5,
        size,
        size
      );
    }

    context.restore();
  }
}
