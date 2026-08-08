// ============================================================================
// ESTRUTURA DE PARTICIONAMENTO ESPACIAL (Spatial Hash Grid)
// ============================================================================
// O QUE É E PARA QUE SERVE:
// Imagine o mapa do seu jogo como um tabuleiro de xadrez invisível, dividido em
// vários quadradinhos (células) de tamanho fixo, como 64x64 pixels.
//
// Sem essa grade: Para saber se alguém colidiu com alguém, você precisaria testar
// O Personagem contra CADA objeto do mapa inteiro (árvores, inimigos, moedas, paredes).
// Em um jogo com 1000 objetos, isso seria 1.000.000 de testes por quadro!
//
// Com a grade: Guardamos em cada quadradinho do mapa apenas quem está dentro dele.
// Quando o Personagem quer testar colisão, ele só olha os objetos que estão nos
// mesmos quadradinhos que ele. Se uma parede está longe no mapa, ela nem é testada!
// ============================================================================

export class SpatialHashGrid {
  // Construtor: recebe explicitamente o tamanho de cada quadrado da grade em pixels.
  constructor(cellSize) {
    this.cellSize = cellSize;

    // Mapa (Dicionário) que guarda as células ativas.
    // A chave (key) é o texto da coordenada da célula ex: "2,3" (coluna 2, linha 3).
    // O valor (value) é uma lista de IDs das entidades que estão dentro desse quadradinho.
    this.grid = new Map();
  }

  // Limpa todas as células da grade.
  // COMO É USADO: Deve ser chamado a CADA QUADRO (frame) antes de recadastrar
  // as posições das entidades, já que os objetos se movem pelo mapa.
  clearAll() {
    this.grid.clear();
  }

  // Converte uma posição em pixels no mundo (ex: X = 150px) para o número do quadradinho na grade.
  // Exemplo: Com quadradinhos de 64px e X = 150:
  // Math.floor(150 / 64) = Math.floor(2.34) = Célula número 2.
  _getCellIndex(position) {
    return Math.floor(position / this.cellSize);
  }

  // Registra uma entidade na grade com base na sua caixa de colisão.
  // NOTA DIDÁTICA: Se um objeto for grande (ex: uma parede comprida), ele pode ocupar
  // mais de um quadradinho ao mesmo tempo. Por isso usamos um laço (for) de start até end.
  insert(entityId, x, y, width, height) {
    // Descobre qual o primeiro e o último quadradinho que essa caixa alcança (eixo X e Y)
    const startX = this._getCellIndex(x);
    const endX = this._getCellIndex(x + width);
    const startY = this._getCellIndex(y);
    const endY = this._getCellIndex(y + height);

    // Percorre todas as células que o objeto está tocando
    for (let cellX = startX; cellX <= endX; cellX++) {
      for (let cellY = startY; cellY <= endY; cellY++) {
        // Cria a identificação única dessa célula, ex: "3,5"
        const key = `${cellX},${cellY}`;

        // Se esse quadradinho ainda não existe no mapa, cria a lista vazia
        if (!this.grid.has(key)) {
          this.grid.set(key, []);
        }

        // Adiciona a entidade nesta célula
        this.grid.get(key).push(entityId);
      }
    }
  }

  // Procura e devolve todos os vizinhos próximos que estão nas MESHAS CÉLULAS da entidade.
  // Retorna um 'Set' (conjunto sem duplicatas), pois se uma entidade vizinha grande
  // ocupar 2 células junto com você, ela só deve aparecer 1 vez na lista final de candidatos.
  getNearby(entityId, x, y, width, height) {
    const nearby = new Set();

    // Descobre as células cobertas pelo objeto que está buscando vizinhos
    const startX = this._getCellIndex(x);
    const endX = this._getCellIndex(x + width);
    const startY = this._getCellIndex(y);
    const endY = this._getCellIndex(y + height);

    // Olha dentro de cada célula que o objeto toca
    for (let cellX = startX; cellX <= endX; cellX++) {
      for (let cellY = startY; cellY <= endY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cellEntities = this.grid.get(key);

        // Se houver outras entidades nessa célula
        if (cellEntities) {
          for (let i = 0; i < cellEntities.length; i++) {
            const otherId = cellEntities[i];
            // Ignora a si mesmo (um objeto não colide com ele próprio)
            if (otherId !== entityId) {
              nearby.add(otherId);
            }
          }
        }
      }
    }

    return nearby;
  }
}
