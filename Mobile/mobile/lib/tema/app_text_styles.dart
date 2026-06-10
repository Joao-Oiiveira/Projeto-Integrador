import 'package:flutter/material.dart';
import 'package:mobile/servicos/accessibility_provider.dart';

class AppTextStyles {
  // ── Nome da fonte padrão do sistema ─────────────────────
  // Se futuramente você quiser trocar a fonte padrão do app, basta alterar esta variável!
  static const String fontFamilyPadrao = 'Arial';

  // Retorna a família de fonte correta conforme preferências de acessibilidade
  static String? getFontFamily() {
    return accessibilityProvider.fonteDislexia
        ? 'OpenDyslexic'
        : fontFamilyPadrao;
  }

  // Helper para obter a cor do texto com base no tema e modo alto contraste
  static Color _getTextColor(BuildContext context, {required bool isPrimary}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (accessibilityProvider.highContrast) {
      return isDark ? Colors.white : Colors.black;
    }

    if (isPrimary) {
      return isDark ? Colors.white : const Color(0xFF1A1A1A);
    } else {
      return isDark ? Colors.white70 : const Color(0xFF555555);
    }
  }

  // ── Estilos de Texto Principais ─────────────────────────

  static TextStyle titulo(
    BuildContext context, {
    Color? color,
    double size = 24.0,
  }) {
    return TextStyle(
      fontFamily: getFontFamily(),
      fontSize: size * accessibilityProvider.fontSizeMultiplier,
      fontWeight: FontWeight.bold,
      height: accessibilityProvider.espacamentoLinhas,
      color: color ?? _getTextColor(context, isPrimary: true),
    );
  }

  static TextStyle subtitulo(
    BuildContext context, {
    Color? color,
    double size = 16.0,
    FontWeight fontWeight = FontWeight.w600,
  }) {
    return TextStyle(
      fontFamily: getFontFamily(),
      fontSize: size * accessibilityProvider.fontSizeMultiplier,
      fontWeight: fontWeight,
      height: accessibilityProvider.espacamentoLinhas,
      color: color ?? _getTextColor(context, isPrimary: true),
    );
  }

  static TextStyle corpo(
    BuildContext context, {
    Color? color,
    double size = 14.0,
    FontWeight fontWeight = FontWeight.normal,
  }) {
    return TextStyle(
      fontFamily: getFontFamily(),
      fontSize: size * accessibilityProvider.fontSizeMultiplier,
      fontWeight: fontWeight,
      height: accessibilityProvider.espacamentoLinhas,
      color: color ?? _getTextColor(context, isPrimary: false),
    );
  }

  static TextStyle legenda(
    BuildContext context, {
    Color? color,
    double size = 12.0,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return TextStyle(
      fontFamily: getFontFamily(),
      fontSize: size * accessibilityProvider.fontSizeMultiplier,
      height: accessibilityProvider.espacamentoLinhas,
      color: color ?? (isDark ? Colors.white38 : const Color(0xFF999999)),
    );
  }

  static TextStyle botao(
    BuildContext context, {
    Color? color,
    double size = 15.0,
  }) {
    return TextStyle(
      fontFamily: getFontFamily(),
      fontSize: size * accessibilityProvider.fontSizeMultiplier,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.3,
      color: color ?? Colors.white,
    );
  }
}
