import 'dart:js_interop';

import 'package:mdav_engine/engine/deprecated/contract/border.dart';
import 'package:mdav_engine/engine/deprecated/math/math.dart';
import 'package:mdav_engine/engine/deprecated/render/mdav_engine_render.dart';
import 'package:web/web.dart' as web;

class WebCanvas2dRender implements MdavEngineRender {
  const WebCanvas2dRender({required web.CanvasRenderingContext2D context}) : _context = context;

  final web.CanvasRenderingContext2D _context;

  @override
  void defineRectangle({
    required int xPositionInPixels,
    required int yPositionInPixels,
    required int widthInPixels,
    required int heightInPixels,
    String? fillColor,
    Border? border,
  }) {
    double? xPositionFixed;
    double? yPositionFixed;

    // CASO ESPECIAL — BORDA
    // Se "thickness" for repassado com o valor 0, ainda sim aparece uma borda com espessura — equivalente a passar
    // o valor 1 em "thickness" — além de um blur. Por isso a proteção "border.thickness > 0"
    if (border != null && border.thicknessInPixels > 0 && Math.isOdd(number: border.thicknessInPixels)) {
      // correção de posição
      // TODO: Adicionar parâmetro para o dev escolher a direção de correção em X e Y
      xPositionFixed = xPositionInPixels.toDouble() + 0.5;
      yPositionFixed = yPositionInPixels.toDouble() + 0.5;
    }

    // Delimitação
    _context.beginPath();
    // Sempre quando o caminho atual está vazio — seja após chamar "beginPath()" ou inicializar um novo canvas,
    // o primeiro comando de construção de caminho é sempre tratado como "moveTo", independente do que seja.
    // Por essa rasão, é sempre bom ser explícito sobre a posição inicial.
    // fonte: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
    _context.moveTo(xPositionFixed ?? xPositionInPixels, yPositionFixed ?? yPositionInPixels);
    _context.rect(
      xPositionFixed ?? xPositionInPixels,
      yPositionFixed ?? yPositionInPixels,
      widthInPixels,
      heightInPixels,
    );

    // Pintura da borda
    if (border != null && border.thicknessInPixels > 0) {
      _context.lineWidth = border.thicknessInPixels;
      _context.strokeStyle = border.color.toJS;
      _context.stroke();
    }

    // Pintura interna
    if (fillColor != null) {
      _context.fillStyle = fillColor.toJS;
      _context.fill();
    }
  }

  @override
  void defineCircle({
    required double centerX,
    required double centerY,
    required double radius,
    String? fillColor,
    Border? border,
  }) {
    _context.beginPath();
    // TODO: Identificar qual é a posição inicial para adicionar um "moveTo" aqui

    // Para fazer um círculo completo, é necessário passar dois parâmetros ao "_context.arc()":
    // "0" para startAngle e "2 * PI" para endAngle, sendo esses dois parâmetros em "radians"
    _context.arc(
      centerX,
      centerY,
      radius,
      /* startAngle: */ 0,
      /* engAngle: */ 2 * Math.pi,
    );

    // Se "thickness" for repassado com o valor 0, ainda sim aparece uma borda com espessura — equivalente a passar
    // o valor 1 em "thickness". Por isso a proteção "border.thickness > 0"
    if (border != null && border.thicknessInPixels > 0) {
      _context.lineWidth = border.thicknessInPixels;
      _context.strokeStyle = border.color.toJS;
      _context.stroke();
    }

    if (fillColor != null) {
      _context.fillStyle = fillColor.toJS;
      _context.fill();
    }
  }

  @override
  void drawText({
    required int xPositionInPixels,
    required int yPositionInPixels,
    required int sizeInPixels,
    required String color,
    required String text,
  }) {
    // TODO: Deixar passar a fonte para o texto
    _context.font = "${sizeInPixels}px serif";
    _context.fillStyle = color.toJS;
    _context.fillText(text, xPositionInPixels, yPositionInPixels);
  }

  @override
  void clearAllDraw() {
    /// Segundo o link "https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing",
    /// esta é forma mais perfomática de limpar o desenho, além de não resetar "fillStroke" e "fillStyle"
    _context.clearRect(0, 0, _context.canvas.width, _context.canvas.height);
  }
}
