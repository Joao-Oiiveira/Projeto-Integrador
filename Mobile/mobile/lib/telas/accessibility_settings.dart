import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/servicos/accessibility_provider.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

class AccessibilitySettingsScreen extends StatefulWidget {
  const AccessibilitySettingsScreen({super.key});

  @override
  State<AccessibilitySettingsScreen> createState() =>
      _AccessibilitySettingsScreenState();
}

class _AccessibilitySettingsScreenState
    extends State<AccessibilitySettingsScreen> {
  late double _fontSizeMultiplier;
  late bool _highContrast;
  late bool _textToSpeechEnabled;
  late bool _temaClaro;
  late double _espacamentoLinhas;
  late bool _fonteDislexia;

  @override
  void initState() {
    super.initState();
    _fontSizeMultiplier = accessibilityProvider.fontSizeMultiplier;
    _highContrast = accessibilityProvider.highContrast;
    _textToSpeechEnabled = accessibilityProvider.textToSpeechEnabled;
    _temaClaro = accessibilityProvider.temaClaro;
    _espacamentoLinhas = accessibilityProvider.espacamentoLinhas;
    _fonteDislexia = accessibilityProvider.fonteDislexia;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background(context),
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ───────────────────────────────
            _buildHeader(),

            // ── Conteúdo ─────────────────────────────
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Tamanho de fonte ─────────────
                    _buildSectionTitle('Tamanho de Fonte'),
                    const SizedBox(height: 12),
                    _buildFontSizeSelector(),
                    const SizedBox(height: 28),

                    // ── Visual ───────────────────────
                    _buildSectionTitle('Visual'),
                    const SizedBox(height: 12),
                    _buildToggleSetting(
                      icon: Icons.light_mode_outlined,
                      title: 'Tema Claro',
                      subtitle: 'Alterna entre tema escuro e claro',
                      value: _temaClaro,
                      onChanged: (value) {
                        setState(() => _temaClaro = value);
                        accessibilityProvider.setTemaClaro(value);
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildToggleSetting(
                      icon: Icons.contrast,
                      title: 'Alto Contraste',
                      subtitle:
                          'Aumenta o contraste das cores para melhor legibilidade',
                      value: _highContrast,
                      onChanged: (value) {
                        setState(() => _highContrast = value);
                        accessibilityProvider.setHighContrast(value);
                      },
                    ),
                    const SizedBox(height: 28),

                    // ── Leitura ──────────────────────
                    _buildSectionTitle('Leitura'),
                    const SizedBox(height: 12),
                    _buildToggleSetting(
                      icon: Icons.record_voice_over_outlined,
                      title: 'Leitura em Voz Alta',
                      subtitle: 'Ativa leitura automática de textos na tela',
                      value: _textToSpeechEnabled,
                      onChanged: (value) {
                        setState(() => _textToSpeechEnabled = value);
                        accessibilityProvider.setTextToSpeechEnabled(value);
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildToggleSetting(
                      icon: Icons.font_download_outlined,
                      title: 'Fonte para Dislexia',
                      subtitle:
                          'Usa a fonte OpenDyslexic para facilitar a leitura',
                      value: _fonteDislexia,
                      onChanged: (value) {
                        setState(() => _fonteDislexia = value);
                        accessibilityProvider.setFonteDislexia(value);
                      },
                    ),
                    const SizedBox(height: 28),

                    // ── Espaçamento ──────────────────
                    _buildSectionTitle('Espaçamento'),
                    const SizedBox(height: 12),
                    _buildEspacamentoSelector(),
                    const SizedBox(height: 28),

                    // ── Preview ──────────────────────
                    _buildSectionTitle('Visualização'),
                    const SizedBox(height: 12),
                    _buildPreview(),
                    const SizedBox(height: 28),

                    // ── Botão resetar ─────────────────
                    _buildResetButton(),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Widget: Header ───────────────────────────
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        border: Border(bottom: BorderSide(color: AppColors.border(context))),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => context.go('/menu'),
            child: Icon(
              Icons.arrow_back_ios,
              color: AppColors.textPrimary(context),
              size: 22,
            ),
          ),
          const SizedBox(width: 16),
          Text(
            'Acessibilidade',
            style: AppTextStyles.titulo(context, size: 20.0),
          ),
        ],
      ),
    );
  }

  // ── Widget: Título de seção ──────────────────
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.subtitulo(
        context,
        size: 13.0,
        color: AppColors.textHint(context),
      ).copyWith(letterSpacing: 1.1),
    );
  }

  // ── Widget: Seletor de tamanho de fonte ──────
  Widget _buildFontSizeSelector() {
    final opcoes = [
      {'label': 'A', 'size': 12.0, 'value': 0.8, 'nome': 'Pequeno'},
      {'label': 'A', 'size': 14.0, 'value': 1.0, 'nome': 'Normal'},
      {'label': 'A', 'size': 16.0, 'value': 1.2, 'nome': 'Grande'},
      {'label': 'A', 'size': 18.0, 'value': 1.5, 'nome': 'Extra'},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children:
                opcoes.map((opcao) {
                  final bool selecionado =
                      (_fontSizeMultiplier - (opcao['value'] as double)).abs() <
                      0.05;

                  return GestureDetector(
                    onTap: () {
                      final value = opcao['value'] as double;
                      setState(() => _fontSizeMultiplier = value);
                      accessibilityProvider.setFontSizeMultiplier(value);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 68,
                      height: 56,
                      decoration: BoxDecoration(
                        color:
                            selecionado
                                ? AppColors.destaque.withValues(alpha: 0.2)
                                : AppColors.cardSecondary(context),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color:
                              selecionado
                                  ? AppColors.destaque
                                  : AppColors.border(context),
                          width: selecionado ? 1.5 : 1,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          opcao['label'] as String,
                          style: TextStyle(
                            fontSize: opcao['size'] as double,
                            fontWeight:
                                selecionado ? FontWeight.bold : FontWeight.w400,
                            color:
                                selecionado
                                    ? AppColors.destaque
                                    : AppColors.textSecondary(context),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children:
                opcoes.map((opcao) {
                  final bool selecionado =
                      (_fontSizeMultiplier - (opcao['value'] as double)).abs() <
                      0.05;
                  return SizedBox(
                    width: 68,
                    child: Text(
                      opcao['nome'] as String,
                      textAlign: TextAlign.center,
                      style: AppTextStyles.legenda(
                        context,
                        color:
                            selecionado
                                ? AppColors.destaque
                                : AppColors.textHint(context),
                        size: 10.0,
                      ).copyWith(
                        fontWeight:
                            selecionado ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  );
                }).toList(),
          ),
        ],
      ),
    );
  }

  // ── Widget: Seletor de espaçamento ───────────
  Widget _buildEspacamentoSelector() {
    final opcoes = [
      {'label': 'Compacto', 'value': 1.2, 'icon': Icons.density_small},
      {'label': 'Normal', 'value': 1.5, 'icon': Icons.density_medium},
      {'label': 'Espaçado', 'value': 1.8, 'icon': Icons.density_large},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Espaço entre linhas',
            style: AppTextStyles.corpo(
              context,
              color: AppColors.textSecondary(context),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children:
                opcoes.map((opcao) {
                  final bool selecionado =
                      (_espacamentoLinhas - (opcao['value'] as double)).abs() <
                      0.05;

                  return Expanded(
                    child: GestureDetector(
                      onTap: () {
                        final value = opcao['value'] as double;
                        setState(() => _espacamentoLinhas = value);
                        accessibilityProvider.setEspacamentoLinhas(value);
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color:
                              selecionado
                                  ? AppColors.destaque.withValues(alpha: 0.2)
                                  : AppColors.cardSecondary(context),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color:
                                selecionado
                                    ? AppColors.destaque
                                    : AppColors.border(context),
                            width: selecionado ? 1.5 : 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              opcao['icon'] as IconData,
                              color:
                                  selecionado
                                      ? AppColors.destaque
                                      : AppColors.textHint(context),
                              size: 20,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              opcao['label'] as String,
                              style: AppTextStyles.legenda(
                                context,
                                color:
                                    selecionado
                                        ? AppColors.destaque
                                        : AppColors.textSecondary(context),
                                size: 11.0,
                              ).copyWith(
                                fontWeight:
                                    selecionado
                                        ? FontWeight.bold
                                        : FontWeight.normal,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
          ),
        ],
      ),
    );
  }

  // ── Widget: Toggle de configuração ──────────
  Widget _buildToggleSetting({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required Function(bool) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color:
              value
                  ? AppColors.destaque.withValues(alpha: 0.4)
                  : AppColors.border(context),
          width: value ? 1.5 : 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color:
                  value
                      ? AppColors.destaque.withValues(alpha: 0.2)
                      : AppColors.cardSecondary(context),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              color:
                  value ? AppColors.destaque : AppColors.textSecondary(context),
              size: 20,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.subtitulo(context, size: 14.0),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: AppTextStyles.legenda(
                    context,
                    color: AppColors.textHint(context),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Switch(
            value: value,
            activeThumbColor: AppColors.destaque,
            activeTrackColor: AppColors.destaque.withValues(alpha: 0.3),
            inactiveThumbColor: AppColors.textHint(context),
            inactiveTrackColor: AppColors.border(context),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  // ── Widget: Preview ──────────────────────────
  Widget _buildPreview() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.visibility_outlined,
                color: AppColors.textHint(context),
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Como o texto aparecerá',
                style: AppTextStyles.legenda(
                  context,
                  color: AppColors.textHint(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color:
                  _highContrast
                      ? (Theme.of(context).brightness == Brightness.dark
                          ? Colors.black
                          : Colors.white)
                      : AppColors.cardSecondary(context),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border(context)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Matemática',
                  style: TextStyle(
                    fontSize: 18 * _fontSizeMultiplier,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary(context),
                    fontFamily:
                        _fonteDislexia
                            ? 'OpenDyslexic'
                            : AppTextStyles.fontFamilyPadrao,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Este é um exemplo de como o conteúdo aparecerá com as configurações atuais.',
                  style: TextStyle(
                    fontSize: 13 * _fontSizeMultiplier,
                    color: AppColors.textSecondary(context),
                    height: _espacamentoLinhas,
                    fontFamily:
                        _fonteDislexia
                            ? 'OpenDyslexic'
                            : AppTextStyles.fontFamilyPadrao,
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.destaque.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.destaque.withValues(alpha: 0.4),
                    ),
                  ),
                  child: Text(
                    'Botão de exemplo',
                    style: TextStyle(
                      fontSize: 13 * _fontSizeMultiplier,
                      color: AppColors.destaque,
                      fontWeight: FontWeight.w600,
                      fontFamily:
                          _fonteDislexia
                              ? 'OpenDyslexic'
                              : AppTextStyles.fontFamilyPadrao,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Widget: Botão resetar configurações ──────
  Widget _buildResetButton() {
    return GestureDetector(
      onTap: () {
        setState(() {
          _fontSizeMultiplier = 1.0;
          _highContrast = false;
          _textToSpeechEnabled = false;
          _temaClaro = false;
          _espacamentoLinhas = 1.5;
          _fonteDislexia = false;
        });
        accessibilityProvider.setFontSizeMultiplier(1.0);
        accessibilityProvider.setHighContrast(false);
        accessibilityProvider.setTextToSpeechEnabled(false);
        accessibilityProvider.setTemaClaro(false);
        accessibilityProvider.setEspacamentoLinhas(1.5);
        accessibilityProvider.setFonteDislexia(false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Configurações restauradas ao padrão',
              style: AppTextStyles.corpo(
                context,
                color: AppColors.background(context),
              ),
            ),
            backgroundColor: AppColors.textPrimary(context),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.refresh, color: AppColors.textHint(context), size: 18),
            const SizedBox(width: 8),
            Text(
              'Restaurar padrões',
              style: AppTextStyles.subtitulo(
                context,
                size: 14.0,
                color: AppColors.textHint(context),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
