import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/servicos/accessibility_provider.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';
import 'package:mobile/servicos/api_service.dart';

// Modelo de questão para a sessão local
class Questao {
  final int? id;
  final String enunciado;
  final List<String> alternativas;
  final int alternativaCorreta; // 0 a 4 (A a E)
  final String explicacaoIA;
  final bool? acertou;

  const Questao({
    this.id,
    required this.enunciado,
    required this.alternativas,
    required this.alternativaCorreta,
    required this.explicacaoIA,
    this.acertou,
  });
}

class ExerciciosSessaoScreen extends StatefulWidget {
  final String materia;
  final String tema;
  final String dificuldade;
  final int quantidade;
  final String modo;
  final String? moduloId;

  const ExerciciosSessaoScreen({
    super.key,
    required this.materia,
    required this.tema,
    required this.dificuldade,
    required this.quantidade,
    required this.modo,
    this.moduloId,
  });

  @override
  State<ExerciciosSessaoScreen> createState() => _ExerciciosSessaoScreenState();
}

class _ExerciciosSessaoScreenState extends State<ExerciciosSessaoScreen> {
  late List<Questao> _questoes;
  int _indiceAtual = 0;
  int? _opcaoSelecionada;
  bool _respondida = false;
  int _acertos = 0;
  bool _concluida = false;

  // Mock de Questões baseados na matéria selecionada
  final List<Questao> _questoesMatematica = const [
    Questao(
      enunciado: 'Seja a equação do segundo grau x² - 5x + 6 = 0. Quais são as raízes desta equação?',
      alternativas: [
        'x = 1 e x = 6',
        'x = 2 e x = 3',
        'x = -2 e x = -3',
        'x = 0 e x = 5',
        'x = 1.5 e x = 4',
      ],
      alternativaCorreta: 1, // B
      explicacaoIA: 'Para resolver a equação x² - 5x + 6 = 0, usamos a fórmula de Bhaskara ou a soma e produto.\nSoma (S) = -b/a = 5\nProduto (P) = c/a = 6.\nProcuramos dois números que somados dão 5 e multiplicados dão 6. Esses números são 2 e 3.',
    ),
    Questao(
      enunciado: 'Um reservatório possui 1000 litros de água. Devido a um vazamento constante, perde 15 litros por hora. Qual das funções descreve a quantidade Q(t) de água em litros após t horas?',
      alternativas: [
        'Q(t) = 1000 + 15t',
        'Q(t) = 15 - 1000t',
        'Q(t) = 1000 - 15t',
        'Q(t) = 1000t - 15',
        'Q(t) = 1000 - 1.5t',
      ],
      alternativaCorreta: 2, // C
      explicacaoIA: 'A quantidade inicial é de 1000 litros. Como perde 15 litros a cada hora t, subtraímos 15 vezes t da quantidade inicial. Portanto, a função correta é Q(t) = 1000 - 15t.',
    ),
    Questao(
      enunciado: 'Qual é o valor de x na equação linear 3x - 7 = 11?',
      alternativas: [
        'x = 4',
        'x = 6',
        'x = 5',
        'x = 18',
        'x = 3',
      ],
      alternativaCorreta: 1, // B
      explicacaoIA: 'Isolamos a variável x:\n3x - 7 = 11\n3x = 11 + 7\n3x = 18\nx = 18 / 3\nx = 6.',
    ),
  ];

