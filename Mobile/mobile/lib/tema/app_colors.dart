import 'package:flutter/material.dart';
import 'package:mobile/servicos/accessibility_provider.dart';

class AppColors {
  // ── Cores das matérias ──────────────────────────────────
  static const Color matematica = Color(0xFF3B82F6); // Azul Real Moderno
  static const Color portugues = Color(0xFFEF4444);  // Coral/Red Moderno
  static const Color destaque = Color(0xFF6366F1);   // Indigo Brand Color
  
  // Cores extras para grade e variedade visual
  static const Color laranja = Color(0xFFF97316);
  static const Color esmeralda = Color(0xFF10B981);
  static const Color roxo = Color(0xFF8B5CF6);

  // ── Cores de feedback ──────────────────────────────────
  static const Color correto = Color(0xFF10B981);   // Verde Esmeralda
  static const Color incorreto = Color(0xFFEF4444); // Vermelho Coral

  // Helper para buscar cor por nome
  static Color materiaCor(String nome) {
    switch (nome.toLowerCase()) {
      case 'matemática':
      case 'matematica':
        return matematica;
      case 'português':
      case 'portugues':
        return portugues;
      case 'história':
      case 'historia':
        return laranja;
      case 'geografia':
        return esmeralda;
      case 'química':
      case 'quimica':
        return roxo;
      default:
        return destaque;
    }
  }

  // ── Cores do tema escuro (Deep Slate) ───────────────────
  static const Color backgroundDark = Color(0xFF0F172A);      // Slate 900
  static const Color cardBackgroundDark = Color(0xFF1E293B);  // Slate 800
  static const Color cardSecondaryDark = Color(0xFF334155);   // Slate 700
  static const Color textPrimaryDark = Colors.white;
  static const Color textSecondaryDark = Color(0xFF94A3B8);   // Slate 400
  static const Color textHintDark = Color(0xFF64748B);        // Slate 500
  static const Color borderDark = Color(0xFF1E293B);          // Slate 800
  static const Color borderMediumDark = Color(0xFF334155);    // Slate 700

  // ── Cores do tema claro (Clean Slate) ───────────────────
  static const Color backgroundLight = Color(0xFFF8FAFC);     // Slate 50
  static const Color cardBackgroundLight = Color(0xFFFFFFFF);
  static const Color cardSecondaryLight = Color(0xFFF1F5F9);  // Slate 100
  static const Color textPrimaryLight = Color(0xFF0F172A);    // Slate 900
  static const Color textSecondaryLight = Color(0xFF475569);  // Slate 600
  static const Color textHintLight = Color(0xFF94A3B8);       // Slate 400
  static const Color borderLight = Color(0xFFE2E8F0);         // Slate 200
  static const Color borderMediumLight = Color(0xFFCBD5E1);   // Slate 300

  // ── Métodos Dinâmicos Conforme Tema e Acessibilidade ────
  
  static Color background(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    if (accessibilityProvider.highContrast) {
      return isDark ? Colors.black : Colors.white;
    }
    return isDark ? backgroundDark : backgroundLight;
  }

  static Color cardBackground(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    if (accessibilityProvider.highContrast) {
      return isDark ? Colors.black : Colors.white;
    }
    return isDark ? cardBackgroundDark : cardBackgroundLight;
  }

  static Color cardSecondary(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    if (accessibilityProvider.highContrast) {
      return isDark ? Colors.black : Colors.white;
    }
    return isDark ? cardSecondaryDark : cardSecondaryLight;
  }

  static Color textPrimary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? textPrimaryDark
          : textPrimaryLight;

  static Color textSecondary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? textSecondaryDark
          : textSecondaryLight;

  static Color textHint(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? textHintDark
          : textHintLight;

  static Color border(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    if (accessibilityProvider.highContrast) {
      return isDark ? Colors.white : Colors.black;
    }
    return isDark ? borderDark : borderLight;
  }

  static Color borderMedium(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    if (accessibilityProvider.highContrast) {
      return isDark ? Colors.white : Colors.black;
    }
    return isDark ? borderMediumDark : borderMediumLight;
  }
}
