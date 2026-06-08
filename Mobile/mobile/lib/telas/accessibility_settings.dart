import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/servicos/accessibility_provider.dart';
import 'package:mobile/tema/app_colors.dart';

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

  double _getFontSize(double base) => base * _fontSizeMultiplier;

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
                        // 🔧 BACK-END: Salvar preferência de tema do usuário
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
                        // 🔧 BACK-END: Integrar com flutter_tts para leitura real
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
                        // 🔧 BACK-END: Aplicar fonte OpenDyslexic globalmente
                        // Requer assets/fonts/OpenDyslexic configurado no pubspec.yaml
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
      decoration: const BoxDecoration(
        color: Color(0xFF1E1E1E),
        border: Border(bottom: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => context.go('/menu'),
            child: const Icon(
              Icons.arrow_back_ios,
              color: Colors.white,
              size: 22,
            ),
          ),
          const SizedBox(width: 16),
          Text(
            'Acessibilidade',
            style: TextStyle(
              fontSize: _getFontSize(20),
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  // ── Widget: Título de seção ──────────────────
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: _getFontSize(13),
        fontWeight: FontWeight.w700,
        color: Colors.white54,
        letterSpacing: 1.1,
      ),
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
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
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
                                ? AppColors.destaque.withOpacity(0.2)
                                : const Color(0xFF2A2A2A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color:
                              selecionado ? AppColors.destaque : Colors.white12,
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
                                    : Colors.white54,
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
                      style: TextStyle(
                        fontSize: 10,
                        color:
                            selecionado ? AppColors.destaque : Colors.white24,
                        fontWeight:
                            selecionado ? FontWeight.w600 : FontWeight.w400,
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
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Espaço entre linhas',
            style: TextStyle(fontSize: _getFontSize(13), color: Colors.white54),
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
                        // 🔧 BACK-END: Salvar preferência de espaçamento
                        accessibilityProvider.setEspacamentoLinhas(value);
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color:
                              selecionado
                                  ? AppColors.destaque.withOpacity(0.2)
                                  : const Color(0xFF2A2A2A),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color:
                                selecionado
                                    ? AppColors.destaque
                                    : Colors.white12,
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
                                      : Colors.white38,
                              size: 20,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              opcao['label'] as String,
                              style: TextStyle(
                                fontSize: 11,
                                color:
                                    selecionado
                                        ? AppColors.destaque
                                        : Colors.white38,
                                fontWeight:
                                    selecionado
                                        ? FontWeight.w600
                                        : FontWeight.w400,
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
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: value ? AppColors.destaque.withOpacity(0.4) : Colors.white12,
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
                      ? AppColors.destaque.withOpacity(0.2)
                      : const Color(0xFF2A2A2A),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              color: value ? AppColors.destaque : Colors.white38,
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
                  style: TextStyle(
                    fontSize: _getFontSize(14),
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: _getFontSize(11),
                    color: Colors.white38,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Switch(
            value: value,
            activeColor: AppColors.destaque,
            activeTrackColor: AppColors.destaque.withOpacity(0.3),
            inactiveThumbColor: Colors.white38,
            inactiveTrackColor: Colors.white12,
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
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.visibility_outlined,
                color: Colors.white38,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Como o texto aparecerá',
                style: TextStyle(
                  fontSize: _getFontSize(12),
                  color: Colors.white38,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _highContrast ? Colors.black : const Color(0xFF2A2A2A),
              borderRadius: BorderRadius.circular(8),
              border: _highContrast ? Border.all(color: Colors.white38) : null,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Matemática',
                  style: TextStyle(
                    fontSize: _getFontSize(18),
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    // 🔧 Fonte para dislexia aplicada aqui quando disponível
                    fontFamily: _fonteDislexia ? 'OpenDyslexic' : null,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Este é um exemplo de como o conteúdo aparecerá com as configurações atuais.',
                  style: TextStyle(
                    fontSize: _getFontSize(13),
                    color: Colors.white70,
                    // 🔧 Espaçamento entre linhas aplicado aqui
                    height: _espacamentoLinhas,
                    fontFamily: _fonteDislexia ? 'OpenDyslexic' : null,
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.destaque.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.destaque.withOpacity(0.4),
                    ),
                  ),
                  child: Text(
                    'Botão de exemplo',
                    style: TextStyle(
                      fontSize: _getFontSize(13),
                      color: AppColors.destaque,
                      fontWeight: FontWeight.w600,
                      fontFamily: _fonteDislexia ? 'OpenDyslexic' : null,
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
            content: const Text('Configurações restauradas ao padrão'),
            backgroundColor: AppColors.background(context),
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
          border: Border.all(color: Colors.white12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.refresh, color: Colors.white38, size: 18),
            const SizedBox(width: 8),
            Text(
              'Restaurar padrões',
              style: TextStyle(
                fontSize: _getFontSize(14),
                color: Colors.white38,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
