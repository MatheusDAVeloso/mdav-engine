import 'dart:js_interop';

import 'package:web/web.dart' as web;

class Temp {
  Temp({required this.onUpdate});

  // Aqui resulta em 16.67 aproximadamente, ou seja, é necessário no mínimo esse valor para ter um update.
  // Ou seja, para 1 segundo (1000.0ms), eu quero 60 atualizações (60 FPS). Então internamente uma atualização
  // só ocorre quando acumular 16.67ms
  double msNeedToUpdate = 1000.0 / 60;
  double lastTimeUpdated = 0.0;
  double lag = 0.0;
  bool isRunning = false;
  void Function(double deltaTime) onUpdate;

  void start() {
    if (isRunning) return;
    lastTimeUpdated = web.window.performance.now();
    isRunning = true;
    scheduleNextFrame();
  }

  void stop() {
    isRunning = false;
  }

  void scheduleNextFrame() {
    if (!isRunning) return;

    web.window.requestAnimationFrame(((JSNumber domHighResTimeStamp) {
      double currentTime = domHighResTimeStamp.toDartDouble;

      // Δt = tb - ta -> "Δ" é a diferença entre "b" e "a"
      double elapsed = currentTime - lastTimeUpdated;
      lastTimeUpdated = currentTime;
      lag += elapsed;

      // process input

      while (lag >= msNeedToUpdate) {
        onUpdate(elapsed);
        lag -= msNeedToUpdate;
      }

      // Since the rendering engine captures an instant in time, it doesn’t care how much time advanced since the last one.
      // onRender

      scheduleNextFrame();
    }).toJS);
  }
}