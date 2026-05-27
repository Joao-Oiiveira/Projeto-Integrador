import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// ─────────────────────────────────────────────
// Modelo de dados de um Evento
// 🔧 BACK-END: Essa classe receberá dados da API via fromJson()
// ─────────────────────────────────────────────
class Evento {
  final String id;
  final String nome;
  final String? descricao;
  final DateTime data;
  final TimeOfDay? horarioInicio;
  final TimeOfDay? horarioFim;
  final String? materia;
  final Color cor;

  Evento({
    required this.id,
    required this.nome,
    this.descricao,
    required this.data,
    this.horarioInicio,
    this.horarioFim,
    this.materia,
    required this.cor,
  });
}

// ─────────────────────────────────────────────
// Calendario Mensal Screen
// ─────────────────────────────────────────────
class CalendarioMensalScreen extends StatefulWidget {
  const CalendarioMensalScreen({super.key});

  @override
  State<CalendarioMensalScreen> createState() => _CalendarioMensalScreenState();
}

class _CalendarioMensalScreenState extends State<CalendarioMensalScreen> {
  final DateTime hoje = DateTime.now();
  late int _anoAtual;
  DateTime? _mesSelecionado; // null = visão anual, preenchido = visão mensal
  DateTime? _diaSelecionado;

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

  final List<String> _nomesMesesAbrev = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  final List<String> _nomesDiasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  final List<String> _nomesDiasSemanaFull = [
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sab',
  ];

  // 🔧 BACK-END: Matérias do usuário virão da API
  final List<Map<String, dynamic>> materias = [
    {'nome': 'Matemática', 'cor': const Color(0xFF7EB8F7)},
    {'nome': 'Português', 'cor': const Color(0xFFF7A8C4)},
  ];

