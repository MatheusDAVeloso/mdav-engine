// Associa uma entidade controlável a um binding direcional do InputManager.
export class DirectionalMovementInputComponentStorage {
  constructor(capacity) {
    this.capacity = capacity;

    // Cada entidade guarda apenas o ID numérico de um conjunto de teclas registrado
    // no InputManager. Assim, várias entidades podem reutilizar o mesmo binding.
    this.directionalBindingIdUint16Array = new Uint16Array(capacity);
  }

  set(entityId, directionalBindingId) {
    this.directionalBindingIdUint16Array[entityId] = directionalBindingId;
  }

  remove(entityId) {
    this.directionalBindingIdUint16Array[entityId] = 0;
  }

  clearAll() {
    this.directionalBindingIdUint16Array.fill(0);
  }
}
