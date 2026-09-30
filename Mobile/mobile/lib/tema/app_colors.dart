import 'package:flutter/material.dart';

class AppColors {
  // ── Cores das matérias — ficam iguais nos dois temas ────
  static const Color matematica = Color(0xFF0088FF);
  static const Color portugues = Color(0xFFE95353);
  static const Color destaque = Color(0xFF7EB8F7);

  // ── Cores de feedback ──────────────────────────────────
  static const Color correto = Color(0xFF2E7D32); // Verde escuro para melhor contraste
  static const Color incorreto = Color(0xFFC62828); // Vermelho escuro para melhor contraste

  // Helper para buscar cor por nome
  static Color materiaCor(String nome) {
    switch (nome.toLowerCase()) {
      case 'matemática':
      case 'matematica':
        return matematica;
      case 'português':
      case 'portugues':
        return portugues;
      default:
        return destaque;
    }
  }

  // ── Cores do tema escuro ─────────────────────────────────
  static const Color backgroundDark = Color(0xFF121212);
  static const Color cardBackgroundDark = Color(0xFF1E1E1E);
  static const Color cardSecondaryDark = Color(0xFF2A2A2A);
  static const Color textPrimaryDark = Colors.white;
  static const Color textSecondaryDark = Colors.white70;
  static const Color textHintDark = Colors.white38;
  static const Color borderDark = Colors.white12;
  static const Color borderMediumDark = Colors.white24;

  // ── Cores do tema claro ──────────────────────────────────
  static const Color backgroundLight = Color(0xFFF5F5F5);
  static const Color cardBackgroundLight = Color(0xFFFFFFFF);
  static const Color cardSecondaryLight = Color(0xFFEEEEEE);
  static const Color textPrimaryLight = Color(0xFF1A1A1A);
  static const Color textSecondaryLight = Color(0xFF555555);
  static const Color textHintLight = Color(0xFF999999);
  static const Color borderLight = Color(0xFFDDDDDD);
  static const Color borderMediumLight = Color(0xFFCCCCCC);

  // ── Método para pegar a cor certa conforme o tema ────────
  // Uso: AppColors.background(context)
  static Color background(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? backgroundDark
          : backgroundLight;

  static Color cardBackground(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? cardBackgroundDark
          : cardBackgroundLight;

  static Color cardSecondary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? cardSecondaryDark
          : cardSecondaryLight;

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

  static Color border(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? borderDark
          : borderLight;

  static Color borderMedium(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? borderMediumDark
          : borderMediumLight;
}
