# MDAV Engine

Uma engine pequena para jogos de navegador, escrita em HTML, CSS e JavaScript puro, com ECS e Data-Oriented Design.

## Sobre essa engine

Essa não é uma engine feita para ser a mais rápida, nem a mais completa, nem para atender o maior número de pessoas possível. Foi feita para uma pessoa: eu.

No início, eu gostava de programação porque ela possibilitava fazer qualquer coisa. Depois, comecei a trabalhar e percebi que gostava mais do código e da infraestrutura por trás da tela do que do resultado final em si. Hoje, percebo que nem isso é o centro. O que eu realmente gosto é ver os sistemas conversando, cada peça fazendo sua parte e se unindo em algo maior. Essa engine nasceu disso.

Eu tenho dificuldade real com decisão em código. Abstração demais me perde. Não porque eu não entenda o que ela faz, mas porque ela esconde escolhas que eu preciso ver para confiar. Por isso, aqui, valores importantes não possuem padrões escondidos. Ao criar a engine ou adicionar um componente, o desenvolvedor informa explicitamente o que deseja.

Valores default tentariam prever as ideias mais diferentes possíveis. Uma escolha silenciosa pode parecer conveniente, mas também pode produzir comportamentos inesperados e bugs. Prefiro que uma decisão importante esteja visível no lugar em que a peça é montada.

A API segue a mesma ideia. A Engine expõe seus managers e o `ComponentManager` oferece operações diretas para montar entidades. Se existe, você acessa. Se não sabe o nome, digita `engine.` e observa as peças disponíveis. Propriedades prefixadas com `_` continuam acessíveis para testes e experimentação, mas comunicam que não fazem parte do caminho público principal.

A escolha por ECS e Data-Oriented Design não foi somente sobre performance. Foi sobre clareza. Orientação a objetos sempre foi confusa para mim: herança, interface, objetos carregando comportamento e estado juntos, tudo parecia emaranhado. ECS separa dado, comportamento e identidade, e isso é mais simples para minha cabeça segurar. Não porque seja objetivamente mais fácil, mas porque é mais fácil para mim.

Modularidade aqui existe por necessidade, não por elegância arquitetural. Eu preciso poder tirar ou adicionar uma peça sem travar. Por isso, tudo é montado de forma explícita, sem preset ou fábrica pronta escondendo uma decisão que era sua.

Se sua cabeça funciona parecido com a minha, se você também prefere ver tudo explicitamente a confiar em uma abstração que decide por você, talvez essa engine sirva para você também. Se não, tudo bem. Ela não foi desenhada para agradar todo mundo. Foi desenhada para resolver um problema específico, meu.

## Por que HTML, CSS e JavaScript?

Esta engine também tem o objetivo de descobrir até onde é possível levar um jogo de navegador.

Por que criar uma engine com HTML, CSS e JavaScript? Por que não usar C++ e Vulkan, com controle muito mais próximo do hardware e uma capacidade técnica muito maior?

Justamente por isso.

C++ e Vulkan oferecem liberdade e controle suficientes para construir sistemas enormes. O navegador e o JavaScript impõem uma superfície menor. JavaScript moderno combina interpretação e compilação JIT, mas ainda opera dentro das regras, das APIs e dos custos de um navegador.

Eu não vejo isso somente como uma limitação. Vejo como uma restrição escolhida. A limitação do JavaScript me traz algo que a liberdade do C++ não traz: uma fronteira contra a qual eu posso trabalhar.

> Eu sou finito, mas dentro da minha finitude, até onde consigo ir?

Em vez de partir de uma capacidade quase ilimitada, prefiro explorar profundamente um espaço finito. Até onde consigo levar Canvas 2D, TypedArrays, Web Audio API, ECS e as ferramentas nativas do navegador? Que tipo de jogo ainda cabe aqui? Que arquitetura nasce quando cada custo importa?

Limitações, às vezes, são justamente o que nos faz avançar.

## Uma caixa de ferramentas

Uma engine, na essência, é uma caixa de ferramentas que ajuda a fazer o código. A MDAV Engine também funciona como um framework: oferece peças reutilizáveis, mas deixa o jogo escolher como combiná-las.

Não estou fazendo isso para um público imaginário. Estou fazendo para mim, que tenho dificuldade com código, e por isso tudo precisa ser mais explícito. Se essa forma de pensar ajudar outra pessoa, ela também pode usar.

## Modelo mental

Na MDAV Engine, uma entidade é somente um identificador numérico. Os dados ficam em Component Storages e o comportamento fica nos Systems.

```text
Entity     identidade
Component  dados
System     comportamento
Engine     ordem e coordenação
```

