import 'package:mdav_engine/engine/mdav_engine.dart';
import 'package:web/web.dart' as web;

void main() {
  final web.HTMLCanvasElement canvas = web.document.getElementById("canvas") as web.HTMLCanvasElement;
  canvas.width = web.window.innerWidth;
  canvas.height = web.window.innerHeight;

  final web.CanvasRenderingContext2D context = canvas.getContext("2d") as web.CanvasRenderingContext2D;

  final MdavEngine engine = MdavEngine.withWebCanvas2dRendering(context: context);
  engine.render.drawCircle(color: "#00FF00", centerX: 100, centerY: 100, radius: 50);
}
