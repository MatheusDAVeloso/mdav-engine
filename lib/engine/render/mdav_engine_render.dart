import 'package:mdav_engine/engine/contract/rectangle_border.dart';

abstract interface class MdavEngineRender {
  const MdavEngineRender();

  void defineRectangle({
    required int xPositionInPixels,
    required int yPositionInPixels,
    required int widthInPixels,
    required int heightInPixels,
    String? fillColor,
    // TODO: Talvez diferenciar RectangleBorderToInside de RectangleBorderToOutside, os dois no mesmo parâmetro
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
