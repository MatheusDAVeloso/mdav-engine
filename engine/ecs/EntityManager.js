// EntityManager.js
// Gerenciador Central de Entidades baseado na arquitetura ECS (Entity Component System) com Orientação a Dados (Data-Oriented Design).
//
// COMO FUNCIONA O ALGORITMO E A INTEGRAÇÃO COM A ENGINE:
//
// 1. O QUE É UMA ENTIDADE EM ECS?
//    Ao contrário da Programação Orientada a Objetos (POO) clássica, onde uma Entidade é uma instância de classe
//    cheia de propriedades e métodos (ex: class Player extends GameObject), em ECS uma Entidade é APENAS UM NÚMERO
//    INTEIRO (ID, ex: 0, 1, 2, 3...). Ela não guarda dados e nem comportamentos diretamente.
//
// 2. POR QUE USAR IDs INTEIROS E MEMÓRIA CONTÍGUA (TypedArrays)?
//    - Em JavaScript, criar e destruir milhares de objetos { x, y, width, height } por segundo causa
//      picos de travamento devido ao Coletor de Lixo (Garbage Collector / GC).
//    - Com o EntityManager, alocamos blocos contíguos de memória fixa (Uint32Array, Uint8Array) na inicialização.
//    - A CPU consegue ler estes arrays na memória cache L1/L2 com altíssimo desempenho (Cache Locality),
//      evitando "Cache Misses" e eliminando o Garbage Collector do ciclo de atualização do jogo.
//
// 3. RECICLAGEM DE IDs (ZERO ALLOCATION):
//    - Quando uma entidade é destruída (destroyEntity), seu ID é guardado em uma pilha de reciclagem (recycledIds).
//    - A próxima chamada a createEntity reutilizará esse ID antigo em vez de incrementar a memória indefinidamente.

export class EntityManager {
  // Inicializa o gerenciador pré-alocando a capacidade máxima de entidades simultâneas em memória
  constructor(capacity) {
    this.capacity = capacity;

    // Array de estado ativo (1 = Entidade Viva, 0 = Entidade Destruída/Livre).
    this.activeStateUint8Array = new Uint8Array(capacity);

    // Pilha de reciclagem de IDs para reutilizar posições de memória de entidades destruídas.
    this.recycledIdsUint32Array = new Uint32Array(capacity);
    this.recycledCount = 0;

    // Próximo ID inédito a ser atribuído quando não houver IDs reciclados disponíveis.
    this.nextEntityId = 0;

    // Contador em tempo real de quantas entidades estão ativas na cena.
    this.activeCount = 0;
  }

  // Cria uma nova entidade e retorna seu ID numérico.
  // Reutiliza IDs reciclados se disponível para evitar fragmentação de memória.
  createEntity() {
    let id;

    if (this.recycledCount > 0) {
      // Reutiliza o último ID destruído da pilha de reciclagem
      this.recycledCount--;
      id = this.recycledIdsUint32Array[this.recycledCount];
    } else {
      if (this.nextEntityId >= this.capacity) {
        throw new Error(`[EntityManager] Capacidade máxima de entidades (${this.capacity}) atingida!`);
      }
      id = this.nextEntityId;
      this.nextEntityId++;
    }

    this.activeStateUint8Array[id] = 1;
    this.activeCount++;

    return id;
  }

  // Destrói uma entidade, marca seu estado como inativo e recicla seu ID.
  destroyEntity(entityId) {
    if (entityId < 0 || entityId >= this.nextEntityId || this.activeStateUint8Array[entityId] === 0) {
      return; // Entidade já está inativa ou ID é inválido
    }

    // Marca como inativa para que os sistemas deixem de processar este ID.
    this.activeStateUint8Array[entityId] = 0;

    // Devolve o ID para a pilha de reciclagem
    this.recycledIdsUint32Array[this.recycledCount] = entityId;
    this.recycledCount++;

    this.activeCount--;
  }

  // Reseta todo o estado do EntityManager, limpando todas as entidades ativas e recicladas
  clearAll() {
    this.activeStateUint8Array.fill(0);
    this.recycledIdsUint32Array.fill(0);
    this.recycledCount = 0;
    this.nextEntityId = 0;
    this.activeCount = 0;
  }
}
