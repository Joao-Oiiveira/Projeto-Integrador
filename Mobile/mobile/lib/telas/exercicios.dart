import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

class ExerciciosConfigScreen extends StatefulWidget {
  final String? materiaInicial;

  const ExerciciosConfigScreen({super.key, this.materiaInicial});

  @override
  State<ExerciciosConfigScreen> createState() => _ExerciciosConfigScreenState();
}

class _ExerciciosConfigScreenState extends State<ExerciciosConfigScreen> {
  late String _materiaSelecionada;
  final TextEditingController _temaController = TextEditingController();
  
  String _dificuldade = 'Médio'; // 'Fácil', 'Médio', 'Difícil'
  int _quantidadeQuestoes = 5; // 5, 10, 15
  String _modo = 'Vestibular'; // 'Vestibular', 'IA'

  final List<String> _materias = ['Matemática', 'Português'];
  final List<String> _dificuldades = ['Fácil', 'Médio', 'Difícil'];
  final List<int> _quantidades = [5, 10, 15];
  final List<String> _modos = ['Vestibular', 'IA'];

  @override
  void initState() {
    super.initState();
    // Se foi passado uma matéria inicial válida pelas rotas, pré-seleciona ela
    if (widget.materiaInicial != null && _materias.contains(widget.materiaInicial)) {
      _materiaSelecionada = widget.materiaInicial!;
    } else {
      _materiaSelecionada = 'Matemática';
    }
  }

  @override
  void dispose() {
    _temaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Color materiaCor = AppColors.materiaCor(_materiaSelecionada);

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
          'Configurar Prática',
          style: AppTextStyles.subtitulo(context, size: 20.0),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Seleção de Matéria ──────────────────
              _buildLabel('Disciplina'),
              const SizedBox(height: 8),
              Row(
                children: _materias.map((m) {
                  final bool sel = _materiaSelecionada == m;
                  final Color cMateria = AppColors.materiaCor(m);
                  return Padding(
                    padding: const EdgeInsets.only(right: 12),
                    child: ChoiceChip(
                      label: Text(m),
                      selected: sel,
                      onSelected: (selected) {
                        if (selected) {
                          setState(() => _materiaSelecionada = m);
                        }
                      },
                      selectedColor: cMateria.withOpacity(0.2),
                      backgroundColor: AppColors.cardBackground(context),
                      labelStyle: AppTextStyles.corpo(
                        context,
                        fontWeight: sel ? FontWeight.bold : FontWeight.normal,
                        color: sel ? cMateria : AppColors.textSecondary(context),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(
                          color: sel ? cMateria : AppColors.border(context),
                          width: sel ? 1.5 : 1,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // ── Tema Livre ──────────────────────────
              _buildLabel('Tema do Exercício'),
              const SizedBox(height: 8),
              TextField(
                controller: _temaController,
                style: AppTextStyles.corpo(context),
                cursorColor: materiaCor,
                decoration: InputDecoration(
                  hintText: 'Ex: Equações de 2º Grau, Sintaxe, Trigonometria...',
                  hintStyle: AppTextStyles.legenda(context, color: AppColors.textHint(context)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border(context)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: materiaCor),
                  ),
                  filled: true,
                  fillColor: AppColors.cardBackground(context),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
              ),
              const SizedBox(height: 24),

              // ── Dificuldade ─────────────────────────
              _buildLabel('Dificuldade'),
              const SizedBox(height: 8),
              Row(
                children: _dificuldades.map((d) {
                  final bool sel = _dificuldade == d;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ChoiceChip(
                        label: Center(child: Text(d)),
                        selected: sel,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _dificuldade = d);
                          }
                        },
                        selectedColor: materiaCor.withOpacity(0.2),
                        backgroundColor: AppColors.cardBackground(context),
                        labelStyle: AppTextStyles.corpo(
                          context,
                          fontWeight: sel ? FontWeight.bold : FontWeight.normal,
                          color: sel ? materiaCor : AppColors.textSecondary(context),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                          side: BorderSide(
                            color: sel ? materiaCor : AppColors.border(context),
                            width: sel ? 1.5 : 1,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // ── Quantidade ──────────────────────────
              _buildLabel('Quantidade de Questões'),
              const SizedBox(height: 8),
              Row(
                children: _quantidades.map((q) {
                  final bool sel = _quantidadeQuestoes == q;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ChoiceChip(
                        label: Center(child: Text('$q questões')),
                        selected: sel,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _quantidadeQuestoes = q);
                          }
                        },
                        selectedColor: materiaCor.withOpacity(0.2),
                        backgroundColor: AppColors.cardBackground(context),
                        labelStyle: AppTextStyles.corpo(
                          context,
                          fontWeight: sel ? FontWeight.bold : FontWeight.normal,
                          color: sel ? materiaCor : AppColors.textSecondary(context),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                          side: BorderSide(
                            color: sel ? materiaCor : AppColors.border(context),
                            width: sel ? 1.5 : 1,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // ── Modo de Questão ─────────────────────
              _buildLabel('Modo de Resolução'),
              const SizedBox(height: 8),
              Row(
                children: _modos.map((m) {
                  final bool sel = _modo == m;
                  final IconData icon = m == 'Vestibular' ? Icons.school_outlined : Icons.auto_awesome_outlined;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _modo = m),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: sel ? materiaCor.withOpacity(0.15) : AppColors.cardBackground(context),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: sel ? materiaCor : AppColors.border(context),
                            width: sel ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(icon, color: sel ? materiaCor : AppColors.textHint(context), size: 24),
                            const SizedBox(height: 6),
                            Text(
                              m == 'Vestibular' ? 'Modo Vestibular' : 'Modo IA',
                              style: AppTextStyles.corpo(
                                context,
                                fontWeight: sel ? FontWeight.bold : FontWeight.normal,
                                color: sel ? materiaCor : AppColors.textSecondary(context),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              m == 'Vestibular' ? 'Questões oficiais ENEM' : 'Gerado dinamicamente',
                              style: AppTextStyles.legenda(context, color: AppColors.textHint(context)),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 40),

              // ── Iniciar Sessão ──────────────────────
              ElevatedButton(
                onPressed: () {
                  final tema = _temaController.text.trim().isEmpty ? 'Geral' : _temaController.text.trim();
                  
                  // Transaciona para a tela de resolução passando os parâmetros via query/path parameters
                  context.go(
                    '/exercicios/sessao'
                    '?materia=$_materiaSelecionada'
                    '&tema=$tema'
                    '&dificuldade=$_dificuldade'
                    '&quantidade=$_quantidadeQuestoes'
                    '&modo=$_modo'
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: materiaCor,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  'Iniciar Prática',
                  style: AppTextStyles.botao(context, color: Colors.white),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: AppTextStyles.subtitulo(
        context,
        size: 14.0,
        color: AppColors.textPrimary(context),
      ).copyWith(fontWeight: FontWeight.bold),
    );
  }
}