### A gramática dos nomes

As operações do `ComponentManager` colocam primeiro o componente que será manipulado e depois a ação:

```text
transformAdd()
transformSetPosition()
transformRemove()

velocityAdd()
velocityRemove()

colorAdd()
colorSet()
colorRemove()
```

Por isso, a API usa `velocityAdd()` em vez de `addVelocity()`. Ao digitar `componentManagers.velocity`, todas as operações relacionadas a Velocity aparecem agrupadas. Primeiro eu escolho a peça que quero manipular. Depois escolho o que desejo fazer com ela.

Essa ordem também preserva um caminho natural caso a API seja organizada futuramente por componente:

```text
velocityAdd()          -> velocity.add()
velocityRemove()       -> velocity.remove()
transformSetPosition() -> transform.setPosition()
```

A implementação interna pode ser mais verbosa quando isso torna a decisão explícita. O objetivo não é produzir o menor nome possível, mas fazer o nome mostrar onde a operação pertence.

Pelo mesmo motivo, existe `colorAdd()` e não `renderAdd()`. `ColorComponentStorage` guarda um dado: a cor CSS associada à entidade. Quem transforma esse dado em pixels é o `RenderSystem`. Chamar o componente de Render misturaria o dado armazenado com o comportamento que o consome:

```text
ColorComponentStorage   dado
RenderSystem            comportamento
```

O jogo adiciona Color à entidade. A Engine renderiza as entidades que possuem a composição exigida. Essa distinção mantém a separação do ECS visível até nos nomes da API.

Montar uma entidade significa declarar, em sequência, exatamente quais capacidades ela possui:

```js
const playerEntityId = engine.createEntity();

engine.componentManagers.transformAdd(playerEntityId, 388, 520, 24, 24);
engine.componentManagers.velocityAdd(playerEntityId, 0, 0, 260);
engine.componentManagers.directionalMovementInputAdd(playerEntityId, playerBindingId);
engine.componentManagers.colliderAdd(
  playerEntityId,
  20,
  20,
  COLLIDER_RESPONSE_TYPE.IMPENETRABLE,
  COLLIDER_REBUILD_TYPE.EVERY_FRAME,
  2,
  2
);
engine.componentManagers.colorAdd(playerEntityId, '#06b6d4');
```

Não existe uma classe `Player`. O nome e o significado pertencem ao jogo. A engine entrega transformação, velocidade, input, colisão e cor como peças independentes.


## Parte técnica

Na medição atual, toda a engine possui 1.253 linhas de código efetivo, sem contar linhas vazias e comentários. O tamanho pequeno não é um objetivo isolado. Ele é consequência de oferecer poucas peças explícitas que podem ser combinadas para produzir comportamentos diferentes.

Os Component Storages usam uma estrutura de arrays, também conhecida como SoA. Cada propriedade numérica ocupa seu próprio `TypedArray`, indexado diretamente pelo ID da entidade.

```text
entityId                   0       1       2
positionXFloat32Array    120     388      64
positionYFloat32Array     80     520     240
widthFloat32Array          20      24      18
heightFloat32Array         20      24      18
```

As máscaras ECS indicam quais componentes cada entidade possui. Os sistemas percorrem os dados necessários, filtram pelas máscaras e operam diretamente sobre os arrays. IDs destruídos são reciclados e voltam a ser utilizados por novas entidades.

A Engine também coordena:

- game loop com `deltaTime`;
- input direcional reutilizável;
- movimento;
- colisão AABB direta ou com grade espacial;
- renderização em Canvas 2D;
- áudio sintetizado com Web Audio API;
- pool de partículas;
- comportamentos reutilizáveis de framework, como órbita e inversão de velocidade nos limites.

O jogo pode inserir sua própria regra dentro do fluxo controlado pela engine:

```js
engine.onGameLoop((deltaTime) => {
  gameState.update(deltaTime);
});
```

Também pode desenhar o estado atual sem avançar a simulação:

```js
engine.renderFrame();
```

## Como a engine evolui

Jogos concretos exercem pressão sobre a arquitetura. O jogo apresenta um problema real, a necessidade geral é identificada e a engine recebe uma capacidade reutilizável. Conceitos específicos como `Player`, `EnemyBall` ou `GoalZoneSystem` permanecem no jogo.

O objetivo não é antecipar uma engine universal no papel. É deixar jogos reais mostrarem quais peças estão faltando.

## Executar localmente

O projeto não exige instalação de dependências nem etapa de build. Sirva a raiz com qualquer servidor HTTP e abra o endereço fornecido no navegador.

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Autor

Criado por [MatheusDAVeloso](https://github.com/MatheusDAVeloso).
