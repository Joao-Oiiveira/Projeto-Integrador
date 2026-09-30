import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/servicos/accessibility_provider.dart';
import 'package:mobile/servicos/api_service.dart';
import 'package:mobile/tema/app_colors.dart';

import 'package:mobile/tema/app_text_styles.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  String _userName = 'Usuário';
  int _nivelUsuario = 1;
  int _ofensivaDias = 0;
  int _totalDisciplinas = 0;
  List<dynamic> _conquistas = [];
  List<dynamic> _progressoDisciplinas = [];

  @override
  void initState() {
    super.initState();
    _loadUserData();
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
    if (mounted) {
      setState(() {
        _userName = prefs.getString('userName') ?? 'Usuário';
        _nivelUsuario = prefs.getInt('nivelUsuario') ?? 1;
      });
    }

    try {
      final perfil = await ApiService().obterPerfilLogado();
      if (perfil['nome'] != null && mounted) {
        setState(() {
          _userName = perfil['nome'].toString();
          if (perfil['nivel'] != null) {
            _nivelUsuario = perfil['nivel'];
          }
        });
        await prefs.setString('userName', perfil['nome'].toString());
        await prefs.setInt('nivelUsuario', _nivelUsuario);
      }
    } catch (_) {}

    try {
      final stats = await ApiService().obterEstatisticas();
      if (mounted) {
        setState(() {
          _ofensivaDias = stats['ofensiva_dias'] ?? 0;
          _totalDisciplinas = stats['total_disciplinas'] ?? 0;
          if (stats['conquistas'] != null) {
            _conquistas = stats['conquistas'];
          }
          if (stats['progresso_disciplinas'] != null) {
            _progressoDisciplinas = stats['progresso_disciplinas'];
          }
        });
      }
    } catch (_) {}
  }

  void _mostrarConfiguracoes(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder:
          (context) => StatefulBuilder(
            builder: (context, setModalState) {
              final isDark = Theme.of(context).brightness == Brightness.dark;
              return Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground(context),
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(24),
                  ),
                  border: Border.all(color: AppColors.border(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.settings_outlined,
                          color: AppColors.destaque,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Opções Rápidas',
                          style: AppTextStyles.subtitulo(context, size: 18.0),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Tema Claro/Escuro',
                              style: AppTextStyles.subtitulo(
                                context,
                                size: 15.0,
                              ),
                            ),
                            Text(
                              isDark ? 'Tema Escuro Ativo' : 'Tema Claro Ativo',
                              style: AppTextStyles.legenda(
                                context,
                                color: AppColors.textSecondary(context),
                              ),
                            ),
                          ],
                        ),
                        Switch(
                          value: accessibilityProvider.temaClaro,
                          onChanged: (v) {
                            accessibilityProvider.setTemaClaro(v);
                            setModalState(() {});
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
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          context.go('/login');
                        },
                        icon: const Icon(
                          Icons.logout,
                          color: AppColors.incorreto,
                        ),
                        label: Text(
                          'Sair da Conta',
                          style: AppTextStyles.botao(
                            context,
                            color: AppColors.incorreto,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.incorreto),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
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

  // ── 1. MODAL CENTRAL (DIALOG) DE CONQUISTAS ──────────
  void _mostrarDialogConquistas(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder:
          (context) => Dialog(
            backgroundColor: Colors.transparent,
            child: Container(
              padding: const EdgeInsets.all(24),
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.75,
                maxWidth: 340,
              ),
              decoration: BoxDecoration(
                color: AppColors.cardBackground(context),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.border(context)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Cabeçalho da Conquista
                  Row(
                    children: [
                      const Icon(
                        Icons.verified_outlined,
                        color: Color(0xFFBA68C8),
                        size: 24,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Suas Conquistas',
                        style: AppTextStyles.subtitulo(
                          context,
                          size: 18.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Lista de Conquistas
                  Flexible(
                    child: SingleChildScrollView(
                      child: Column(
                        children:
                            _conquistas.isEmpty
                                ? [
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 20,
                                    ),
                                    child: Center(
                                      child: Text(
                                        'Nenhuma conquista ainda.',
                                        style: AppTextStyles.legenda(context),
                                      ),
                                    ),
                                  ),
                                ]
                                : _conquistas.map((c) {
                                  IconData iconData = Icons.emoji_events;
                                  if (c['icone'] == 'menu_book')
                                    iconData = Icons.menu_book;
                                  if (c['icone'] == 'calculate')
                                    iconData = Icons.calculate;
                                  if (c['icone'] == 'edit_note')
                                    iconData = Icons.edit_note;
                                  if (c['icone'] == 'wb_sunny_outlined')
                                    iconData = Icons.wb_sunny_outlined;

                                  bool desbloqueada =
                                      c['desbloqueada'] ?? false;
                                  Color iconColor =
                                      desbloqueada
                                          ? Color(
                                            int.parse(
                                              (c['cor_icone'] as String)
                                                  .replaceAll('#', '0x'),
                                            ),
                                          )
                                          : Colors.grey;
                                  Color bgColor =
                                      desbloqueada
                                          ? Color(
                                            int.parse(
                                              (c['cor_fundo'] as String)
                                                  .replaceAll('#', '0x'),
                                            ),
                                          )
                                          : AppColors.cardSecondary(context);

                                  return Column(
                                    children: [
                                      _buildConquistaDetalheItem(
                                        icon:
                                            desbloqueada
                                                ? iconData
                                                : Icons.lock_outline,
                                        iconColor: iconColor,
                                        backgroundColor: bgColor,
                                        title: c['titulo'],
                                        desc: c['descricao'],
                                        desbloqueado: desbloqueada,
                                        progresso:
                                            '${c['progresso']}/${c['meta_objetivo']}',
                                      ),
                                      const Divider(),
                                    ],
                                  );
                                }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Botões no estilo da imagem fornecida
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(
                              0xFFE55D5D,
                            ), // Vermelho (Cancelar)
                            foregroundColor: Colors.white,
                            elevation: 3,
                            shadowColor: Colors.black38,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: const Text(
                            'CANCELAR',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildConquistaDetalheItem({
    required IconData icon,
    required Color iconColor,
    required Color backgroundColor,
    required String title,
    required String desc,
    required bool desbloqueado,
    String? progresso,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: backgroundColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.subtitulo(
                    context,
                    size: 14.0,
                    fontWeight: FontWeight.bold,
                  ).copyWith(
                    color:
                        desbloqueado
                            ? AppColors.textPrimary(context)
                            : AppColors.textHint(context),
                  ),
                ),
                Text(
                  desc,
                  style: AppTextStyles.legenda(
                    context,
                    color: AppColors.textSecondary(context),
                    size: 11.0,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 6),
          if (desbloqueado)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.correto.withOpacity(0.12),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'OK',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: AppColors.correto,
                ),
              ),
            )
          else if (progresso != null)
            Text(
              progresso,
              style: AppTextStyles.legenda(
                context,
                color: AppColors.textHint(context),
                size: 11.0,
              ).copyWith(fontWeight: FontWeight.bold),
            ),
        ],
      ),
    );
  }

  // ── 2. MODAL CENTRAL (DIALOG) DE DISCIPLINAS Ativas ─────
  void _mostrarDialogDisciplinas(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder:
          (context) => Dialog(
            backgroundColor: Colors.transparent,
            child: Container(
              padding: const EdgeInsets.all(24),
              constraints: const BoxConstraints(maxWidth: 340),
              decoration: BoxDecoration(
                color: AppColors.cardBackground(context),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.border(context)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Cabeçalho
                  Row(
                    children: [
                      const Icon(
                        Icons.bar_chart_outlined,
                        color: Colors.teal,
                        size: 24,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Suas Disciplinas',
                        style: AppTextStyles.subtitulo(
                          context,
                          size: 18.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Disciplinas ativas com a porcentagem feita
                  _buildDisciplinaDialogItem(
                    nome: 'Matemática',
                    abreviacao: 'M',
                    cor: AppColors.matematica,
                    porcentagemConcluida: 0.75, // 75% feito
                    estatisticas: '75% concluído',
                    onTapIr: () {
                      Navigator.pop(context);
                      context.go('/materia/Matemática');
                    },
                  ),
                  const Divider(),
                  _buildDisciplinaDialogItem(
                    nome: 'Português',
                    abreviacao: 'P',
                    cor: AppColors.portugues,
                    porcentagemConcluida: 0.45, // 45% feito
                    estatisticas: '45% concluído',
                    onTapIr: () {
                      Navigator.pop(context);
                      context.go('/materia/Português');
                    },
                  ),
                  const SizedBox(height: 24),

                  // Botões inferiores
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(
                              0xFFE55D5D,
                            ), // Vermelho
                            foregroundColor: Colors.white,
                            elevation: 3,
                            shadowColor: Colors.black38,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: const Text(
                            'CANCELAR',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildDisciplinaDialogItem({
    required String nome,
    required String abreviacao,
    required Color cor,
    required double porcentagemConcluida,
    required String estatisticas,
    required VoidCallback onTapIr,
  }) {
    final int percentValue = (porcentagemConcluida * 100).toInt();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: cor,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Center(
                  child: Text(
                    abreviacao,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      nome,
                      style: AppTextStyles.subtitulo(
                        context,
                        size: 15.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      estatisticas,
                      style: AppTextStyles.legenda(
                        context,
                        color: AppColors.textSecondary(context),
                        size: 11.0,
                      ),
                    ),
                  ],
                ),
              ),
              OutlinedButton(
                onPressed: onTapIr,
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: cor),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 2,
                  ),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  'Ver',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: cor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: LinearProgressIndicator(
                  value: porcentagemConcluida,
                  backgroundColor: AppColors.cardSecondary(context),
                  valueColor: AlwaysStoppedAnimation<Color>(cor),
                  minHeight: 6,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                '$percentValue%',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: cor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios,
            color: AppColors.textPrimary(context),
          ),
          onPressed: () => context.go('/menu'),
        ),
        title: Text(
          'Perfil',
          style: AppTextStyles.subtitulo(context, size: 18.0),
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.settings_outlined,
              color: AppColors.textPrimary(context),
            ),
            onPressed: () => _mostrarConfiguracoes(context),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── 1. CARD DO USUÁRIO ────────────────────────
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground(context),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border(context)),
                ),
                child: Row(
                  children: [
                    // Avatar com Nível
                    Stack(
                      alignment: Alignment.bottomCenter,
                      children: [
                        CircleAvatar(
                          radius: 38,
                          backgroundColor: AppColors.destaque.withOpacity(0.2),
                          child: CircleAvatar(
                            radius: 34,
                            backgroundColor: AppColors.destaque,
                            child: Text(
                              _userName.isNotEmpty
                                  ? _userName[0].toUpperCase()
                                  : 'E',
                              style: const TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        Transform.translate(
                          offset: const Offset(0, 6),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF9C27B0), // Roxo
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'NÍVEL $_nivelUsuario',
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _userName,
                            style: AppTextStyles.subtitulo(
                              context,
                              size: 18.0,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Membro desde Jun 2026',
                            style: AppTextStyles.legenda(
                              context,
                              color: AppColors.textSecondary(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ── 2. RESUMO DE ATIVIDADES (GRID 2x2) ────────
              Text(
                'RESUMO DE ATIVIDADES',
                style: AppTextStyles.legenda(
                  context,
                  color: AppColors.textSecondary(context),
                ).copyWith(fontWeight: FontWeight.bold, letterSpacing: 0.8),
              ),
              const SizedBox(height: 12),

              // Linha 1 da Grid (Ofensiva e XP)
              Row(
                children: [
                  Expanded(child: _buildOfensivaGridCard()),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildGridPlaceholderCard(
                      icon: Icons.bolt,
                      iconColor: Colors.blue,
                      title: 'TOTAL XP',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Linha 2 da Grid (Conquistas e Disciplinas)
              Row(
                children: [
                  Expanded(child: _buildConquistasGridCard()),
                  const SizedBox(width: 12),
                  Expanded(child: _buildDisciplinasGridCard()),
                ],
              ),
              const SizedBox(height: 24),

              // ── 3. PROGRESSO ──────────────────────────────
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground(context),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.show_chart,
                          color: AppColors.destaque,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Progresso (Índice de Acertos)',
                          style: AppTextStyles.subtitulo(
                            context,
                            size: 16.0,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    if (_progressoDisciplinas.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Text(
                          'Nenhum exercício resolvido ainda.',
                          style: AppTextStyles.legenda(
                            context,
                            color: AppColors.textSecondary(context),
                          ),
                        ),
                      )
                    else
                      ..._progressoDisciplinas.map((progresso) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: _buildProgressBarItem(
                            label: (progresso['nome'] as String).toUpperCase(),
                            valor: (progresso['taxa_acerto'] as num).toDouble(),
                            color: Color(
                              int.parse(
                                (progresso['cor'] as String).replaceAll(
                                  '#',
                                  '0x',
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ── 4. CONFIGURAÇÕES & AJUSTES ────────────────
              Text(
                'CONFIGURAÇÕES',
                style: AppTextStyles.legenda(
                  context,
                  color: AppColors.textSecondary(context),
                ).copyWith(fontWeight: FontWeight.bold, letterSpacing: 0.8),
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.cardBackground(context),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border(context)),
                ),
                child: Column(
                  children: [
                    _buildSettingsRow(
                      icon: Icons.remove_red_eye_outlined,
                      title: 'Acessibilidade',
                      subtitle: 'Controle e fontes',
                      onTap: () => context.go('/acessibilidade'),
                    ),
                    const Divider(height: 1),
                    _buildSettingsRow(
                      icon: Icons.palette_outlined,
                      title: 'Tema',
                      subtitle: 'Personalizar cores',
                      onTap: () => _mostrarConfiguracoes(context),
                    ),
                    const Divider(height: 1),
                    _buildSettingsRow(
                      icon: Icons.edit_note_outlined,
                      title: 'Perfil Educacional',
                      subtitle: 'Ajustar preferências cognitivas',
                      onTap: () => context.go('/perfil-educacional'),
                    ),
                    const Divider(height: 1),
                    _buildSettingsRow(
                      icon: Icons.logout,
                      title: 'Sair',
                      subtitle: 'Desconectar conta',
                      onTap: () => context.go('/login'),
                      isDestructive: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // Helper: Status Chips
  Widget _buildStatusChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }

  // Card Ofensiva
  Widget _buildOfensivaGridCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.local_fire_department,
                color: Colors.orange,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'OFENSIVA',
                style: AppTextStyles.legenda(
                  context,
                  color: AppColors.textSecondary(context),
                ).copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '$_ofensivaDias',
                style: AppTextStyles.titulo(context, size: 24.0),
              ),
              const SizedBox(width: 4),
              Text(
                'dias',
                style: AppTextStyles.legenda(
                  context,
                  color: AppColors.textSecondary(context),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Card Conquistas (com visualizadores de conquistas dentro e que expande ao clicar)
  Widget _buildConquistasGridCard() {
    return GestureDetector(
      onTap: () => _mostrarDialogConquistas(context),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBackground(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.verified_outlined,
                  color: Color(0xFFBA68C8),
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'CONQUISTAS',
                  style: AppTextStyles.legenda(
                    context,
                    color: AppColors.textSecondary(context),
                  ).copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children:
                  _conquistas.isEmpty
                      ? [
                        _buildMiniBadge(
                          Icons.lock_outline,
                          Colors.grey,
                          AppColors.cardSecondary(context),
                        ),
                        const SizedBox(width: 6),
                        _buildMiniBadge(
                          Icons.lock_outline,
                          Colors.grey,
                          AppColors.cardSecondary(context),
                        ),
                      ]
                      : _conquistas.take(4).map((c) {
                        IconData iconData = Icons.emoji_events;
                        if (c['icone'] == 'menu_book')
                          iconData = Icons.menu_book;
                        if (c['icone'] == 'calculate')
                          iconData = Icons.calculate;
                        if (c['icone'] == 'edit_note')
                          iconData = Icons.edit_note;
                        if (c['icone'] == 'wb_sunny_outlined')
                          iconData = Icons.wb_sunny_outlined;

                        bool desbloqueada = c['desbloqueada'] ?? false;
                        Color iconColor =
                            desbloqueada
                                ? Color(
                                  int.parse(
                                    (c['cor_icone'] as String).replaceAll(
                                      '#',
                                      '0x',
                                    ),
                                  ),
                                )
                                : Colors.grey;
                        Color bgColor =
                            desbloqueada
                                ? Color(
                                  int.parse(
                                    (c['cor_fundo'] as String).replaceAll(
                                      '#',
                                      '0x',
                                    ),
                                  ),
                                )
                                : AppColors.cardSecondary(context);

                        return Padding(
                          padding: const EdgeInsets.only(right: 6.0),
                          child: _buildMiniBadge(
                            desbloqueada ? iconData : Icons.lock_outline,
                            iconColor,
                            bgColor,
                          ),
                        );
                      }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  // Card Disciplinas (mostra quantas foram adicionadas no MySQL)
  Widget _buildDisciplinasGridCard() {
    final formatado = _totalDisciplinas.toString().padLeft(2, '0');
    return GestureDetector(
      onTap: () => _mostrarDialogDisciplinas(context),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBackground(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.bar_chart_outlined,
                  color: Colors.teal,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'DISCIPLINAS',
                  style: AppTextStyles.legenda(
                    context,
                    color: AppColors.textSecondary(context),
                  ).copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  formatado,
                  style: AppTextStyles.titulo(context, size: 24.0),
                ),
                const SizedBox(width: 4),
                Text(
                  'ativas',
                  style: AppTextStyles.legenda(
                    context,
                    color: AppColors.textSecondary(context),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Helper: Mini Badge com ícone para a Grid
  Widget _buildMiniBadge(IconData icon, Color color, Color bgColor) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Center(child: Icon(icon, color: color, size: 14)),
    );
  }

  // Helper: Card de Grid em Branco (Dashed/Placeholder)
  Widget _buildGridPlaceholderCard({
    required IconData icon,
    required Color iconColor,
    required String title,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      height: 87, // Mesma altura aproximada
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? Colors.white12 : Colors.black12,
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor.withOpacity(0.5), size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: AppTextStyles.legenda(
                  context,
                  color: AppColors.textHint(context),
                ).copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Spacer(),
          Center(
            child: Container(
              width: 40,
              height: 10,
              decoration: BoxDecoration(
                color: AppColors.cardSecondary(context),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Helper: Barra de progresso individual
  Widget _buildProgressBarItem({
    required String label,
    required double valor,
    required Color color,
  }) {
    final percentValue = (valor * 100).toInt();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: AppTextStyles.legenda(
                context,
                color: AppColors.textPrimary(context),
              ).copyWith(fontWeight: FontWeight.bold),
            ),
            Text(
              '$percentValue%',
              style: AppTextStyles.legenda(
                context,
                color: color,
              ).copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 6),
        LinearProgressIndicator(
          value: valor,
          backgroundColor: AppColors.cardSecondary(context),
          valueColor: AlwaysStoppedAnimation<Color>(color),
          minHeight: 8,
          borderRadius: BorderRadius.circular(4),
        ),
      ],
    );
  }

  // Helper: Linhas de configurações
  Widget _buildSettingsRow({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    final Color iconColor =
        isDestructive ? AppColors.incorreto : AppColors.destaque;
    final Color titleColor =
        isDestructive ? AppColors.incorreto : AppColors.textPrimary(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: iconColor, size: 22),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.subtitulo(
                      context,
                      size: 15.0,
                      color: titleColor,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: AppTextStyles.legenda(
                      context,
                      color: AppColors.textSecondary(context),
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color:
                  isDestructive
                      ? AppColors.incorreto.withOpacity(0.5)
                      : AppColors.textHint(context),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
