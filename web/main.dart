import 'package:mdav_engine/engine/contract/rectangle_border.dart';
import 'package:mdav_engine/engine/mdav_engine.dart';
import 'package:web/web.dart' as web;

void main() {
  final web.HTMLCanvasElement canvas = web.document.getElementById("canvas") as web.HTMLCanvasElement;
  canvas.width = web.window.innerWidth;
  canvas.height = web.window.innerHeight;

  final web.CanvasRenderingContext2D context = canvas.getContext("2d") as web.CanvasRenderingContext2D;
  final MdavEngine engine = MdavEngine.withWebCanvas2dRendering(context: context);

  // teste

  engine.render.defineRectangle(
    xPositionInPixels: 100,
    yPositionInPixels: 100,
    widthInPixels: 100,
    heightInPixels: 100,
    fillColor: "blue",
  );

  engine.render.defineRectangle(
    xPositionInPixels: 300,
    yPositionInPixels: 100,
    widthInPixels: 100,
    heightInPixels: 100,
    fillColor: "green",
  );
}
