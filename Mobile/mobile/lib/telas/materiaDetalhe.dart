import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/servicos/accessibility_provider.dart';

class MateriaDetalhe {
  final String nome;
  final Color cor;
  final int progresso;
  final int totalItens;
  final List<UnidadeMateria> unidades;
  final int flashcardsDisponiveis;
  final int tarefasPendentes;

  const MateriaDetalhe({
    required this.nome,
    required this.cor,
    required this.progresso,
    required this.totalItens,
    required this.unidades,
    this.flashcardsDisponiveis = 0,
    this.tarefasPendentes = 0,
  });
}

class UnidadeMateria {
  final String nome;
  final int concluidas;
  final int total;
  final String id;

  const UnidadeMateria({
    required this.nome,
    required this.concluidas,
    required this.total,
    this.id = '',
  });
}

class MateriaDetalheScreen extends StatefulWidget {
  final String materiaNome;

  const MateriaDetalheScreen({super.key, required this.materiaNome});

  @override
  State<MateriaDetalheScreen> createState() => _MateriaDetalheScreenState();
}

class _MateriaDetalheScreenState extends State<MateriaDetalheScreen> {
  // 🔧 BACK-END: Dados virão da API
  late MateriaDetalhe materiaAtual;

  // Dados locais das matérias
  final Map<String, MateriaDetalhe> materiasData = {
    'Matemática': const MateriaDetalhe(
      nome: 'Matemática',
      cor: AppColors.matematica,
      progresso: 10,
      totalItens: 100,
      flashcardsDisponiveis: 24,
      tarefasPendentes: 3,
      unidades: [
        UnidadeMateria(nome: 'Materia 1', concluidas: 2, total: 10, id: 'mat1'),
        UnidadeMateria(nome: 'Materia 2', concluidas: 2, total: 10, id: 'mat2'),
        UnidadeMateria(nome: 'Materia 3', concluidas: 0, total: 10, id: 'mat3'),
        UnidadeMateria(nome: 'Materia 4', concluidas: 0, total: 10, id: 'mat4'),
        UnidadeMateria(nome: 'Materia 5', concluidas: 0, total: 10, id: 'mat5'),
      ],
    ),
    'Português': const MateriaDetalhe(
      nome: 'Português',
      cor: AppColors.portugues,
      progresso: 25,
      totalItens: 100,
      flashcardsDisponiveis: 18,
      tarefasPendentes: 2,
      unidades: [
        UnidadeMateria(
          nome: 'Materia 1',
          concluidas: 3,
          total: 10,
          id: 'port1',
        ),
        UnidadeMateria(
          nome: 'Materia 2',
          concluidas: 2,
          total: 10,
          id: 'port2',
        ),
        UnidadeMateria(
          nome: 'Materia 3',
          concluidas: 0,
          total: 10,
          id: 'port3',
        ),
        UnidadeMateria(
          nome: 'Materia 4',
          concluidas: 0,
          total: 10,
          id: 'port4',
        ),
        UnidadeMateria(
          nome: 'Materia 5',
          concluidas: 0,
          total: 10,
          id: 'port5',
        ),
      ],
    ),
  };

  @override
  void initState() {
    super.initState();
    materiaAtual =
        materiasData[widget.materiaNome] ?? materiasData['Matemática']!;
  }

  // Helpers de acessibilidade
  double _getFontSize(double baseSize) {
    return baseSize * accessibilityProvider.fontSizeMultiplier;
  }

  Color _getColorWithContrast(Color color) {
    if (!accessibilityProvider.highContrast) return color;
    return color.withValues(alpha: 1.0);
  }

  TextStyle _getTextStyle(
    double fontSize, {
    FontWeight fontWeight = FontWeight.normal,
    Color color = Colors.white,
  }) {
    return TextStyle(
      fontSize: _getFontSize(fontSize),
      fontWeight: fontWeight,
      color: _getColorWithContrast(color),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // ── Header com botão de voltar ──────────
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: const Icon(
                        Icons.arrow_back_ios,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        'Materiais',
                        style: _getTextStyle(18, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),

              // ── Card principal da matéria ──────────
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: materiaAtual.cor.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        materiaAtual.nome,
                        style: _getTextStyle(24, fontWeight: FontWeight.bold),
                        semanticsLabel: 'Disciplina: ${materiaAtual.nome}',
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Seu progresso no',
                                  style: _getTextStyle(
                                    12,
                                    color: Colors.white70,
                                  ),
                                ),
                                Text(
                                  'matérial',
                                  style: _getTextStyle(
                                    14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                GestureDetector(
                                  onTap: () {
                                    // 🔧 BACK-END: Navegar para Agenda da disciplina
                                    // context.go('/agenda?disciplina=${materiaAtual.nome}');
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(
                                        alpha: 0.2,
                                      ),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      'Ver progresso',
                                      style: _getTextStyle(
                                        12,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(
                              width: 80,
                              height: 80,
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  CircularProgressIndicator(
                                    value: materiaAtual.progresso / 100,
                                    strokeWidth: 6,
                                    backgroundColor: Colors.white.withValues(
                                      alpha: 0.3,
                                    ),
                                    valueColor:
                                        const AlwaysStoppedAnimation<Color>(
                                          Colors.white,
                                        ),
                                  ),
                                  Text(
                                    '${materiaAtual.progresso}%',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Seção de Ações Rápidas ──────────────
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 20,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AÇÕES RÁPIDAS',
                      style: _getTextStyle(
                        14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white54,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildActionButton(
                            icon: Icons.assessment_outlined,
                            label: 'Flashcards',
                            count: materiaAtual.flashcardsDisponiveis,
                            onTap: () {
                              // 🔧 BACK-END: Navegar para Flashcards da disciplina
                              // context.go('/flashcards/${materiaAtual.nome}');
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildActionButton(
                            icon: Icons.task_alt_outlined,
                            label: 'Tarefas',
                            count: materiaAtual.tarefasPendentes,
                            onTap: () {
                              // 🔧 BACK-END: Navegar para Agenda da disciplina
                              // context.go('/agenda?disciplina=${materiaAtual.nome}');
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildActionButton(
                            icon: Icons.auto_awesome_outlined,
                            label: 'IA',
                            onTap: () {
                              // 🔧 BACK-END: Abrir chat IA contextualizado
                              // context.go('/ia?disciplina=${materiaAtual.nome}');
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // ── Seção de Unidades ────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 0,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'UNIDADES',
                      style: _getTextStyle(
                        14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white54,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...List.generate(
                      materiaAtual.unidades.length,
                      (index) =>
                          _buildUnidadeCard(materiaAtual.unidades[index]),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    int? count,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: materiaAtual.cor.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: materiaAtual.cor.withValues(alpha: 0.8)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 24),
            const SizedBox(height: 6),
            Text(
              label,
              style: _getTextStyle(12, fontWeight: FontWeight.w600),
              semanticsLabel: label,
            ),
            if (count != null && count > 0) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '$count',
                  style: _getTextStyle(11, fontWeight: FontWeight.w700),
                  semanticsLabel: '$count ${label.toLowerCase()}',
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildUnidadeCard(UnidadeMateria unidade) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: materiaAtual.cor.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            unidade.nome,
            style: _getTextStyle(16, fontWeight: FontWeight.w600),
            semanticsLabel: 'Unidade: ${unidade.nome}',
          ),
          Text(
            '${unidade.concluidas}/${unidade.total}',
            style: _getTextStyle(16, fontWeight: FontWeight.w600),
            semanticsLabel:
                '${unidade.concluidas} de ${unidade.total} concluídos',
          ),
        ],
      ),
    );
  }
}