  // 🔧 BACK-END: Buscar eventos do usuário na API
  final List<Evento> eventos = [
    Evento(
      id: '1',
      nome: 'Prova de Matemática',
      descricao: 'Capítulos 1 ao 5',
      data: DateTime.now(),
      horarioInicio: const TimeOfDay(hour: 8, minute: 0),
      horarioFim: const TimeOfDay(hour: 10, minute: 0),
      materia: 'Matemática',
      cor: const Color(0xFF7EB8F7),
    ),
    Evento(
      id: '2',
      nome: 'Lista de Português',
      data: DateTime.now().add(const Duration(days: 2)),
      materia: 'Português',
      cor: const Color(0xFFF7A8C4),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _anoAtual = hoje.year;
    _diaSelecionado = hoje;
    _mesSelecionado = DateTime(hoje.year, hoje.month, 1);
  }

  List<Evento> _eventosNoDia(DateTime dia) {
    return eventos
        .where(
          (e) =>
              e.data.day == dia.day &&
              e.data.month == dia.month &&
              e.data.year == dia.year,
        )
        .toList();
  }

  bool _mesTemEventos(int mes) {
    return eventos.any((e) => e.data.month == mes && e.data.year == _anoAtual);
  }

  List<DateTime?> _gerarDiasDoMes(DateTime mes) {
    final primeiroDia = DateTime(mes.year, mes.month, 1);
    final ultimoDia = DateTime(mes.year, mes.month + 1, 0);
    final offsetInicio = primeiroDia.weekday % 7;

    List<DateTime?> dias = [];
    for (int i = 0; i < offsetInicio; i++) dias.add(null);
    for (int i = 1; i <= ultimoDia.day; i++) {
      dias.add(DateTime(mes.year, mes.month, i));
    }
    while (dias.length % 7 != 0) dias.add(null);
    return dias;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      floatingActionButton: FloatingActionButton(
        onPressed:
            () => _abrirFormularioEvento(context, _diaSelecionado ?? hoje),
        backgroundColor: const Color(0xFF7EB8F7),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: SafeArea(
        child:
            _mesSelecionado == null ? _buildVisaoAnual() : _buildVisaoMensal(),
      ),
    );
  }

  // ════════════════════════════════════════════
  // VISÃO ANUAL
  // ════════════════════════════════════════════
  Widget _buildVisaoAnual() {
    return Column(
      children: [
        // Header ano
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: () {
                  // 🔧 BACK-END: Apenas navegação
                  // context.go('/calendario');
                },
                child: const Icon(
                  Icons.arrow_back,
                  color: Colors.white,
                  size: 22,
                ),
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () => setState(() => _anoAtual--),
                    child: const Icon(
                      Icons.chevron_left,
                      color: Colors.white70,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '$_anoAtual',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => setState(() => _anoAtual++),
                    child: const Icon(
                      Icons.chevron_right,
                      color: Colors.white70,
                      size: 28,
                    ),
                  ),
                ],
              ),
              // Botão hoje
              GestureDetector(
                onTap:
                    () => setState(() {
                      _anoAtual = hoje.year;
                    }),
                child: const Text(
                  'Hoje',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF7EB8F7),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Grade de meses
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              childAspectRatio: 0.85,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: 12,
            itemBuilder: (context, index) {
              return _buildMiniMes(index + 1);
            },
          ),
        ),
      ],
    );
  }

  // ── Widget: Mini calendário de um mês ────────
  Widget _buildMiniMes(int mes) {
    final dataMes = DateTime(_anoAtual, mes, 1);
    final diasDoMes = _gerarDiasDoMes(dataMes);
    final bool isMesAtual = mes == hoje.month && _anoAtual == hoje.year;
    final bool temEventos = _mesTemEventos(mes);

    return GestureDetector(
      onTap: () {
        setState(() {
          _mesSelecionado = dataMes;
          _diaSelecionado = isMesAtual ? hoje : dataMes;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isMesAtual ? const Color(0xFF7EB8F7) : Colors.white12,
            width: isMesAtual ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Nome do mês
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _nomesMesesAbrev[mes - 1],
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color:
                        isMesAtual ? const Color(0xFF7EB8F7) : Colors.white70,
                  ),
                ),
                // Ponto indicando que tem eventos
                if (temEventos)
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFFF7A8C4),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),

            // Dias da semana abreviados
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children:
                  _nomesDiasSemana
                      .map(
                        (d) => Text(
                          d,
                          style: const TextStyle(
                            fontSize: 7,
                            color: Colors.white24,
                          ),
                        ),
                      )
                      .toList(),
            ),
            const SizedBox(height: 2),

            // Grade mini dos dias
            Expanded(
              child: GridView.builder(
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 7,
                  childAspectRatio: 1,
                ),
                itemCount: diasDoMes.length > 35 ? 35 : diasDoMes.length,
                itemBuilder: (context, index) {
                  final dia =
                      index < diasDoMes.length ? diasDoMes[index] : null;
                  if (dia == null) return const SizedBox();

                  final bool isHoje =
                      dia.day == hoje.day &&
                      dia.month == hoje.month &&
                      dia.year == hoje.year;
                  final temEventoNoDia = _eventosNoDia(dia).isNotEmpty;

                  return Container(
                    margin: const EdgeInsets.all(0.5),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color:
                          isHoje ? const Color(0xFF7EB8F7) : Colors.transparent,
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${dia.day}',
                            style: TextStyle(
                              fontSize: 7,
                              color: isHoje ? Colors.white : Colors.white54,
                              fontWeight:
                                  isHoje ? FontWeight.bold : FontWeight.w400,
                            ),
                          ),
                          if (temEventoNoDia && !isHoje)
                            Container(
                              width: 3,
                              height: 3,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: Color(0xFF7EB8F7),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ════════════════════════════════════════════
  // VISÃO MENSAL
  // ════════════════════════════════════════════
  Widget _buildVisaoMensal() {
    final diasDoMes = _gerarDiasDoMes(_mesSelecionado!);
    final eventosDoDia =
        _diaSelecionado != null ? _eventosNoDia(_diaSelecionado!) : <Evento>[];

    return Column(
      children: [
        // Header mês
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Volta para visão anual
              GestureDetector(
                onTap: () {
                  context.go('/calendarioMenu');
                },
                child: const Icon(
                  Icons.arrow_back,
                  color: Colors.white,
                  size: 22,
                ),
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap:
                        () => setState(() {
                          _mesSelecionado = DateTime(
                            _mesSelecionado!.month == 1
                                ? _mesSelecionado!.year - 1
                                : _mesSelecionado!.year,
                            _mesSelecionado!.month == 1
                                ? 12
                                : _mesSelecionado!.month - 1,
                            1,
                          );
                          _diaSelecionado = DateTime(
                            _mesSelecionado!.year,
                            _mesSelecionado!.month,
                            1,
                          );
                        }),
                    child: const Icon(
                      Icons.chevron_left,
                      color: Colors.white70,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _mesSelecionado = null;
                          });
                        },
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(
                              _nomesMeses[_mesSelecionado!.month - 1],
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              '${_mesSelecionado!.year}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.white38,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap:
                        () => setState(() {
                          _mesSelecionado = DateTime(
                            _mesSelecionado!.month == 12
                                ? _mesSelecionado!.year + 1
                                : _mesSelecionado!.year,
                            _mesSelecionado!.month == 12
                                ? 1
                                : _mesSelecionado!.month + 1,
                            1,
                          );
                        }),
                    child: const Icon(
                      Icons.chevron_right,
                      color: Colors.white70,
                      size: 28,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap:
                    () => setState(() {
                      _mesSelecionado = DateTime(hoje.year, hoje.month, 1);
                      _diaSelecionado = hoje;
                    }),
                child: const Text(
                  'Hoje',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF7EB8F7),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Nomes dos dias da semana
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children:
                _nomesDiasSemanaFull
                    .map(
                      (d) => SizedBox(
                        width: 36,
                        child: Text(
                          d,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.white38,
                          ),
                        ),
                      ),
                    )
                    .toList(),
          ),
        ),

        // Grade do mês
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              childAspectRatio: 1,
            ),
            itemCount: diasDoMes.length,
            itemBuilder: (context, index) {
              final dia = diasDoMes[index];
              if (dia == null) return const SizedBox();
              return _buildDiaCell(dia);
            },
          ),
        ),

        const Divider(color: Colors.white12, height: 20),

        // Eventos do dia selecionado
        Expanded(child: _buildEventosDoDia(eventosDoDia)),
      ],
    );
  }

  // ── Widget: Célula de um dia ──────────────────
  Widget _buildDiaCell(DateTime dia) {
    final bool isHoje =
        dia.day == hoje.day && dia.month == hoje.month && dia.year == hoje.year;
    final bool isSelecionado =
        _diaSelecionado != null &&
        dia.day == _diaSelecionado!.day &&
        dia.month == _diaSelecionado!.month &&
        dia.year == _diaSelecionado!.year;
    final eventosNoDia = _eventosNoDia(dia);

    return GestureDetector(
      onTap: () => setState(() => _diaSelecionado = dia),
      child: Container(
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color:
              isSelecionado
                  ? const Color(0xFF7EB8F7)
                  : isHoje
                  ? const Color(0xFF7EB8F7).withOpacity(0.2)
                  : Colors.transparent,
          border:
              isHoje && !isSelecionado
                  ? Border.all(color: const Color(0xFF7EB8F7), width: 1.5)
                  : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${dia.day}',
              style: TextStyle(
                fontSize: 14,
                fontWeight:
                    isHoje || isSelecionado ? FontWeight.bold : FontWeight.w400,
                color:
                    isSelecionado
                        ? Colors.white
                        : isHoje
                        ? const Color(0xFF7EB8F7)
                        : Colors.white70,
              ),
            ),
            if (eventosNoDia.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children:
                    eventosNoDia
                        .take(3)
                        .map(
                          (e) => Container(
                            width: 4,
                            height: 4,
                            margin: const EdgeInsets.only(
                              top: 2,
                              left: 1,
                              right: 1,
                            ),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isSelecionado ? Colors.white : e.cor,
                            ),
                          ),
                        )
                        .toList(),
              ),
          ],
        ),
      ),
    );
  }

  // ── Widget: Lista de eventos do dia ──────────
  Widget _buildEventosDoDia(List<Evento> eventosDoDia) {
    final tituloDia =
        _diaSelecionado != null
            ? _diaSelecionado!.day == hoje.day &&
                    _diaSelecionado!.month == hoje.month
                ? 'Hoje, ${hoje.day} de ${_nomesMeses[hoje.month - 1]}'
                : '${_diaSelecionado!.day} de ${_nomesMeses[_diaSelecionado!.month - 1]}'
            : 'Selecione um dia';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            tituloDia,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child:
                eventosDoDia.isEmpty
                    ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(
                            Icons.event_available,
                            color: Colors.white12,
                            size: 40,
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Nenhum evento neste dia',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white24,
                            ),
                          ),
                        ],
                      ),
                    )
                    : ListView.builder(
                      itemCount: eventosDoDia.length,
                      itemBuilder:
                          (context, index) =>
                              _buildEventoCard(eventosDoDia[index]),
                    ),
          ),
        ],
      ),
    );
  }

  // ── Widget: Card de evento ───────────────────
  Widget _buildEventoCard(Evento evento) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
        border: Border(left: BorderSide(color: evento.cor, width: 4)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  evento.nome,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                if (evento.descricao != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    evento.descricao!,
                    style: const TextStyle(fontSize: 12, color: Colors.white38),
                  ),
                ],
                if (evento.materia != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: evento.cor,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        evento.materia!,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.white38,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          if (evento.horarioInicio != null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${evento.horarioInicio!.hour.toString().padLeft(2, '0')}:${evento.horarioInicio!.minute.toString().padLeft(2, '0')}',
                  style: const TextStyle(fontSize: 12, color: Colors.white54),
                ),
                if (evento.horarioFim != null)
                  Text(
                    '${evento.horarioFim!.hour.toString().padLeft(2, '0')}:${evento.horarioFim!.minute.toString().padLeft(2, '0')}',
                    style: const TextStyle(fontSize: 11, color: Colors.white24),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  // ── Bottom Sheet: Formulário de novo evento ──
  void _abrirFormularioEvento(BuildContext context, DateTime dataSelecionada) {
    final nomeController = TextEditingController();
    final descricaoController = TextEditingController();
    DateTime dataCriacao = dataSelecionada;
    TimeOfDay? horarioInicio;
    TimeOfDay? horarioFim;
    String? materiaSelecionada;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:
          (context) => StatefulBuilder(
            builder:
                (context, setModalState) => Container(
                  padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                    top: 20,
                    left: 20,
                    right: 20,
                  ),
                  decoration: const BoxDecoration(
                    color: Color(0xFF1E1E1E),
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(24),
                    ),
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Barra de arrasto
                        Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            margin: const EdgeInsets.only(bottom: 20),
                            decoration: BoxDecoration(
                              color: Colors.white24,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),

                        const Text(
                          'Novo Evento',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Nome
                        _buildCampoTexto(
                          controller: nomeController,
                          label: 'Nome do evento *',
                        ),
                        const SizedBox(height: 12),

                        // Descrição
                        _buildCampoTexto(
                          controller: descricaoController,
                          label: 'Descrição (opcional)',
                          maxLines: 3,
                        ),
                        const SizedBox(height: 12),

                        // Data
                        GestureDetector(
                          onTap: () async {
                            final picked = await showDatePicker(
                              context: context,
                              initialDate: dataCriacao,
                              firstDate: DateTime(2020),
                              lastDate: DateTime(2030),
                              builder:
                                  (context, child) => Theme(
                                    data: ThemeData.dark(),
                                    child: child!,
                                  ),
                            );
                            if (picked != null)
                              setModalState(() => dataCriacao = picked);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 14,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2A2A2A),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.white12),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${dataCriacao.day.toString().padLeft(2, '0')}/${dataCriacao.month.toString().padLeft(2, '0')}/${dataCriacao.year}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                  ),
                                ),
                                const Icon(
                                  Icons.calendar_today_outlined,
                                  color: Colors.white38,
                                  size: 18,
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Horários opcionais
                        Row(
                          children: [
                            Expanded(
                              child: _buildCampoHorario(
                                label:
                                    horarioInicio != null
                                        ? '${horarioInicio!.hour.toString().padLeft(2, '0')}:${horarioInicio!.minute.toString().padLeft(2, '0')}'
                                        : 'Início',
                                preenchido: horarioInicio != null,
                                onTap: () async {
                                  final picked = await showTimePicker(
                                    context: context,
                                    initialTime: TimeOfDay.now(),
                                    builder:
                                        (context, child) => Theme(
                                          data: ThemeData.dark(),
                                          child: child!,
                                        ),
                                  );
                                  if (picked != null)
                                    setModalState(() => horarioInicio = picked);
                                },
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _buildCampoHorario(
                                label:
                                    horarioFim != null
                                        ? '${horarioFim!.hour.toString().padLeft(2, '0')}:${horarioFim!.minute.toString().padLeft(2, '0')}'
                                        : 'Fim',
                                preenchido: horarioFim != null,
                                onTap: () async {
                                  final picked = await showTimePicker(
                                    context: context,
                                    initialTime: TimeOfDay.now(),
                                    builder:
                                        (context, child) => Theme(
                                          data: ThemeData.dark(),
                                          child: child!,
                                        ),
                                  );
                                  if (picked != null)
                                    setModalState(() => horarioFim = picked);
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Matéria
                        const Text(
                          'Matéria (opcional)',
                          style: TextStyle(fontSize: 13, color: Colors.white54),
                        ),
                        const SizedBox(height: 8),
                        // 🔧 BACK-END: materias vem da API de disciplinas do usuário
                        Wrap(
                          spacing: 8,
                          children:
                              materias.map((m) {
                                final bool sel =
                                    materiaSelecionada == m['nome'];
                                return GestureDetector(
                                  onTap:
                                      () => setModalState(
                                        () =>
                                            materiaSelecionada =
                                                sel ? null : m['nome'],
                                      ),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 14,
                                      vertical: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color:
                                          sel
                                              ? (m['cor'] as Color).withOpacity(
                                                0.3,
                                              )
                                              : const Color(0xFF2A2A2A),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                        color:
                                            sel
                                                ? m['cor'] as Color
                                                : Colors.white12,
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: m['cor'] as Color,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          m['nome'],
                                          style: TextStyle(
                                            fontSize: 13,
                                            color:
                                                sel
                                                    ? Colors.white
                                                    : Colors.white54,
                                            fontWeight:
                                                sel
                                                    ? FontWeight.w600
                                                    : FontWeight.w400,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              }).toList(),
                        ),

                        const SizedBox(height: 24),

                        // Botão criar
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: () {
                              if (nomeController.text.isEmpty) return;
                              // 🔧 BACK-END: Enviar evento para a API
                              // Ex: AgendaService.criarEvento(...)
                              setState(() {
                                eventos.add(
                                  Evento(
                                    id:
                                        DateTime.now().millisecondsSinceEpoch
                                            .toString(),
                                    nome: nomeController.text,
                                    descricao:
                                        descricaoController.text.isEmpty
                                            ? null
                                            : descricaoController.text,
                                    data: dataCriacao,
                                    horarioInicio: horarioInicio,
                                    horarioFim: horarioFim,
                                    materia: materiaSelecionada,
                                    cor:
                                        materiaSelecionada != null
                                            ? (materias.firstWhere(
                                                  (m) =>
                                                      m['nome'] ==
                                                      materiaSelecionada,
                                                )['cor']
                                                as Color)
                                            : const Color(0xFF7EB8F7),
                                  ),
                                );
                                _diaSelecionado = dataCriacao;
                                if (_mesSelecionado != null) {
                                  _mesSelecionado = DateTime(
                                    dataCriacao.year,
                                    dataCriacao.month,
                                    1,
                                  );
                                }
                              });
                              Navigator.pop(context);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF7EB8F7),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              'Criar Evento',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
          ),
    );
  }

  Widget _buildCampoTexto({
    required TextEditingController controller,
    required String label,
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      cursorColor: const Color(0xFF7EB8F7),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white38, fontSize: 13),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.white12),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF7EB8F7)),
        ),
        filled: true,
        fillColor: const Color(0xFF2A2A2A),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 14,
        ),
      ),
    );
  }

  Widget _buildCampoHorario({
    required String label,
    required bool preenchido,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A2A),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                color: preenchido ? Colors.white : Colors.white38,
                fontSize: 14,
              ),
            ),
            const Icon(Icons.access_time, color: Colors.white38, size: 18),
          ],
        ),
      ),
    );
  }
}
