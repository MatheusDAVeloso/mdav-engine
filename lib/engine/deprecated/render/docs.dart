// Todo pixel em uma tela é apenas um e somente um bloquinho. Então uma tela é nada mais que um conjunto de pixel.
// Por isso, ela pode ser simplificado a um plano cartesiano, sendo positionX e positionY os próprios (x, y).
// "(x, y)" nesse contexto, seriam as intersecções — que pode ser pensado com os vértices — entre os pixels.
// Exemplo visual:
//
//   (0,0)       (1,0)        (2,0)
//     --------------------------
//     |           |            |
//     |   pixel   |    pixel   |
//     |           |            |
//   (0,1)------ (1,1)------- (2,1)
//     |           |            |
//     |   pixel   |    pixel   |
//     |           |            |
//     --------------------------
//   (0,2)       (1,2)        (2,2)
//
// Percebe que ao pintar um pixel — por exemplo — em (1.5, 0), as API de desenho não conseguem pintar metade dele.
// Então o que acontece é: elas jogam para a direita o pixel e criam um blur no lado esquerdo. Por isso ao mexer com
// bordas, deve-se levar em contar o thickness, pois um thickness de 1 ele tende a cair neste problema.