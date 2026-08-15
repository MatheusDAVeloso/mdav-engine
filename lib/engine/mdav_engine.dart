import 'package:mdav_engine/engine/render/implementation/web_canvas_2d_render.dart';
import 'package:mdav_engine/engine/render/mdav_engine_render.dart';
import 'package:web/web.dart' as web;

class MdavEngine {
  const MdavEngine._(this.render);

  final MdavEngineRender render;

  factory MdavEngine.withWebCanvas2dRendering({required web.CanvasRenderingContext2D context}) {
    return MdavEngine._(
      WebCanvas2dRender(context: context),
    );
  }
}
