import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';
import 'package:mobile/servicos/api_service.dart';

// ─────────────────────────────────────────────
// Modelo de dados de uma Tarefa
// 🔧 BACK-END: Essa classe receberá dados da API via fromJson()
// ─────────────────────────────────────────────
class Tarefa {
  final String id;
  final String titulo;
  final String? materia;
  final DateTime data;
  bool concluida;

  Tarefa({
    required this.id,
    required this.titulo,
    this.materia,
    required this.data,
    this.concluida = false,
  });
}

// ─────────────────────────────────────────────
// Calendario Screen
// ─────────────────────────────────────────────
class CalendarioMenuScreen extends StatefulWidget {
  const CalendarioMenuScreen({super.key});

  @override
  State<CalendarioMenuScreen> createState() => _CalendarioMenuScreenState();
}

class _CalendarioMenuScreenState extends State<CalendarioMenuScreen> {
  final DateTime hoje = DateTime.now();
  final ScrollController _calendarioScrollController = ScrollController();

  // No Dart: 0=DOM, 1=SEG, 2=TER, 3=QUA, 4=QUI, 5=SEX, 6=SAB
  final List<String> _nomesDias = [
    'DOM',
    'SEG',
    'TER',
    'QUA',
    'QUI',
    'SEX',
    'SAB',
  ];

  final List<String> _nomesMeses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  late List<Map<String, dynamic>> diasDaSemana;

  List<Tarefa> tarefas = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _gerarDiasDaSemana();
    _loadData();

