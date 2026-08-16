import 'package:mdav_engine/engine/contract/border.dart';

abstract interface class MdavEngineRender {
  const MdavEngineRender();

  void defineRectangle({
    required int xPositionInPixels,
    required int yPositionInPixels,
    required int widthInPixels,
    required int heightInPixels,
    String? fillColor,
    // TODO: Talvez diferenciar RectangleBorderToInside de RectangleBorderToOutside, os dois no mesmo parâmetro
    Border? border,
  });

  void defineCircle({
    required double centerX,
    required double centerY,
    required double radius,
    String? fillColor,
    // TODO: Talvez diferenciar RectangleBorderToInside de RectangleBorderToOutside, os dois no mesmo parâmetro
    Border? border,
  });

  void clearAllDraw();
}
