// ============================================================================
// GERENCIADOR DE ÁUDIO SINTETIZADO (AudioManager)
// ============================================================================
// Oferece mecanismos gerais sobre a Web Audio API. Este arquivo não conhece
// moedas, inimigos, objetivos ou qualquer outro conceito específico de jogo.
//
// O AudioContext é criado somente quando um som realmente precisa tocar. Além
// de evitar trabalho durante a inicialização, isso respeita a exigência dos
// navegadores de permitir áudio apenas depois de uma interação do usuário.
// ============================================================================
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.muted = false;
  }

  // ============================================================================
  // CONTROLE DE ÁUDIO
  // ============================================================================
  setMuted(muted) {
    this.muted = muted;
  }

  toggleMuted() {
    this.muted = !this.muted;
    return this.muted;
  }

  // ============================================================================
  // UNDER THE HOOD — ACESSO AO AUDIOCONTEXT
  // ============================================================================
  _getAudioContext() {
    if (this.audioContext === null) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return null;

      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  // ============================================================================
  // TOM INDIVIDUAL
  // ============================================================================
  // Todos os parâmetros são explícitos. delay permite agendar o tom no futuro
  // sem criar setTimeout e sem depender da precisão do game loop.
  playTone(type, frequencyStart, frequencyEnd, duration, volume, delay) {
    if (this.muted) return;

    const audioContext = this._getAudioContext();
    if (audioContext === null) return;

    const startTime = audioContext.currentTime + delay;
    const endTime = startTime + duration;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequencyStart, startTime);

    if (frequencyEnd !== frequencyStart) {
      oscillator.frequency.exponentialRampToValueAtTime(frequencyEnd, endTime);
    }

    // O ganho termina próximo de zero, nunca exatamente em zero, porque uma
    // rampa exponencial não pode atingir matematicamente o valor zero.
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(endTime);
  }

  // ============================================================================
  // SEQUÊNCIA DE TONS
  // ============================================================================
  // Cada frequência começa após stepTime, mas pode durar mais do que esse
  // intervalo. Assim, notas consecutivas também podem se sobrepor.
  playSequence(frequencies, type, noteDuration, stepTime, volume) {
    for (let index = 0; index < frequencies.length; index++) {
      const frequency = frequencies[index];

      this.playTone(
        type,
        frequency,
        frequency,
        noteDuration,
        volume,
        index * stepTime
      );
    }
  }
}
