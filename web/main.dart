import 'package:mdav_engine/engine/contract/rectangle_border.dart';
import 'package:mdav_engine/engine/mdav_engine.dart';
import 'package:web/web.dart' as web;

void main() {
  final web.HTMLCanvasElement canvas = web.document.getElementById("canvas") as web.HTMLCanvasElement;
  canvas.width = web.window.innerWidth;
  canvas.height = web.window.innerHeight;

  final web.CanvasRenderingContext2D context = canvas.getContext("2d") as web.CanvasRenderingContext2D;
  final MdavEngine engine = MdavEngine.withWebCanvas2dRendering(context: context);

  engine.render.drawRectangle(
    positionX: 100.0,
    positionY: 100.0,
    width: 100.0,
    height: 100.0,
    fillColor: "blue",
    border: RectangleBorder(
      color: "red",
      thickness: 2.0,
    ),
  );
}
