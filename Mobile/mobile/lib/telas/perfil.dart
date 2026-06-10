import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/servicos/accessibility_provider.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  String _userName = 'João Oliveira';
  String _userEmail = 'joao.oliveira@eduaccess.com';

  @override
  void initState() {
    super.initState();
    _loadUserData();
    // Escuta mudanças nas preferências de acessibilidade para atualizar a tela caso mude o tema pelo modal de configurações
    accessibilityProvider.addListener(_onAccessibilityChanged);
  }

  @override
  void dispose() {
    accessibilityProvider.removeListener(_onAccessibilityChanged);
    super.dispose();
  }

  void _onAccessibilityChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userName = prefs.getString('userName') ?? 'João Oliveira';
      _userEmail = prefs.getString('userEmail') ?? 'joao.oliveira@eduaccess.com';
    });
  }

  String _getInitials(String name) {
    if (name.isEmpty) return 'E';
    final parts = name.trim().split(' ');
    if (parts.length > 1) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  void _mostrarConfiguracoes(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          return Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.cardBackground(context),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border.all(color: AppColors.border(context)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    const Icon(Icons.settings_outlined, color: AppColors.destaque),
                    const SizedBox(width: 10),
                    Text(
                      'Configurações da Conta',
                      style: AppTextStyles.subtitulo(context, size: 18.0),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Alternar tema
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Tema do Aplicativo',
                          style: AppTextStyles.subtitulo(context, size: 15.0),
                        ),
                        Text(
                          isDark ? 'Tema Escuro Ativo' : 'Tema Claro Ativo',
                          style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                        ),
                      ],
                    ),
                    Switch(
                      value: accessibilityProvider.temaClaro,
                      onChanged: (v) {
                        accessibilityProvider.setTemaClaro(v);
                        setModalState(() {}); // Atualiza o estado interno do modal
                      },
                      activeColor: AppColors.destaque,
                      activeTrackColor: AppColors.destaque.withOpacity(0.3),
                      inactiveThumbColor: AppColors.textHint(context),
                      inactiveTrackColor: AppColors.border(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 16),
                // Botão de Logout
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      context.go('/login');
                    },
                    icon: const Icon(Icons.logout, color: AppColors.incorreto),
                    label: Text('Sair da Conta', style: AppTextStyles.botao(context, color: AppColors.incorreto)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.incorreto),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final initials = _getInitials(_userName);

    return Scaffold(
      backgroundColor: AppColors.background(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: AppColors.textPrimary(context)),
          onPressed: () => context.go('/menu'),
        ),
        title: Text(
          'Meu Perfil',
          style: AppTextStyles.subtitulo(context, size: 18.0),
        ),
        actions: [
          // Ícone de Configurações no canto superior direito conforme sugerido!
          IconButton(
            icon: Icon(Icons.settings_outlined, color: AppColors.textPrimary(context)),
            onPressed: () => _mostrarConfiguracoes(context),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── Cabeçalho do Perfil (Avatar + Info) ───────
              Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: AppColors.destaque,
                      child: Text(
                        initials,
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _userName,
                      style: AppTextStyles.titulo(context, size: 22.0),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _userEmail,
                      style: AppTextStyles.corpo(context, color: AppColors.textSecondary(context)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // ── Seção: Perfil Educacional Ativo ───────────
              Text(
                'Perfil Educacional & Adaptações',
                style: AppTextStyles.subtitulo(context, size: 16.0, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground(context),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border(context)),
                ),
                child: Column(
                  children: [
                    _buildPreferenciaItem(
                      icon: Icons.menu_book_outlined,
                      label: 'Leitura Dinâmica (Dislexia)',
                      valor: accessibilityProvider.dificuldadeLeitura ? 'Ativa (OpenDyslexic)' : 'Inativa',
                      ativo: accessibilityProvider.dificuldadeLeitura,
                    ),
                    const Divider(),
                    _buildPreferenciaItem(
                      icon: Icons.psychology_outlined,
                      label: 'Foco e Atenção (TDAH)',
                      valor: accessibilityProvider.tdah ? 'Ativo (Layout Minimalista)' : 'Inativo',
                      ativo: accessibilityProvider.tdah,
                    ),
                    const Divider(),
                    _buildPreferenciaItem(
                      icon: Icons.remove_red_eye_outlined,
                      label: 'Sensibilidade Visual (Autismo)',
                      valor: accessibilityProvider.autismo ? 'Ativo (Alto Contraste)' : 'Inativo',
                      ativo: accessibilityProvider.autismo,
                    ),
                    const Divider(),
                    _buildPreferenciaItem(
                      icon: Icons.auto_awesome_outlined,
                      label: 'Tipo de Conteúdo Preferido',
                      valor: _getPreferenciaConteudoTexto(accessibilityProvider.preferenciaConteudo),
                      ativo: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ── Seção: Ações Rápidas ──────────────────────
              Text(
                'Ações Rápidas',
                style: AppTextStyles.subtitulo(context, size: 16.0, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              // Botão para Refazer Perfil Educacional
              _buildActionButton(
                icon: Icons.edit_note_outlined,
                title: 'Refazer Perfil Educacional',
                subtitle: 'Ajuste seu questionário de adaptação cognitiva e acessibilidade.',
                onTap: () => context.go('/perfil-educacional'),
              ),
              const SizedBox(height: 12),

              // Botão para Ir para Ajustes Finos de Acessibilidade
              _buildActionButton(
                icon: Icons.accessibility_new_outlined,
                title: 'Configurações de Acessibilidade',
                subtitle: 'Personalize o tamanho do texto, contraste, velocidade de voz e espaçamento.',
                onTap: () => context.go('/acessibilidade'),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPreferenciaItem({
    required IconData icon,
    required String label,
    required String valor,
    required bool ativo,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: ativo ? AppColors.destaque : AppColors.textHint(context), size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTextStyles.corpo(context, fontWeight: FontWeight.bold),
                ),
                Text(
                  valor,
                  style: AppTextStyles.legenda(
                    context,
                    color: ativo ? AppColors.destaque : AppColors.textSecondary(context),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getPreferenciaConteudoTexto(String pref) {
    switch (pref) {
      case 'visual':
        return 'Visual (Tabelas e Resumos Diretos)';
      case 'auditivo':
        return 'Auditivo (Explicações por Áudio/Voz)';
      case 'texto':
      default:
        return 'Leitura (Textos Completos e Detalhados)';
    }
  }

  Widget _buildActionButton({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBackground(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.cardSecondary(context),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.destaque, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.subtitulo(context, size: 15.0),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, color: AppColors.textHint(context), size: 16),
          ],
        ),
      ),
    );
  }
}
