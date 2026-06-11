import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background(context),
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
                      onTap: () {
                        context.go('/menu');
                      },
                      child: Icon(
                        Icons.arrow_back_ios,
                        color: AppColors.textPrimary(context),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        widget.materiaNome,
                        style: AppTextStyles.subtitulo(context, size: 18.0),
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
                        style: AppTextStyles.titulo(context, size: 24.0, color: Colors.white),
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
                                  style: AppTextStyles.legenda(
                                    context,
                                    color: Colors.white70,
                                  ),
                                ),
                                Text(
                                  'material',
                                  style: AppTextStyles.subtitulo(
                                    context,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                GestureDetector(
                                  onTap: () {
                                    // Navegar para Agenda da disciplina
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
                                      style: AppTextStyles.legenda(
                                        context,
                                        color: Colors.white,
                                      ).copyWith(fontWeight: FontWeight.w500),
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
                      style: AppTextStyles.subtitulo(
                        context,
                        size: 14.0,
                        color: AppColors.textHint(context),
                        fontWeight: FontWeight.bold,
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
                            onTap: () => context.go('/flashcard-menu/${widget.materiaNome}'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildActionButton(
                            icon: Icons.task_alt_outlined,
                            label: 'Tarefas',
                            count: materiaAtual.tarefasPendentes,
                            onTap: () {},
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildActionButton(
                            icon: Icons.assignment_outlined,
                            label: 'Exercícios',
                            onTap: () {
                              context.go('/exercicios?materia=${materiaAtual.nome}');
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildActionButton(
                            icon: Icons.auto_awesome_outlined,
                            label: 'IA',
                            onTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Chat IA contextualizado - Em breve!'),
                                  duration: Duration(seconds: 2),
                                ),
                              );
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
                      style: AppTextStyles.subtitulo(
                        context,
                        size: 14.0,
                        color: AppColors.textHint(context),
                        fontWeight: FontWeight.bold,
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
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.cardBackground(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: materiaAtual.cor, size: 24),
            const SizedBox(height: 6),
            Text(
              label,
              style: AppTextStyles.legenda(context, color: AppColors.textPrimary(context), size: 11.0).copyWith(
                fontWeight: FontWeight.bold,
              ),
              semanticsLabel: label,
              textAlign: TextAlign.center,
            ),
            if (count != null && count > 0) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: materiaAtual.cor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '$count',
                  style: AppTextStyles.legenda(context, color: materiaAtual.cor, size: 10.0).copyWith(
                    fontWeight: FontWeight.bold,
                  ),
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
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Barra lateral de cor da matéria
            Container(
              width: 6,
              decoration: BoxDecoration(
                color: materiaAtual.cor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomLeft: Radius.circular(12),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        unidade.nome,
                        style: AppTextStyles.subtitulo(context, size: 15.0),
                        semanticsLabel: 'Unidade: ${unidade.nome}',
                      ),
                    ),
                    Text(
                      '${unidade.concluidas}/${unidade.total}',
                      style: AppTextStyles.subtitulo(
                        context,
                        size: 15.0,
                        color: materiaAtual.cor,
                      ),
                      semanticsLabel:
                          '${unidade.concluidas} de ${unidade.total} concluídos',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