    // Rola automaticamente até o dia de hoje
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final indiceHoje = diasDaSemana.indexWhere((d) => d['isHoje'] == true);
      if (indiceHoje > 0) {
        _calendarioScrollController.animateTo(
          indiceHoje * 92.0, // largura do card + margin
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _calendarioScrollController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final fetchedTarefas = await ApiService().obterTarefas();
      if (mounted) {
        setState(() {
          tarefas = fetchedTarefas.map((t) => Tarefa(
            id: t['id'].toString(),
            titulo: t['titulo'],
            materia: t['disciplina'] != null ? t['disciplina']['nome'] : null,
            data: DateTime.parse(t['data_entrega'] ?? DateTime.now().toIso8601String()),
            concluida: t['status'] == 'concluida',
          )).toList();
          
          _gerarDiasDaSemana();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _gerarDiasDaSemana() {
    final int diaDaSemana = hoje.weekday; // 1 = Segunda, ..., 7 = Domingo
    // Ajuste para o Flutter: Domingo é 7, queremos que a semana comece no Domingo (0)
    final int offset = diaDaSemana == 7 ? 0 : diaDaSemana;
    final DateTime inicioDaSemana = hoje.subtract(Duration(days: offset));

    diasDaSemana = List.generate(7, (index) {
      final dia = inicioDaSemana.add(Duration(days: index));
      return {
        'data': dia,
        'dia': dia.day.toString().padLeft(2, '0'),
        'mes': dia.month.toString().padLeft(2, '0'),
        'nomeDia': _nomesDias[dia.weekday % 7],
        'isHoje':
            dia.day == hoje.day &&
            dia.month == hoje.month &&
            dia.year == hoje.year,
        'eventos': _getEventosDoDia(dia),
      };
    });
  }

  List<String> _getEventosDoDia(DateTime dia) {
    return tarefas
        .where((t) =>
            t.data.day == dia.day &&
            t.data.month == dia.month &&
            t.data.year == dia.year)
        .map((t) => t.titulo)
        .toList();
  }

  // Tarefas de hoje
  List<Tarefa> get tarefasHoje {
    return tarefas
        .where(
          (t) =>
              t.data.day == hoje.day &&
              t.data.month == hoje.month &&
              t.data.year == hoje.year,
        )
        .toList()
      ..sort((a, b) => a.data.compareTo(b.data));
  }

  // Tarefas dessa semana (exceto hoje)
  List<Tarefa> get tarefasEstaSemana {
    final fimDaSemana = hoje.add(Duration(days: 7 - hoje.weekday % 7));
    return tarefas
        .where(
          (t) =>
              t.data.isAfter(DateTime(hoje.year, hoje.month, hoje.day)) &&
              t.data.isBefore(fimDaSemana) &&
              !(t.data.day == hoje.day && t.data.month == hoje.month),
        )
        .toList()
      ..sort((a, b) => a.data.compareTo(b.data));
  }

  // Tarefas da semana que vem
  List<Tarefa> get tarefasProximaSemana {
    final fimDaSemana = hoje.add(Duration(days: 7 - hoje.weekday % 7));
    final fimProximaSemana = fimDaSemana.add(const Duration(days: 7));
    return tarefas
        .where(
          (t) =>
              t.data.isAfter(fimDaSemana) && t.data.isBefore(fimProximaSemana),
        )
        .toList()
      ..sort((a, b) => a.data.compareTo(b.data));
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background(context),
        body: Center(
          child: CircularProgressIndicator(color: AppColors.destaque),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background(context),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 20),

              _buildCalendario(),
              const SizedBox(height: 28),

              Text(
                'Tarefas pendentes',
                style: AppTextStyles.subtitulo(context, size: 20.0),
              ),
              const SizedBox(height: 14),

              // ── Tarefas de Hoje ──────────────────────
              if (tarefasHoje.isNotEmpty) ...[
                _buildSecaoTarefa('Hoje'),
                ...tarefasHoje.map((t) => _buildTarefaCard(t)),
                const SizedBox(height: 16),
              ],

              // ── Tarefas desta Semana ─────────────────
              if (tarefasEstaSemana.isNotEmpty) ...[
                _buildSecaoTarefa('Esta semana'),
                ...tarefasEstaSemana.map((t) => _buildTarefaCard(t)),
                const SizedBox(height: 16),
              ],

              // ── Tarefas da Próxima Semana ────────────
              if (tarefasProximaSemana.isNotEmpty) ...[
                _buildSecaoTarefa('Próxima semana'),
                ...tarefasProximaSemana.map((t) => _buildTarefaCard(t)),
                const SizedBox(height: 16),
              ],

              // ── Nenhuma tarefa ───────────────────────
              if (tarefasHoje.isEmpty &&
                  tarefasEstaSemana.isEmpty &&
                  tarefasProximaSemana.isEmpty)
                _buildListaVazia(),
            ],
          ),
        ),
      ),
    );
  }

