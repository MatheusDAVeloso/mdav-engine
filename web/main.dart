import 'package:mdav_engine/engine/contract/rectangle_border.dart';
import 'package:mdav_engine/engine/mdav_engine.dart';
import 'package:web/web.dart' as web;

void main() {
  final web.HTMLCanvasElement canvas = web.document.getElementById("canvas") as web.HTMLCanvasElement;
  canvas.width = web.window.innerWidth;
  canvas.height = web.window.innerHeight;

  final web.CanvasRenderingContext2D context = canvas.getContext("2d") as web.CanvasRenderingContext2D;
  final MdavEngine engine = MdavEngine.withWebCanvas2dRendering(context: context);

  // Teste
  // Retangulo A
  engine.render.defineRectangle(
    xPositionInPixels: 100,
    yPositionInPixels: 100,
    widthInPixels: 100,
    heightInPixels: 100,
    fillColor: "blue",
    border: RectangleBorder(
      color: "red",
      thicknessInPixels: 4,
    ),
  );

  /*
  // Retângulo B
  engine.render.defineRectangle(
    positionX: 200.0,
    positionY: 200.0,
    width: 100.0,
    height: 100.0,
    fillColor: "green",
  );
  */
}
