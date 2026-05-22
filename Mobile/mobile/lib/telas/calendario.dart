import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

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
class CalendarioScreen extends StatefulWidget {
  const CalendarioScreen({super.key});

  @override
  State<CalendarioScreen> createState() => _CalendarioScreenState();
}

class _CalendarioScreenState extends State<CalendarioScreen> {

  final DateTime hoje = DateTime.now();
  final ScrollController _calendarioScrollController = ScrollController();

  // No Dart: 0=DOM, 1=SEG, 2=TER, 3=QUA, 4=QUI, 5=SEX, 6=SAB
  final List<String> _nomesDias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

  final List<String> _nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  late List<Map<String, dynamic>> diasDaSemana;

  // 🔧 BACK-END: Buscar tarefas pendentes da API ordenadas por data
  List<Tarefa> tarefas = [
    Tarefa(
      id: '1',
      titulo: 'Estudar para prova de Matemática',
      materia: 'Matemática',
      data: DateTime.now(),
    ),
    Tarefa(
      id: '2',
      titulo: 'Fazer lista de exercícios',
      materia: 'Português',
      data: DateTime.now(),
    ),
    Tarefa(
      id: '3',
      titulo: 'Revisar flashcards',
      materia: 'Matemática',
      data: DateTime.now().add(const Duration(days: 1)),
    ),
    Tarefa(
      id: '4',
      titulo: 'Ler capítulo 3',
      materia: 'Português',
      data: DateTime.now().add(const Duration(days: 2)),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _gerarDiasDaSemana();

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

  void _gerarDiasDaSemana() {
    // No Dart weekday: 1=SEG ... 6=SAB, 7=DOM
    // % 7 converte para: 0=DOM, 1=SEG ... 6=SAB
    // Assim conseguimos voltar ao domingo correto da semana
    int diaDaSemana = hoje.weekday % 7;
    final inicioDaSemana = hoje.subtract(Duration(days: diaDaSemana));

    diasDaSemana = List.generate(7, (index) {
      final dia = inicioDaSemana.add(Duration(days: index));
      return {
        'data': dia,
        'dia': dia.day.toString().padLeft(2, '0'),
        'mes': dia.month.toString().padLeft(2, '0'),
        'nomeDia': _nomesDias[dia.weekday % 7],
        'isHoje': dia.day == hoje.day &&
                  dia.month == hoje.month &&
                  dia.year == hoje.year,
        // 🔧 BACK-END: Substituir por chamada real à API de eventos por dia
        'eventos': _getEventosDoDia(dia),
      };
    });
  }

  // 🔧 BACK-END: Substituir por chamada real à API
  List<String> _getEventosDoDia(DateTime dia) {
    if (dia.day == hoje.day) return ['Prova Matem.'];
    if (dia.day == hoje.add(const Duration(days: 1)).day) return ['Prova Port.'];
    if (dia.day == hoje.add(const Duration(days: 2)).day) return ['Lista Mater.', 'Lista Port.'];
    return [];
  }

  // Filtra tarefas de dias passados e ordena por data
  // 🔧 BACK-END: Essa lógica pode ser feita direto na query da API
  List<Tarefa> get tarefasFiltradas {
    final agora = DateTime.now();
    return tarefas
      .where((t) => t.data.isAfter(
        DateTime(agora.year, agora.month, agora.day)
            .subtract(const Duration(seconds: 1)),
      ))
      .toList()
      ..sort((a, b) => a.data.compareTo(b.data));
  }

  @override
  Widget build(BuildContext context) {
    print('BUILD - Hoje: ${hoje.day}/${hoje.month} weekday: ${hoje.weekday}');
    print('diasDaSemana: ${diasDaSemana.map((d) => '${d['dia']} isHoje:${d['isHoje']}').toList()}');


    return Scaffold(
      backgroundColor: const Color(0xFF121212),
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

              const Text(
                'Tarefas pendentes',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 14),

              // 🔧 BACK-END: tarefasFiltradas vem da API filtrada e ordenada
              tarefasFiltradas.isEmpty
                  ? _buildListaVazia()
                  : Column(
                      children: tarefasFiltradas
                          .map((t) => _buildTarefaCard(t))
                          .toList(),
                    ),
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
                // 🔧 BACK-END: Apenas navegação
                context.go('/menu');
              },
              child: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
            ),
            const SizedBox(width: 12),
            const Text(
              'CALENDÁRIO',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
        GestureDetector(
          onTap: () {
            // 🔧 BACK-END: Navegar para tela de calendário mensal
            // context.go('/calendario/mensal');
          },
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E1E),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white12),
            ),
            child: const Icon(
              Icons.calendar_month_outlined,
              color: Colors.white70,
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
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${_nomesMeses[hoje.month - 1]} ${hoje.year}',
            style: const TextStyle(
              fontSize: 13,
              color: Colors.white54,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            controller: _calendarioScrollController,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: diasDaSemana
                  .map((d) => _buildDiaCalendario(d))
                  .toList(),
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
      width: isHoje ? 115 : 82,    // dia de hoje fica mais largo
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: isHoje
            ? const Color(0xFF7EB8F7).withValues(alpha: 0.2)
            : const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isHoje ? const Color(0xFF7EB8F7) : Colors.white12,
          width: isHoje ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${diaInfo['dia']}/${diaInfo['mes']} ${diaInfo['nomeDia']}',
            style: TextStyle(
              fontSize: isHoje ? 11 : 10,
              color: isHoje ? const Color(0xFF7EB8F7) : Colors.white54,
              fontWeight: isHoje ? FontWeight.w700 : FontWeight.w400,
            ),
          ),
          const SizedBox(height: 6),
          // 🔧 BACK-END: eventos vêm da API por dia
          if (eventos.isEmpty)
            const SizedBox(height: 20)
          else
            ...eventos.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 3),
              child: Row(
                children: [
                  Container(
                    width: 5,
                    height: 5,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF7A8C4),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 3),
                  Expanded(
                    child: Text(
                      e,
                      style: const TextStyle(
                        fontSize: 8,
                        color: Colors.white70,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            )),
        ],
      ),
    );
  }

  // ── Widget: Card de Tarefa ───────────────────
  Widget _buildTarefaCard(Tarefa tarefa) {
    final bool isHoje = tarefa.data.day == hoje.day &&
                        tarefa.data.month == hoje.month &&
                        tarefa.data.year == hoje.year;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isHoje
              ? const Color(0xFF7EB8F7).withValues(alpha: 0.5)
              : Colors.white12,
        ),
      ),
      child: Row(
        children: [

          // Checkbox customizado
          GestureDetector(
            onTap: () {
              setState(() {
                tarefa.concluida = !tarefa.concluida;
                // 🔧 BACK-END: Atualizar status da tarefa na API
                // Ex: AgendaService.updateTarefa(tarefa.id, concluida: true);
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: tarefa.concluida
                    ? const Color(0xFF7EB8F7)
                    : Colors.transparent,
                border: Border.all(
                  color: tarefa.concluida
                      ? const Color(0xFF7EB8F7)
                      : Colors.white38,
                  width: 2,
                ),
              ),
              child: tarefa.concluida
                  ? const Icon(Icons.check, color: Colors.white, size: 14)
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
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: tarefa.concluida ? Colors.white38 : Colors.white,
                    // 🔧 BACK-END: risco some no próximo dia pois a tarefa
                    // é filtrada pelo campo data na query da API
                    decoration: tarefa.concluida
                        ? TextDecoration.lineThrough
                        : TextDecoration.none,
                    decorationColor: Colors.white38,
                  ),
                ),
                if (tarefa.materia != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Color(0xFF7EB8F7),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        // 🔧 BACK-END: materia vem do relacionamento com tabela disciplinas
                        tarefa.materia!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white38,
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
            style: TextStyle(
              fontSize: 11,
              color: isHoje ? const Color(0xFF7EB8F7) : Colors.white38,
              fontWeight: isHoje ? FontWeight.w600 : FontWeight.w400,
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
      child: const Column(
        children: [
          Icon(Icons.check_circle_outline, color: Colors.white24, size: 48),
          SizedBox(height: 12),
          Text(
            'Nenhuma tarefa pendente!',
            style: TextStyle(fontSize: 15, color: Colors.white38),
          ),
        ],
      ),
    );
  }
}
