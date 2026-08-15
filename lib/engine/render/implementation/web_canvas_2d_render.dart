import 'dart:js_interop';

import 'package:mdav_engine/engine/contract/rectangle_border.dart';
import 'package:mdav_engine/engine/math/math_constants.dart';
import 'package:mdav_engine/engine/render/mdav_engine_render.dart';
import 'package:web/web.dart' as web;

class WebCanvas2dRender implements MdavEngineRender {
  const WebCanvas2dRender({required web.CanvasRenderingContext2D context}) : _context = context;

  final web.CanvasRenderingContext2D _context;

  @override
  void drawRectangle({
    required double positionX,
    required double positionY,
    required double width,
    required double height,
    String? fillColor,
    RectangleBorder? border,
  }) {
    _context.rect(positionX, positionY, width, height);

    if (fillColor != null) {
      _context.fillStyle = fillColor.toJS;
      _context.fill();
    }

    // Se "thickness" for repassado com o valor 0, sem a verificação "border.thickness > 0", aparece uma borda
    // com o mesmo tamanho de 1 em "thickness", porém com a cor aparentando transparência.
    if (border != null && border.thickness > 0) {
      _context.lineWidth = border.thickness;
      _context.strokeStyle = border.color.toJS;
      _context.stroke();
    }
  }

  @override
  void drawCircle({
    required String color,
    required double centerX,
    required double centerY,
    required double radius,
  }) {
    _context.beginPath();

    // Para fazer um círculo completo, é necessário passar dois parâmetros ao "_context.arc()":
    // "0" para startAngle e "2 * PI" para endAngle, sendo esses dois parâmetros em "radians"
    _context.arc(
      centerX,
      centerY,
      radius,
      /* startAngle: */ 0,
      /* engAngle: */ 2 * MathConstants.pi,
    );
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
