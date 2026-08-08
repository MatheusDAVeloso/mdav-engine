// Gerencia o tempo do jogo, calculando o Delta Time (tempo entre frames) e a taxa de quadros por segundo (FPS).
export class TimeManager {
  constructor() {
    this.lastTime = 0;
    this.deltaTime = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.currentFps = 0;
  }

  // Atualiza o tempo e o FPS com base no timestamp atual (em milissegundos)
  update(currentTime) {
    if (!this.lastTime) {
      this.lastTime = currentTime;
    }

    // Converte a diferença de milissegundos para segundos
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Limite de segurança (0.1s) para evitar saltos bruscos se o jogo travar ou mudar de aba
    if (this.deltaTime > 0.1) {
      this.deltaTime = 0.1;
    }

    // Atualiza o contador de FPS a cada 1 segundo acumulado
    this.frameCount++;
    this.fpsTimer += this.deltaTime;

    if (this.fpsTimer >= 1.0) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    return this.deltaTime;
  }

  // Retorna o Delta Time atual em segundos
  getDelta() {
    return this.deltaTime;
  }

  // Retorna o valor atual de FPS
  getFPS() {
    return this.currentFps;
  }
}
