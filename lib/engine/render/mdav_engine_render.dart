import 'package:mdav_engine/engine/contract/rectangle_border.dart';

abstract interface class MdavEngineRender {
  const MdavEngineRender();

  void drawRectangle({
    required double positionX,
    required double positionY,
    required double width,
    required double height,
    String? fillColor,
    RectangleBorder? border,
  });

  void drawCircle({
    required String color,
    required double centerX,
    required double centerY,
    required double radius,
  });

  void clearAllDraw();
}