  // ── Widget: Header ───────────────────────────
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            GestureDetector(
              onTap: () {
                context.go('/menu');
              },
              child: Icon(
                Icons.arrow_back,
                color: AppColors.textPrimary(context),
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'AGENDA',
              style: AppTextStyles.titulo(
                context,
                size: 20.0,
              ).copyWith(letterSpacing: 1.2),
            ),
          ],
        ),
        GestureDetector(
          onTap: () {
            context.go('/calendario');
          },
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.cardBackground(context),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border(context)),
            ),
            child: Icon(
              Icons.calendar_month_outlined,
              color: AppColors.textSecondary(context),
              size: 22,
            ),
          ),
        ),
      ],
    );
  }

  // ── Widget: Mini Calendário semanal ──────────
  Widget _buildCalendario() {
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
          Text(
            '${_nomesMeses[hoje.month - 1]} ${hoje.year}',
            style: AppTextStyles.legenda(
              context,
              color: AppColors.textSecondary(context),
            ).copyWith(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            controller: _calendarioScrollController,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children:
                  diasDaSemana.map((d) => _buildDiaCalendario(d)).toList(),
            ),
          ),
        ],
      ),
    );
  }

  // ── Widget: Dia do Calendário ─────────────────
  Widget _buildDiaCalendario(Map<String, dynamic> diaInfo) {
    final bool isHoje = diaInfo['isHoje'];
    final List<String> eventos = List<String>.from(diaInfo['eventos']);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      width: isHoje ? 115 : 82,
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color:
            isHoje
                ? AppColors.destaque.withOpacity(0.2)
                : AppColors.cardSecondary(context),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isHoje ? AppColors.destaque : AppColors.border(context),
          width: isHoje ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${diaInfo['dia']}/${diaInfo['mes']} ${diaInfo['nomeDia']}',
            style: AppTextStyles.legenda(
              context,
              color:
                  isHoje
                      ? AppColors.destaque
                      : AppColors.textSecondary(context),
            ).copyWith(
              fontWeight: isHoje ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          const SizedBox(height: 6),
          if (eventos.isEmpty)
            const SizedBox(height: 20)
          else
            ...eventos.map(
              (e) => Padding(
                padding: const EdgeInsets.only(bottom: 3),
                child: Row(
                  children: [
                    Container(
                      width: 5,
                      height: 5,
                      decoration: const BoxDecoration(
                        color: AppColors.destaque,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 3),
                    Expanded(
                      child: Text(
                        e,
                        style: AppTextStyles.legenda(
                          context,
                          color: AppColors.textSecondary(context),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ── Widget: Card de Tarefa ───────────────────
  Widget _buildTarefaCard(Tarefa tarefa) {
    final bool isHoje =
        tarefa.data.day == hoje.day &&
        tarefa.data.month == hoje.month &&
        tarefa.data.year == hoje.year;

    final Color materiaCor = AppColors.materiaCor(tarefa.materia ?? '');

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color:
              isHoje
                  ? AppColors.destaque.withOpacity(0.5)
                  : AppColors.border(context),
        ),
      ),
      child: Row(
        children: [
          // Checkbox customizado
          GestureDetector(
            onTap: () {
              setState(() {
                tarefa.concluida = !tarefa.concluida;
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color:
                    tarefa.concluida ? AppColors.destaque : Colors.transparent,
                border: Border.all(
                  color:
                      tarefa.concluida
                          ? AppColors.destaque
                          : AppColors.textHint(context),
                  width: 2,
                ),
              ),
              child:
                  tarefa.concluida
                      ? Icon(
                        Icons.check,
                        color: AppColors.background(context),
                        size: 14,
                      )
                      : null,
            ),
          ),

          const SizedBox(width: 14),

          // Título e matéria
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tarefa.titulo,
                  style: AppTextStyles.corpo(
                    context,
                    color:
                        tarefa.concluida
                            ? AppColors.textHint(context)
                            : AppColors.textPrimary(context),
                    fontWeight: FontWeight.w500,
                  ).copyWith(
                    decoration:
                        tarefa.concluida
                            ? TextDecoration.lineThrough
                            : TextDecoration.none,
                    decorationColor: AppColors.textHint(context),
                  ),
                ),
                if (tarefa.materia != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: materiaCor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        tarefa.materia!,
                        style: AppTextStyles.legenda(
                          context,
                          color: AppColors.textSecondary(context),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          // Data
          Text(
            isHoje
                ? 'Hoje'
                : '${tarefa.data.day.toString().padLeft(2, '0')}/${tarefa.data.month.toString().padLeft(2, '0')}',
            style: AppTextStyles.legenda(
              context,
              color: isHoje ? AppColors.destaque : AppColors.textHint(context),
            ).copyWith(
              fontWeight: isHoje ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  // ── Widget: Lista vazia ──────────────────────
  Widget _buildListaVazia() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40),
      alignment: Alignment.center,
      child: Column(
        children: [
          Icon(
            Icons.check_circle_outline,
            color: AppColors.textHint(context),
            size: 48,
          ),
          const SizedBox(height: 12),
          Text(
            'Nenhuma tarefa pendente!',
            style: AppTextStyles.corpo(
              context,
              color: AppColors.textHint(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSecaoTarefa(String titulo) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        titulo,
        style: AppTextStyles.subtitulo(
          context,
          size: 16.0,
          color: AppColors.textSecondary(context),
        ),
      ),
    );
  }
}
