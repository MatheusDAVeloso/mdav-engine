import 'package:mdav_engine/engine/contract/border.dart';
import 'package:mdav_engine/engine/mdav_engine.dart';
import 'package:web/web.dart' as web;

void main() {
  final web.HTMLCanvasElement canvas = web.document.getElementById("canvas") as web.HTMLCanvasElement;
  canvas.width = web.window.innerWidth;
  canvas.height = web.window.innerHeight;

  final web.CanvasRenderingContext2D context = canvas.getContext("2d") as web.CanvasRenderingContext2D;
  final MdavEngine engine = MdavEngine.withWebCanvas2dRendering(context: context);

  // teste
  engine.render.defineCircle(
    centerX: 100.0,
    centerY: 100.0,
    radius: 50.0,
    fillColor: "blue",
    border: Border(
      color: "red",
      thicknessInPixels: 3,
    ),
  );
}
