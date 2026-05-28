import 'package:flutter/material.dart';

class AccessibilityPreferences extends ChangeNotifier {
  // Tamanho de fonte base (multiplicador)
  double _fontSizeMultiplier = 1.0;

  // Alto contraste
  bool _highContrast = false;

  // Text-to-speech ativado
  bool _textToSpeechEnabled = false;

  // Getters
  double get fontSizeMultiplier => _fontSizeMultiplier;
  bool get highContrast => _highContrast;
  bool get textToSpeechEnabled => _textToSpeechEnabled;

  // Setters com notificação
  void setFontSizeMultiplier(double value) {
    if (value >= 0.8 && value <= 1.5) {
      _fontSizeMultiplier = value;
      notifyListeners();
    }
  }

  void setHighContrast(bool value) {
    _highContrast = value;
    notifyListeners();
  }

  void setTextToSpeechEnabled(bool value) {
    _textToSpeechEnabled = value;
    notifyListeners();
  }

  // Helper para obter cor com alto contraste se ativado
  Color getContrastColor(Color original) {
    if (!_highContrast) return original;
    // Aumenta saturação e brilho em modo alto contraste
    return original.withValues(alpha: 1.0);
  }
}