  final List<Questao> _questoesPortugues = const [
    Questao(
      enunciado: 'Na frase: "O aluno comprou um livro de português na livraria ontem." Qual termo exerce a função sintática de Objeto Direto?',
      alternativas: [
        'O aluno',
        'comprou',
        'um livro de português',
        'na livraria',
        'ontem',
      ],
      alternativaCorreta: 2, // C
      explicacaoIA: 'O verbo "comprar" é transitivo direto (quem compra, compra algo). O termo "um livro de português" completa o sentido do verbo comprou diretamente, sem exigência de preposição obrigatória do verbo, exercendo a função de Objeto Direto.',
    ),
    Questao(
      enunciado: 'Assinale a alternativa em que a palavra está grafada INCORRETAMENTE segundo as regras de ortografia vigente:',
      alternativas: [
        'Analisar',
        'Pesquisar',
        'Paralisar',
        'Catarina',
        'Exitar (com sentido de ter dúvida/vacilar)',
      ],
      alternativaCorreta: 4, // E
      explicacaoIA: 'A palavra correta que expressa dúvida ou vacilação é "Hesitar" (com H e S). A palavra "Exitar" com X refere-se a obter êxito (sucesso), por isso está grafada incorretamente para o sentido indicado.',
    ),
    Questao(
      enunciado: 'Identifique a alternativa onde ocorre uma metáfora:',
      alternativas: [
        'O vento rugia alto na floresta.',
        'Minha filha é um doce de menina.',
        'Li Machado de Assis ontem à noite.',
        'Seu olhar brilha como o sol.',
        'Fiquei com tanta fome que comeria um boi inteiro.',
      ],
      alternativaCorreta: 1, // B
      explicacaoIA: 'A metáfora consiste em uma afirmação figurada baseada em uma comparação implícita. Ao dizer "Minha filha é um doce", atribuímos a ela as qualidades de doçura diretamente. A opção D é uma comparação (usa "como") e a opção E é uma hipérbole (exagero).',
    ),
  ];

  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _questoes = [];
    _inicializarQuestoes();
  }

  Future<void> _inicializarQuestoes() async {
    try {
      final modoStr = widget.modo.toLowerCase();
      if (modoStr == 'ia') {
        final data = await ApiService().gerarQuestoesIA(
          tema: widget.tema,
          quantidade: widget.quantidade,
          nivel: widget.dificuldade,
        );
        _mapearQuestoesJson(data);
      } else if (modoStr == 'trilha' && widget.moduloId != null) {
        final data = await ApiService().obterQuestoesModulo(int.parse(widget.moduloId!));
        _mapearQuestoesJson(data);
      } else {
        // Fallback local caso precise
        final listaBase = widget.materia.toLowerCase().contains('port')
            ? _questoesPortugues
            : _questoesMatematica;
            
        for (int i = 0; i < widget.quantidade; i++) {
          _questoes.add(listaBase[i % listaBase.length]);
        }
      }
    } catch (e) {
      // Se falhar a IA ou Trilha, carrega o fallback de emergência pra não quebrar a tela
      final listaBase = widget.materia.toLowerCase().contains('port')
          ? _questoesPortugues
          : _questoesMatematica;
      for (int i = 0; i < widget.quantidade; i++) {
        _questoes.add(listaBase[i % listaBase.length]);
      }
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _mapearQuestoesJson(List<dynamic> data) {
    for (var q in data) {
      _questoes.add(Questao(
        id: q['id'],
        enunciado: q['enunciado'] ?? '',
        alternativas: List<String>.from(q['alternativas'] ?? []),
        alternativaCorreta: q['alternativa_correta'] ?? 0,
        explicacaoIA: q['explicacao_ia'] ?? 'Sem explicação.',
        acertou: q['acertou'],
      ));
    }
    
    // Pula questoes ja acertadas se for trilha
    if (widget.modo.toLowerCase() == 'trilha') {
      int nextIndex = 0;
      for (int i = 0; i < _questoes.length; i++) {
        if (_questoes[i].acertou != true) {
          nextIndex = i;
          break;
        }
        if (i == _questoes.length - 1) {
          nextIndex = i; // Todas concluidas
        }
      }
      _indiceAtual = nextIndex;
      
      // Conta acertos pre-existentes
      _acertos = _questoes.where((q) => q.acertou == true).length;
    }
  }

  void _confirmarResposta() async {
    if (_opcaoSelecionada == null) return;
    
    bool isCorrect = _opcaoSelecionada == _questoes[_indiceAtual].alternativaCorreta;
    
    setState(() {
      _respondida = true;
      if (isCorrect) {
        _acertos++;
      }
    });

    if (widget.modo.toLowerCase() == 'trilha' && _questoes[_indiceAtual].id != null) {
      try {
        await ApiService().responderTrilhaQuestao(_questoes[_indiceAtual].id!, isCorrect);
      } catch (e) {
        print('Erro ao salvar no banco: $e');
      }
    }
  }

  void _proximaQuestao() async {
    // Para trilha, pular pra próxima que NÃO está acertada, ou finalizar.
    int proximoIndice = _indiceAtual + 1;
    if (widget.modo.toLowerCase() == 'trilha') {
      while (proximoIndice < _questoes.length && _questoes[proximoIndice].acertou == true) {
        proximoIndice++;
      }
    }

    if (proximoIndice < _questoes.length) {
      setState(() {
        _indiceAtual = proximoIndice;
        _opcaoSelecionada = null;
        _respondida = false;
      });
    } else {
      // Finaliza a sessão e salva no backend
      setState(() {
        _concluida = true;
      });

      try {
        final erros = _questoes.length - _acertos;
        final xpGanho = _acertos * 10; // Exemplo: 10 XP por acerto

        List<Map<String, dynamic>> historicoRespostas = [];
        for (var q in _questoes) {
          historicoRespostas.add({
            'pergunta': q.enunciado,
            'acertou': true, // Mock, poderia guardar estado por questao
            'origem': 'simulado_local'
          });
        }

        await ApiService().salvarSessaoExercicio(
          tema: widget.tema,
          modo: widget.modo.isNotEmpty ? widget.modo : 'local',
          quantidadeQuestoes: _questoes.length,
          respostas: historicoRespostas,
          dificuldade: widget.dificuldade,
        );
      } catch (e) {
        // Log ou ignore erro (o usuário ainda verá a tela de resultados)
      }
    }
  }

  void _salvarComoFlashcard() {
    final q = _questoes[_indiceAtual];
    final letraCorreta = String.fromCharCode(65 + q.alternativaCorreta); // A, B, C, D, E
    
    // Simula salvamento de flashcard
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check, color: Colors.white),
            const SizedBox(width: 8),
            Text('Salvo nos Flashcards! (Alternativa correta: $letraCorreta)'),
          ],
        ),
        backgroundColor: AppColors.correto,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _lerEnunciado() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Leitor de voz: "Lendo enunciado da questão..."'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final Color materiaCor = AppColors.materiaCor(widget.materia);

    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background(context),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: AppColors.destaque),
              const SizedBox(height: 20),
              Text(
                widget.modo == 'ia' ? "A IA está gerando questões para você..." : "Carregando questões...",
                style: AppTextStyles.subtitulo(context),
              )
            ],
          ),
        ),
      );
    }

    if (_concluida) {
      return _buildTelaResultados(materiaCor);
    }

    final questaoAtual = _questoes[_indiceAtual];
    final double progresso = (_indiceAtual + 1) / _questoes.length;

    return Scaffold(
      backgroundColor: AppColors.background(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.close, color: AppColors.textPrimary(context)),
          onPressed: () {
            // Confirmar saída
            showDialog(
              context: context,
              builder: (context) => AlertDialog(
                backgroundColor: AppColors.cardBackground(context),
                title: Text('Sair do Exercício?', style: AppTextStyles.subtitulo(context, size: 18.0)),
                content: Text(
                  'Seu progresso nesta sessão será perdido.',
                  style: AppTextStyles.corpo(context),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('Continuar', style: TextStyle(color: materiaCor)),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context);
                      context.go('/menu');
                    },
                    child: Text('Sair', style: TextStyle(color: AppColors.textHint(context))),
                  ),
                ],
              ),
            );
          },
        ),
        title: Text(
          widget.tema,
          style: AppTextStyles.subtitulo(context, size: 18.0),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ── Barra de Progresso Superior ──────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Questão ${_indiceAtual + 1} de ${_questoes.length}',
                        style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                      ),
                      Text(
                        'Acertos: $_acertos',
                        style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: progresso,
                    backgroundColor: AppColors.borderMedium(context),
                    valueColor: AlwaysStoppedAnimation<Color>(materiaCor),
                    minHeight: 6,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ],
              ),
            ),

            // ── Enunciado e Alternativas ─────────────
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Card do Enunciado
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
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: materiaCor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  widget.dificuldade.toUpperCase(),
                                  style: AppTextStyles.legenda(context, color: materiaCor).copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              // Botão Text-to-Speech
                              if (accessibilityProvider.textToSpeechEnabled)
                                IconButton(
                                  icon: Icon(Icons.volume_up, color: materiaCor),
                                  onPressed: _lerEnunciado,
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            questaoAtual.enunciado,
                            style: AppTextStyles.subtitulo(context, size: 16.0, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Alternativas
                    ...List.generate(questaoAtual.alternativas.length, (index) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildAlternativaCard(index, questaoAtual),
                      );
                    }),
                    
                    // Painel de Correção / Ações Sintetizadas
                    if (_respondida) ...[
                      const SizedBox(height: 16),
                      _buildPainelCorrecao(questaoAtual),
                    ],
                  ],
                ),
              ),
            ),

            // ── Botão de Confirmação no Rodapé ───────
            Padding(
              padding: const EdgeInsets.all(24),
              child: ElevatedButton(
                onPressed: _opcaoSelecionada == null
                    ? null
                    : (_respondida ? _proximaQuestao : _confirmarResposta),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _respondida ? AppColors.textPrimary(context) : materiaCor,
                  foregroundColor: AppColors.background(context),
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  _respondida
                      ? (_indiceAtual == _questoes.length - 1 ? 'Finalizar Prática' : 'Próxima Questão')
                      : 'Confirmar Resposta',
                  style: AppTextStyles.botao(context, color: AppColors.background(context)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Builder das alternativas (A a E)
  Widget _buildAlternativaCard(int index, Questao questao) {
    final charLetra = String.fromCharCode(65 + index); // A, B, C, D, E
    final bool selecionada = _opcaoSelecionada == index;
    final Color materiaCor = AppColors.materiaCor(widget.materia);

    // Determina a cor de borda e fundo baseado no estado (respondido / correto / incorreto)
    Color cardColor = AppColors.cardBackground(context);
    Color borderColor = AppColors.border(context);
    double borderWidth = 1.0;

    if (_respondida) {
      if (index == questao.alternativaCorreta) {
        cardColor = AppColors.correto.withOpacity(0.12);
        borderColor = AppColors.correto;
        borderWidth = 2.0;
      } else if (selecionada && _opcaoSelecionada != questao.alternativaCorreta) {
        cardColor = AppColors.incorreto.withOpacity(0.12);
        borderColor = AppColors.incorreto;
        borderWidth = 2.0;
      }
    } else if (selecionada) {
      cardColor = materiaCor.withOpacity(0.12);
      borderColor = materiaCor;
      borderWidth = 2.0;
    }

    return GestureDetector(
      onTap: _respondida
          ? null
          : () => setState(() => _opcaoSelecionada = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderColor, width: borderWidth),
        ),
        child: Row(
          children: [
            // Círculo com a letra
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _respondida && index == questao.alternativaCorreta
                    ? AppColors.correto
                    : (_respondida && selecionada ? AppColors.incorreto : (selecionada ? materiaCor : AppColors.cardSecondary(context))),
              ),
              child: Center(
                child: Text(
                  charLetra,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: selecionada || (_respondida && index == questao.alternativaCorreta)
                        ? Colors.white
                        : AppColors.textPrimary(context),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                questao.alternativas[index],
                style: AppTextStyles.corpo(
                  context,
                  color: _respondida && index == questao.alternativaCorreta
                      ? AppColors.correto
                      : (_respondida && selecionada ? AppColors.incorreto : AppColors.textPrimary(context)),
                  fontWeight: selecionada ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Painel de correção rápida (IA e Flashcards)
  Widget _buildPainelCorrecao(Questao questao) {
    final bool acertou = _opcaoSelecionada == questao.alternativaCorreta;
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
              Icon(
                acertou ? Icons.check_circle : Icons.cancel,
                color: acertou ? AppColors.correto : AppColors.incorreto,
              ),
              const SizedBox(width: 10),
              Text(
                acertou ? 'Você acertou!' : 'Resposta incorreta',
                style: AppTextStyles.subtitulo(
                  context,
                  size: 16.0,
                  color: acertou ? AppColors.correto : AppColors.incorreto,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _mostrarExplicacaoIA(questao),
                  icon: const Icon(Icons.auto_awesome, size: 16),
                  label: const Text('Explicação da IA'),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppColors.border(context)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _salvarComoFlashcard,
                  icon: const Icon(Icons.assessment_outlined, size: 16),
                  label: const Text('Salvar Flashcard'),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppColors.border(context)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Abre modal com explicação da IA adaptada ao Perfil Educacional do Usuário
  void _mostrarExplicacaoIA(Questao questao) {
    String explicacaoExibida = questao.explicacaoIA;

    // Adaptação de IA baseada em Acessibilidade e Perfil Educacional!
    if (accessibilityProvider.tdah) {
      explicacaoExibida = '📌 **RESUMO DIRETO (Modo TDAH):**\n\n'
          '• A pergunta pede as raízes da função.\n'
          '• Soma das raízes deve ser 5.\n'
          '• Produto das raízes deve ser 6.\n'
          '• Números correspondentes: **2 e 3** (Alternativa B).\n\n'
          'Sempre lembre da regra prática: x² - Sx + P = 0.';
    } else if (accessibilityProvider.preferenciaConteudo == 'visual') {
      explicacaoExibida = '📊 **EXPLICAÇÃO VISUAL:**\n\n'
          '| Operação | Equação | Resultado |\n'
          '| :--- | :--- | :--- |\n'
          '| Equação | x² - 5x + 6 = 0 | Raízes |\n'
          '| Soma (S) | -b/a = 5 | x1 + x2 = 5 |\n'
          '| Produto (P) | c/a = 6 | x1 * x2 = 6 |\n\n'
          '👉 Raízes corretas: **2 e 3** (Soma 5 e Produto 6).';
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
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
                const Icon(Icons.auto_awesome, color: Color(0xFFBA68C8)),
                const SizedBox(width: 10),
                Text(
                  'Explicação Personalizada',
                  style: AppTextStyles.subtitulo(context, size: 18.0),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              explicacaoExibida,
              style: AppTextStyles.corpo(context),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.textPrimary(context),
                  foregroundColor: AppColors.background(context),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: Text('Fechar', style: AppTextStyles.botao(context, color: AppColors.background(context))),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ════════════════════════════════════════════
  // TELA DE RESULTADOS FINAIS
  // ════════════════════════════════════════════
  Widget _buildTelaResultados(Color themeColor) {
    final int porcentagem = (_questoes.isEmpty ? 0 : (_acertos / _questoes.length) * 100).round();

    return Scaffold(
      backgroundColor: AppColors.background(context),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              
              // Círculo radial de acertos
              Center(
                child: SizedBox(
                  width: 140,
                  height: 140,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 140,
                        height: 140,
                        child: CircularProgressIndicator(
                          value: _acertos / _questoes.length,
                          strokeWidth: 8,
                          backgroundColor: AppColors.borderMedium(context),
                          valueColor: AlwaysStoppedAnimation<Color>(themeColor),
                        ),
                      ),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '$porcentagem%',
                            style: AppTextStyles.titulo(context, size: 32.0, color: themeColor),
                          ),
                          Text(
                            '$_acertos / ${_questoes.length} acertos',
                            style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Feedback textual
              Text(
                'Sessão Concluída!',
                style: AppTextStyles.titulo(context, size: 24.0),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                porcentagem >= 70
                    ? 'Excelente desempenho! Você compreendeu muito bem esta trilha.'
                    : 'Bom treino! Continue praticando para fixar ainda mais o conteúdo.',
                style: AppTextStyles.corpo(context, color: AppColors.textSecondary(context)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              // Estatísticas
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground(context),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border(context)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildResultStat('Disciplina', widget.materia),
                    Container(width: 1, height: 40, color: AppColors.border(context)),
                    _buildResultStat('Dificuldade', widget.dificuldade),
                    Container(width: 1, height: 40, color: AppColors.border(context)),
                    _buildResultStat('Modo', widget.modo),
                  ],
                ),
              ),

              const Spacer(),

              // Botão voltar ao Dashboard
              ElevatedButton(
                onPressed: () => context.go('/menu'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: themeColor,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  'Voltar ao Menu',
                  style: AppTextStyles.botao(context, color: Colors.white),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultStat(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: AppTextStyles.legenda(context, color: AppColors.textHint(context)),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTextStyles.corpo(context, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
