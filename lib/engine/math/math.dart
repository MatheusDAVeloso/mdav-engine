class Math {
  // Constants
  static double get pi => 3.1415926535897932;

  // Par
  static bool isEven({required int number}) {
    return number % 2 == 0 ? true : false;
  }

  // Impar
  static bool isOdd({required int number}) {
    return number % 2 == 0 ? false : true;
  }
}
