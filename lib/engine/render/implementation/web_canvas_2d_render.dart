import 'dart:js_interop';

import 'package:mdav_engine/engine/math/math_constants.dart';
import 'package:mdav_engine/engine/render/mdav_engine_render.dart';
import 'package:web/web.dart' as web;

class WebCanvas2dRender extends MdavEngineRender {
  const WebCanvas2dRender({required web.CanvasRenderingContext2D context}) : _context = context;
  final web.CanvasRenderingContext2D _context;

  @override
  void drawRectangle({
    required String color,
    required double positionX,
    required double positionY,
    required double width,
    required double height,
  }) {
    _context.fillStyle = color.toJS;
    _context.fillRect(positionX, positionY, width, height);
  }

  @override
  void drawCircle({
    required String color,
    required double centerX,
    required double centerY,
    required double radius,
  }) {
    _context.beginPath();
    // Para fazer um círculo completo, é necessário passar dois parâmetros ao "_context.arc()", o startAngle e endAngle
    // "0" para startAngle e "2 * PI" para endAngle, sendo esses dois parâmetros em "radians"
    _context.arc(centerX, centerY, radius, /* startAngle: */ 0, /* engAngle: */ 2 * MathConstants.pi);
    _context.fillStyle = color.toJS;
    _context.fill();
  }

  @override
  void clearAllDraw() {
    /// Segundo o link "https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing",
    /// esta é forma mais perfomática de limpar o desenho, além de não resetar "fillStroke" e "fillStyle"
    _context.clearRect(0, 0, _context.canvas.width, _context.canvas.height);
  }
}
