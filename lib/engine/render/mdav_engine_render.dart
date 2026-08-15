abstract class MdavEngineRender {
  const MdavEngineRender();

  void drawRectangle({
    required String color,
    required double positionX,
    required double positionY,
    required double width,
    required double height,
  });

  void drawCircle({
    required String color,
    required double centerX,
    required double centerY,
    required double radius,
  });

  void clearAllDraw();
}
