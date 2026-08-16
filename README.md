# Introdução a MDAVengine
Esta engine — por nome de MDAVengine ou MatheusDAVengine — está sendo construída por mim, [MatheusDAVeloso](https://www.linkedin.com/in/matheus-dav/) a fim de servir como um canivete suiço de ferramentas para construção desde sites, jogos, aplicativos e até outros projetos pessoais. Com ela, no futuro, também pretendo construir o MatheusDAVapplication, um hub central de coisas minhas e para mim, como integrações com IAs, aplicativos de debug, jogos, automatizações, um espaço para a lore de um jogo maior, dentre outras features que ainda pensarei em implementar.

Usarei ela para também aprender a implementação e a funcionalidade de vários conceitos do mundo da programação.

## O que é possível fazer agora?
Como ela está muito no início, ela basicamente apenas acessa o DOM do navegador e consegue renderizar retângulos e círculos com ou sem ou somente a borda — onde na chamada do retângulo, há uma correção interna na posição de pixel quando a borda é impar, a fim de evitar aquele efeito não intencional de blur.

## Metodologia de crescimento da MDAVengine.
Esta engine será construída aos poucos conforme os requisitos forem aparecendo. Como não sei exatamente o próximo degrau a ser construído para suportar o que pretendo fazer, eu peço para uma IA — especificamente uma LLM — para me dizer o que devo tentar fazer, mas em alto nível. Se a engine não tiver suporte aquilo, eu devo pesquisar e codar por conta própria a fim de adicionar esta funcionalidade. Exemplo:
- Seu próximo passo é fazer um círculo azul com a borda vermelha com 4 de espessura.
- Seu próximo passo é criar um container, adicionar texto e implementar um padding de 16 pixels em volta de todo o conteúdo.
- Seu próximo passo é fazer um quadrado azul se mover, levando em conta o deltaTime.

### Outras considerações importantes sobre o uso de IA
Restrições:
- Ela não deve me fornecer o código pronto
- Ela não deve falar a causa de um bug
- Ela não deve falar para eu fazer de jeito "x" ao invés do jeito "y" por causa de "z"

Ajuda:
- Ela pode me falar qual o próximo requisito em alto nível, como se fosse um Product Owner
- Ela pode me fornecer links de documentações, cursos ou vídeos de como fazer algo
- Ela pode falar que para tal parte do código, eu poderia analisar entre os design patterns/algoritmos/data structure "x", "y" ou "z". E eu devo escolher e aprender por conta própria como implementar e porque implementar

## Pilares da Filosofia da Engine
### 1. Ser explícita
- Ela não coloca valores padrões ou de fallback em construtores e funções.
- Todo dado é tipado, mesmo que isso vá contra a filosofia do próprio `Dart` referente a ser denso.
- Ela é verbosa, mas você entende cada coisa do que acontece — isso vai desde nomes de variáveis até declarações, onde tenta não esconder nada.

### 2. Dev Experience — DX
- A engine é inspirado em CLI, que ao contrário de GUI, eu pessoalmente acho mais fácil entender uma ferramenta. Enquanto UI/UX coloca botões em vários lugares e você não tem exatamente um ponto de partida ao adentrar uma aplicação, com CLI você pode ir explorando módulos de forma mais isolada. Para cada palavra-chave que você coloca em sequência, há um filtro de disponibilidade das coisas após esse acesso e ao adentrar uma, não fica aparecendo as opções no fundo de outras partes como em uma UI, já que CLI isola seu workspace.
- Padrão facade é utilizado para que não haja a necessidade de ler documentações de API a fim de descobrir "quem" faz "o que".
- Tudo começa em "`engine.`" e a IDE expõe quais módulos estão disponíveis e para cada módulo o que é possível fazer com ele. Com isso, se a API alterar — partes forem removidas/adicionas ou parâmetros serem alterados, não ficará silencioso na próxima atualização, pois a IDE mostrará o que tem de errado.

---

## Gerado automaticamente
Uses [`package:web`](https://pub.dev/packages/web)
to interop with JS and the DOM.

## Running and building

To run the app,
activate and use [`package:webdev`](https://dart.dev/tools/webdev):

```
dart pub global activate webdev
webdev serve
```

To build a production version ready for deployment,
use the `webdev build` command:

```
webdev build
```

To learn how to interop with web APIs and other JS libraries,
check out https://dart.dev/interop/js-interop.
