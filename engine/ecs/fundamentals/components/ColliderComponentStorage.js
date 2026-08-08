// Armazena os dados AABB de todos os colliders do mundo ECS.
export class ColliderComponentStorage {
  constructor(capacity) {
    this.capacity = capacity;

    this.widthFloat32Array = new Float32Array(capacity);
    this.heightFloat32Array = new Float32Array(capacity);
    this.offsetXFloat32Array = new Float32Array(capacity);
    this.offsetYFloat32Array = new Float32Array(capacity);

    // Uint8Array representa o booleano sem criar um objeto por entidade:
    this.responseTypeUint8Array = new Uint8Array(capacity);
    this.rebuildTypeUint8Array = new Uint8Array(capacity);
  }

  set(entityId, width, height, responseType, rebuildType, offsetX, offsetY) {
    this.widthFloat32Array[entityId] = width;
    this.heightFloat32Array[entityId] = height;
    this.responseTypeUint8Array[entityId] = responseType;
    this.rebuildTypeUint8Array[entityId] = rebuildType;
    this.offsetXFloat32Array[entityId] = offsetX;
    this.offsetYFloat32Array[entityId] = offsetY;
  }

  remove(entityId) {
    this.widthFloat32Array[entityId] = 0;
    this.heightFloat32Array[entityId] = 0;
    this.responseTypeUint8Array[entityId] = 0;
    this.rebuildTypeUint8Array[entityId] = 0;
    this.offsetXFloat32Array[entityId] = 0;
    this.offsetYFloat32Array[entityId] = 0;
  }

  clearAll() {
    this.widthFloat32Array.fill(0);
    this.heightFloat32Array.fill(0);
    this.responseTypeUint8Array.fill(0);
    this.rebuildTypeUint8Array.fill(0);
    this.offsetXFloat32Array.fill(0);
    this.offsetYFloat32Array.fill(0);
  }
}
