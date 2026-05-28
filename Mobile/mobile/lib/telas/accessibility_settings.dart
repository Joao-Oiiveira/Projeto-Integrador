import 'package:flutter/material.dart';
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

  @override
  void initState() {
    super.initState();
    _fontSizeMultiplier = accessibilityProvider.fontSizeMultiplier;
    _highContrast = accessibilityProvider.highContrast;
    _textToSpeechEnabled = accessibilityProvider.textToSpeechEnabled;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E1E),
        title: Text(
          'Acessibilidade',
          style: TextStyle(
            fontSize: 20 * _fontSizeMultiplier,
            fontWeight: FontWeight.bold,
          ),
        ),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Tamanho de fonte ─────────────────────
            _buildSectionTitle('Tamanho de Fonte'),
            const SizedBox(height: 16),
            _buildFontSizeSlider(),
            const SizedBox(height: 24),

            // ── Alto Contraste ──────────────────────
            _buildSectionTitle('Tema'),
            const SizedBox(height: 16),
            _buildHighContrastToggle(),
            const SizedBox(height: 24),

            // ── Text-to-Speech ─────────────────────
            _buildSectionTitle('Leitura de Voz'),
            const SizedBox(height: 16),
            _buildTextToSpeechToggle(),
            const SizedBox(height: 32),

            // ── Preview ─────────────────────────────
            _buildPreview(),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 18 * _fontSizeMultiplier,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
    );
  }

  Widget _buildFontSizeSlider() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tamanho:',
                style: TextStyle(
                  fontSize: 14 * _fontSizeMultiplier,
                  color: Colors.white70,
                ),
              ),
              Text(
                '${(_fontSizeMultiplier * 100).toStringAsFixed(0)}%',
                style: TextStyle(
                  fontSize: 14 * _fontSizeMultiplier,
                  fontWeight: FontWeight.bold,
                  color: AppColors.destaque,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Slider(
            value: _fontSizeMultiplier,
            min: 0.8,
            max: 1.5,
            divisions: 7,
            activeColor: AppColors.destaque,
            inactiveColor: Colors.white24,
            onChanged: (value) {
              setState(() {
                _fontSizeMultiplier = value;
              });
              accessibilityProvider.setFontSizeMultiplier(value);
            },
            semanticFormatterCallback: (double value) {
              return '${(value * 100).toStringAsFixed(0)}%';
            },
          ),
          const SizedBox(height: 12),
          Text(
            'Pequeno                Normal               Grande',
            style: TextStyle(
              fontSize: 11 * _fontSizeMultiplier,
              color: Colors.white54,
            ),
            textAlign: TextAlign.justify,
          ),
        ],
      ),
    );
  }

  Widget _buildHighContrastToggle() {
    return _buildToggleSetting(
      title: 'Alto Contraste',
      subtitle: 'Aumenta o contraste das cores para melhor legibilidade',
      value: _highContrast,
      onChanged: (value) {
        setState(() {
          _highContrast = value;
        });
        accessibilityProvider.setHighContrast(value);
      },
    );
  }

  Widget _buildTextToSpeechToggle() {
    return _buildToggleSetting(
      title: 'Leitura de Voz (Text-to-Speech)',
      subtitle: 'Ativa leitura automática de textos quando necessário',
      value: _textToSpeechEnabled,
      onChanged: (value) {
        setState(() {
          _textToSpeechEnabled = value;
        });
        accessibilityProvider.setTextToSpeechEnabled(value);
      },
    );
  }

  Widget _buildToggleSetting({
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
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14 * _fontSizeMultiplier,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12 * _fontSizeMultiplier,
                    color: Colors.white54,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Switch(
            value: value,
            activeColor: AppColors.destaque,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

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
          Text(
            'Visualização',
            style: TextStyle(
              fontSize: 16 * _fontSizeMultiplier,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _highContrast ? Colors.black : const Color(0xFF2A2A2A),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'Este é um exemplo de como o texto aparecerá com as configurações atuais.',
              style: TextStyle(
                fontSize: 14 * _fontSizeMultiplier,
                color: Colors.white,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
