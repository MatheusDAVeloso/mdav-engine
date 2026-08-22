import 'dart:js_interop';

import 'package:web/web.dart' as web;

void main() {
  final web.HTMLCanvasElement canvas = web.document.getElementById("canvas") as web.HTMLCanvasElement;
  canvas.width = web.window.innerWidth;
  canvas.height = web.window.innerHeight;

  final web.CanvasRenderingContext2D context = canvas.getContext("2d") as web.CanvasRenderingContext2D;
  double positionX = 100.0;
  context.fillRect(positionX, 100.0, 100.0, 100.0);

  final GameLoop loop = GameLoop();
  loop.onLogicUpdate = (double deltaTime) {
    positionX += 1.0 * deltaTime;
    if (positionX > 1200.0) {
      loop.stop();
    }
  };

  loop.onRenderUpdate = () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(positionX, 100.0, 100.0, 100.0);
  };

  loop.start();
}

class GameLoop {
  GameLoop();
  late final void Function(double deltaTime) onLogicUpdate;
  late final void Function() onRenderUpdate;

  final double msPerUpdate = 1000.0 / 60;
  double deltaTime = 0.0;
  double currentTime = 0.0;
  double lastFrameTime = 0.0;
  double lag = 0.0;
  bool isRunning = false;

  void start() {
    isRunning = true;
    lastFrameTime = web.window.performance.now();
    _startRequestFrameLoop();
  }

  void stop() {
    isRunning = false;
  }

  void _startRequestFrameLoop() {
    if (isRunning == false) return;

    web.window.requestAnimationFrame(
      ((JSNumber domHighRestTimeStamp) {
        currentTime = domHighRestTimeStamp.toDartDouble;
        deltaTime = currentTime - lastFrameTime;
        lastFrameTime = currentTime;
        lag += deltaTime;

        // process input

        while (lag >= msPerUpdate) {
          onLogicUpdate.call(deltaTime);
          lag -= msPerUpdate;
        }

        onRenderUpdate.call();

        _startRequestFrameLoop();
      }).toJS,
    );
  }
}
