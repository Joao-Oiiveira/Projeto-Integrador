import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

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
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  final List<String> _nomesMesesAbrev = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  final List<String> _nomesDiasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  final List<String> _nomesDiasSemanaFull = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  // 🔧 BACK-END: Matérias do usuário virão da API
  final List<Map<String, dynamic>> materias = [
    {'nome': 'Matemática', 'cor': AppColors.matematica},
    {'nome': 'Português', 'cor': AppColors.portugues},
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
      cor: AppColors.matematica,
    ),
    Evento(
      id: '2',
      nome: 'Lista de Português',
      data: DateTime.now().add(const Duration(days: 2)),
      materia: 'Português',
      cor: AppColors.portugues,
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
        .where((e) => e.data.day == dia.day && e.data.month == dia.month && e.data.year == dia.year)
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
      backgroundColor: AppColors.background(context),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _abrirFormularioEvento(context, _diaSelecionado ?? hoje),
        backgroundColor: AppColors.destaque,
        child: Icon(Icons.add, color: AppColors.background(context)),
      ),
      body: SafeArea(
        child: _mesSelecionado == null ? _buildVisaoAnual() : _buildVisaoMensal(),
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
                onTap: () => context.go('/calendarioMenu'),
                child: Icon(
                  Icons.arrow_back,
                  color: AppColors.textPrimary(context),
                  size: 22,
                ),
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () => setState(() => _anoAtual--),
                    child: Icon(
                      Icons.chevron_left,
                      color: AppColors.textSecondary(context),
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '$_anoAtual',
                    style: AppTextStyles.titulo(context, size: 22.0),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => setState(() => _anoAtual++),
                    child: Icon(
                      Icons.chevron_right,
                      color: AppColors.textSecondary(context),
                      size: 28,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => setState(() => _anoAtual = hoje.year),
                child: Text(
                  'Hoje',
                  style: AppTextStyles.subtitulo(
                    context,
                    size: 14.0,
                    color: AppColors.destaque,
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

  // Mini calendário de um mês
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
          color: AppColors.cardBackground(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isMesAtual ? AppColors.destaque : AppColors.border(context),
            width: isMesAtual ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _nomesMesesAbrev[mes - 1],
                  style: AppTextStyles.subtitulo(
                    context,
                    size: 12.0,
                    color: isMesAtual ? AppColors.destaque : AppColors.textSecondary(context),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (temEventos)
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.destaque,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: _nomesDiasSemana
                  .map((d) => Text(
                        d,
                        style: AppTextStyles.legenda(context, color: AppColors.textHint(context), size: 7.0),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 2),

            Expanded(
              child: GridView.builder(
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 7,
                  childAspectRatio: 1,
                ),
                itemCount: diasDoMes.length > 35 ? 35 : diasDoMes.length,
                itemBuilder: (context, index) {
                  final dia = index < diasDoMes.length ? diasDoMes[index] : null;
                  if (dia == null) return const SizedBox();

                  final bool isHoje = dia.day == hoje.day && dia.month == hoje.month && dia.year == hoje.year;
                  final temEventoNoDia = _eventosNoDia(dia).isNotEmpty;

                  return Container(
                    margin: const EdgeInsets.all(0.5),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isHoje ? AppColors.destaque : Colors.transparent,
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${dia.day}',
                            style: AppTextStyles.legenda(
                              context,
                              size: 7.0,
                              color: isHoje ? AppColors.background(context) : AppColors.textSecondary(context),
                            ).copyWith(fontWeight: isHoje ? FontWeight.bold : FontWeight.normal),
                          ),
                          if (temEventoNoDia && !isHoje)
                            Container(
                              width: 3,
                              height: 3,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.destaque,
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
    final eventosDoDia = _diaSelecionado != null ? _eventosNoDia(_diaSelecionado!) : <Evento>[];

    return Column(
      children: [
        // Header mês
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: () {
                  setState(() => _mesSelecionado = null);
                },
                child: Icon(
                  Icons.arrow_back,
                  color: AppColors.textPrimary(context),
                  size: 22,
                ),
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () => setState(() {
                      _mesSelecionado = DateTime(
                        _mesSelecionado!.month == 1 ? _mesSelecionado!.year - 1 : _mesSelecionado!.year,
                        _mesSelecionado!.month == 1 ? 12 : _mesSelecionado!.month - 1,
                        1,
                      );
                      _diaSelecionado = DateTime(_mesSelecionado!.year, _mesSelecionado!.month, 1);
                    }),
                    child: Icon(
                      Icons.chevron_left,
                      color: AppColors.textSecondary(context),
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => setState(() => _mesSelecionado = null),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          _nomesMeses[_mesSelecionado!.month - 1],
                          style: AppTextStyles.titulo(context, size: 20.0),
                        ),
                        Text(
                          '${_mesSelecionado!.year}',
                          style: AppTextStyles.legenda(context, color: AppColors.textHint(context)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => setState(() {
                      _mesSelecionado = DateTime(
                        _mesSelecionado!.month == 12 ? _mesSelecionado!.year + 1 : _mesSelecionado!.year,
                        _mesSelecionado!.month == 12 ? 1 : _mesSelecionado!.month + 1,
                        1,
                      );
                      _diaSelecionado = DateTime(_mesSelecionado!.year, _mesSelecionado!.month, 1);
                    }),
                    child: Icon(
                      Icons.chevron_right,
                      color: AppColors.textSecondary(context),
                      size: 28,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => setState(() {
                  _mesSelecionado = DateTime(hoje.year, hoje.month, 1);
                  _diaSelecionado = hoje;
                }),
                child: Text(
                  'Hoje',
                  style: AppTextStyles.subtitulo(
                    context,
                    size: 14.0,
                    color: AppColors.destaque,
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
            children: _nomesDiasSemanaFull
                .map((d) => SizedBox(
                      width: 36,
                      child: Text(
                        d,
                        textAlign: TextAlign.center,
                        style: AppTextStyles.subtitulo(
                          context,
                          size: 11.0,
                          color: AppColors.textHint(context),
                        ),
                      ),
                    ))
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

        Divider(color: AppColors.border(context), height: 20),

        // Eventos do dia selecionado
        Expanded(child: _buildEventosDoDia(eventosDoDia)),
      ],
    );
  }

  // Célula de um dia na grade mensal
  Widget _buildDiaCell(DateTime dia) {
    final bool isHoje = dia.day == hoje.day && dia.month == hoje.month && dia.year == hoje.year;
    final bool isSelecionado = _diaSelecionado != null &&
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
          color: isSelecionado
              ? AppColors.destaque
              : isHoje
                  ? AppColors.destaque.withOpacity(0.2)
                  : Colors.transparent,
          border: isHoje && !isSelecionado
              ? Border.all(color: AppColors.destaque, width: 1.5)
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${dia.day}',
              style: AppTextStyles.corpo(
                context,
                size: 14.0,
                color: isSelecionado
                    ? AppColors.background(context)
                    : isHoje
                        ? AppColors.destaque
                        : AppColors.textPrimary(context),
              ).copyWith(fontWeight: isHoje || isSelecionado ? FontWeight.bold : FontWeight.normal),
            ),
            if (eventosNoDia.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: eventosNoDia
                    .take(3)
                    .map((e) => Container(
                          width: 4,
                          height: 4,
                          margin: const EdgeInsets.only(top: 2, left: 1, right: 1),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isSelecionado ? AppColors.background(context) : e.cor,
                          ),
                        ))
                    .toList(),
              ),
          ],
        ),
      ),
    );
  }

  // Lista de eventos do dia selecionado
  Widget _buildEventosDoDia(List<Evento> eventosDoDia) {
    final tituloDia = _diaSelecionado != null
        ? _diaSelecionado!.day == hoje.day && _diaSelecionado!.month == hoje.month
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
            style: AppTextStyles.subtitulo(context, size: 16.0),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: eventosDoDia.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.event_available,
                          color: AppColors.textHint(context),
                          size: 40,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Nenhum evento neste dia',
                          style: AppTextStyles.legenda(context, color: AppColors.textHint(context)),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: eventosDoDia.length,
                    itemBuilder: (context, index) => _buildEventoCard(eventosDoDia[index]),
                  ),
          ),
        ],
      ),
    );
  }

  // Card de evento
  Widget _buildEventoCard(Evento evento) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBackground(context),
        borderRadius: BorderRadius.circular(12),
        border: Border(
          left: BorderSide(color: evento.cor, width: 4),
          top: BorderSide(color: AppColors.border(context)),
          bottom: BorderSide(color: AppColors.border(context)),
          right: BorderSide(color: AppColors.border(context)),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  evento.nome,
                  style: AppTextStyles.subtitulo(context, size: 15.0),
                ),
                if (evento.descricao != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    evento.descricao!,
                    style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
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
                        style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
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
                  style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                ),
                if (evento.horarioFim != null)
                  Text(
                    '${evento.horarioFim!.hour.toString().padLeft(2, '0')}:${evento.horarioFim!.minute.toString().padLeft(2, '0')}',
                    style: AppTextStyles.legenda(context, color: AppColors.textHint(context)),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  // Formulário modal para criar novos eventos
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
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            top: 20,
            left: 20,
            right: 20,
          ),
          decoration: BoxDecoration(
            color: AppColors.cardBackground(context),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(color: AppColors.border(context)),
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: AppColors.borderMedium(context),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                Text(
                  'Novo Evento',
                  style: AppTextStyles.titulo(context, size: 20.0),
                ),
                const SizedBox(height: 20),

                _buildCampoTexto(
                  controller: nomeController,
                  label: 'Nome do evento *',
                ),
                const SizedBox(height: 12),

                _buildCampoTexto(
                  controller: descricaoController,
                  label: 'Descrição (opcional)',
                  maxLines: 3,
                ),
                const SizedBox(height: 12),

                // Seletor de Data
                GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: dataCriacao,
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2030),
                      builder: (context, child) => Theme(
                        data: Theme.of(context).brightness == Brightness.dark ? ThemeData.dark() : ThemeData.light(),
                        child: child!,
                      ),
                    );
                    if (picked != null) setModalState(() => dataCriacao = picked);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppColors.cardSecondary(context),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.border(context)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${dataCriacao.day.toString().padLeft(2, '0')}/${dataCriacao.month.toString().padLeft(2, '0')}/${dataCriacao.year}',
                          style: AppTextStyles.corpo(context),
                        ),
                        Icon(
                          Icons.calendar_today_outlined,
                          color: AppColors.textHint(context),
                          size: 18,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Horários
                Row(
                  children: [
                    Expanded(
                      child: _buildCampoHorario(
                        label: horarioInicio != null
                            ? '${horarioInicio!.hour.toString().padLeft(2, '0')}:${horarioInicio!.minute.toString().padLeft(2, '0')}'
                            : 'Início',
                        preenchido: horarioInicio != null,
                        onTap: () async {
                          final picked = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                            builder: (context, child) => Theme(
                              data: Theme.of(context).brightness == Brightness.dark ? ThemeData.dark() : ThemeData.light(),
                              child: child!,
                            ),
                          );
                          if (picked != null) setModalState(() => horarioInicio = picked);
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildCampoHorario(
                        label: horarioFim != null
                            ? '${horarioFim!.hour.toString().padLeft(2, '0')}:${horarioFim!.minute.toString().padLeft(2, '0')}'
                            : 'Fim',
                        preenchido: horarioFim != null,
                        onTap: () async {
                          final picked = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                            builder: (context, child) => Theme(
                              data: Theme.of(context).brightness == Brightness.dark ? ThemeData.dark() : ThemeData.light(),
                              child: child!,
                            ),
                          );
                          if (picked != null) setModalState(() => horarioFim = picked);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Seleção de Matéria
                Text(
                  'Matéria (opcional)',
                  style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: materias.map((m) {
                    final bool sel = materiaSelecionada == m['nome'];
                    final Color corMateria = m['cor'] as Color;
                    return GestureDetector(
                      onTap: () => setModalState(() => materiaSelecionada = sel ? null : m['nome']),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: sel ? corMateria.withOpacity(0.15) : AppColors.cardSecondary(context),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: sel ? corMateria : AppColors.border(context),
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
                                color: corMateria,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              m['nome'],
                              style: AppTextStyles.legenda(
                                context,
                                color: sel ? AppColors.textPrimary(context) : AppColors.textSecondary(context),
                              ).copyWith(fontWeight: sel ? FontWeight.bold : FontWeight.normal),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 24),

                // Botão Criar Evento
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      if (nomeController.text.isEmpty) return;
                      setState(() {
                        eventos.add(
                          Evento(
                            id: DateTime.now().millisecondsSinceEpoch.toString(),
                            nome: nomeController.text,
                            descricao: descricaoController.text.isEmpty ? null : descricaoController.text,
                            data: dataCriacao,
                            horarioInicio: horarioInicio,
                            horarioFim: horarioFim,
                            materia: materiaSelecionada,
                            cor: materiaSelecionada != null
                                ? AppColors.materiaCor(materiaSelecionada!)
                                : AppColors.destaque,
                          ),
                        );
                        _diaSelecionado = dataCriacao;
                        if (_mesSelecionado != null) {
                          _mesSelecionado = DateTime(dataCriacao.year, dataCriacao.month, 1);
                        }
                      });
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.destaque,
                      foregroundColor: AppColors.background(context),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      'Criar Evento',
                      style: AppTextStyles.botao(context, color: AppColors.background(context)),
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
      style: AppTextStyles.corpo(context),
      cursorColor: AppColors.destaque,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTextStyles.legenda(context, color: AppColors.textHint(context)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: AppColors.border(context)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.destaque),
        ),
        filled: true,
        fillColor: AppColors.cardSecondary(context),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
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
          color: AppColors.cardSecondary(context),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: AppTextStyles.corpo(
                context,
                color: preenchido ? AppColors.textPrimary(context) : AppColors.textHint(context),
              ),
            ),
            Icon(Icons.access_time, color: AppColors.textHint(context), size: 18),
          ],
        ),
      ),
    );
  }
}
