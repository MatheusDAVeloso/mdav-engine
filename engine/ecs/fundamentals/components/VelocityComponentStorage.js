// Armazena, em memória contígua, a velocidade de todas as entidades do mundo ECS.
// velocityX e velocityY formam o vetor de velocidade atual; maxSpeed define
// sua magnitude máxima. O storage apenas guarda esses dados e não os corrige.
export class VelocityComponentStorage {
  constructor(capacity) {
    this.capacity = capacity;

    this.velocityXFloat32Array = new Float32Array(capacity);
    this.velocityYFloat32Array = new Float32Array(capacity);
    this.maxSpeedFloat32Array = new Float32Array(capacity);
  }

  set(entityId, velocityX, velocityY, maxSpeed) {
    this.velocityXFloat32Array[entityId] = velocityX;
    this.velocityYFloat32Array[entityId] = velocityY;
    this.maxSpeedFloat32Array[entityId] = maxSpeed;
  }

  remove(entityId) {
    this.velocityXFloat32Array[entityId] = 0;
    this.velocityYFloat32Array[entityId] = 0;
    this.maxSpeedFloat32Array[entityId] = 0;
  }

  clearAll() {
    this.velocityXFloat32Array.fill(0);
    this.velocityYFloat32Array.fill(0);
    this.maxSpeedFloat32Array.fill(0);
  }
}
