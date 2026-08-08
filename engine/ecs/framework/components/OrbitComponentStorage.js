// Guarda os parâmetros matemáticos das órbitas das entidades.
export class OrbitComponentStorage {
  constructor(capacity) {
    this.capacity = capacity;
    this.centerXFloat32Array = new Float32Array(capacity);
    this.centerYFloat32Array = new Float32Array(capacity);
    this.radiusFloat32Array = new Float32Array(capacity);
    this.angularVelocityFloat32Array = new Float32Array(capacity);
    this.angleFloat32Array = new Float32Array(capacity);
  }

  set(entityId, centerX, centerY, radius, angularVelocity, initialAngle) {
    this.centerXFloat32Array[entityId] = centerX;
    this.centerYFloat32Array[entityId] = centerY;
    this.radiusFloat32Array[entityId] = radius;
    this.angularVelocityFloat32Array[entityId] = angularVelocity;
    this.angleFloat32Array[entityId] = initialAngle;
  }

  remove(entityId) {
    this.centerXFloat32Array[entityId] = 0;
    this.centerYFloat32Array[entityId] = 0;
    this.radiusFloat32Array[entityId] = 0;
    this.angularVelocityFloat32Array[entityId] = 0;
    this.angleFloat32Array[entityId] = 0;
  }

  clearAll() {
    this.centerXFloat32Array.fill(0);
    this.centerYFloat32Array.fill(0);
    this.radiusFloat32Array.fill(0);
    this.angularVelocityFloat32Array.fill(0);
    this.angleFloat32Array.fill(0);
  }
}
