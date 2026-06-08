import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AccessibilityPreferences extends ChangeNotifier {
  // ── Valores padrão ───────────────────────────
  double _fontSizeMultiplier = 1.0;
  bool _highContrast = false;
  bool _textToSpeechEnabled = false;
  bool _temaClaro = false;
  double _espacamentoLinhas = 1.5;
  bool _fonteDislexia = false;

  // ── Getters ──────────────────────────────────
  double get fontSizeMultiplier => _fontSizeMultiplier;
  bool get highContrast => _highContrast;
  bool get textToSpeechEnabled => _textToSpeechEnabled;
  bool get temaClaro => _temaClaro;
  double get espacamentoLinhas => _espacamentoLinhas;
  bool get fonteDislexia => _fonteDislexia;

  // ── Carrega configurações salvas ─────────────
  // Chamado no main() antes de abrir o app
  Future<void> carregarConfiguracoes() async {
    final prefs = await SharedPreferences.getInstance();
    _fontSizeMultiplier = prefs.getDouble('fontSizeMultiplier') ?? 1.0;
    _highContrast = prefs.getBool('highContrast') ?? false;
    _textToSpeechEnabled = prefs.getBool('textToSpeechEnabled') ?? false;
    _temaClaro = prefs.getBool('temaClaro') ?? false;
    _espacamentoLinhas = prefs.getDouble('espacamentoLinhas') ?? 1.5;
    _fonteDislexia = prefs.getBool('fonteDislexia') ?? false;
    notifyListeners();
  }

  // ── Setters com salvamento automático ────────

  void setFontSizeMultiplier(double value) async {
    if (value >= 0.8 && value <= 1.5) {
      _fontSizeMultiplier = value;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setDouble('fontSizeMultiplier', value);
      notifyListeners();
    }
  }

  void setHighContrast(bool value) async {
    _highContrast = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('highContrast', value);
    notifyListeners();
  }

  void setTextToSpeechEnabled(bool value) async {
    _textToSpeechEnabled = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('textToSpeechEnabled', value);
    notifyListeners();
  }

  void setTemaClaro(bool value) async {
    _temaClaro = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('temaClaro', value);
    notifyListeners();
  }

  void setEspacamentoLinhas(double value) async {
    _espacamentoLinhas = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('espacamentoLinhas', value);
    notifyListeners();
  }

  void setFonteDislexia(bool value) async {
    _fonteDislexia = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('fonteDislexia', value);
    notifyListeners();
  }

  // ── Helper de cor com alto contraste ─────────
  Color getContrastColor(Color original) {
    if (!_highContrast) return original;
    return original.withValues(alpha: 1.0);
  }
}
