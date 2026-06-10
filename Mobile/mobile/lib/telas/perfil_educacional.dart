import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/servicos/accessibility_provider.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

class PerfilEducacionalScreen extends StatefulWidget {
  const PerfilEducacionalScreen({super.key});

  @override
  State<PerfilEducacionalScreen> createState() => _PerfilEducacionalScreenState();
}

class _PerfilEducacionalScreenState extends State<PerfilEducacionalScreen> {
  int _etapaAtual = 0;

  // Respostas locais antes de salvar
  bool _dificuldadeLeitura = false;
  bool _tdah = false;
  bool _autismo = false;
  String _preferenciaConteudo = 'texto'; // 'visual', 'auditivo', 'texto'

  void _avancarEtapa() {
    if (_etapaAtual < 3) {
      setState(() => _etapaAtual++);
    } else {
      _finalizarPerfil();
    }
  }

  void _voltarEtapa() {
    if (_etapaAtual > 0) {
      setState(() => _etapaAtual--);
    }
  }

  void _finalizarPerfil() {
    // Salva todas as preferências no provider
    accessibilityProvider.setDificuldadeLeitura(_dificuldadeLeitura);
    accessibilityProvider.setTdah(_tdah);
    accessibilityProvider.setAutismo(_autismo);
    accessibilityProvider.setPreferenciaConteudo(_preferenciaConteudo);

    // Navega para o menu principal (Dashboard)
    context.go('/menu');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: _etapaAtual > 0
            ? IconButton(
                icon: Icon(Icons.arrow_back_ios, color: AppColors.textPrimary(context)),
                onPressed: _voltarEtapa,
              )
            : null,
        actions: [
          TextButton(
            onPressed: () => context.go('/menu'),
            child: Text(
              'Pular',
              style: AppTextStyles.subtitulo(context, size: 14.0, color: AppColors.textHint(context)),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Barra de Progresso do Questionário
              _buildBarraProgresso(),
              const SizedBox(height: 32),

              // Corpo da Etapa Atual
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _buildEtapaConteudo(),
                ),
              ),

              // Botões de Ação
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _avancarEtapa,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.destaque,
                  foregroundColor: AppColors.background(context),
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  _etapaAtual == 3 ? 'Concluir Perfil' : 'Avançar',
                  style: AppTextStyles.botao(context, color: AppColors.background(context)),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  // Barra de progresso visual de etapas
  Widget _buildBarraProgresso() {
    return Row(
      children: List.generate(4, (index) {
        final bool ativo = index <= _etapaAtual;
        return Expanded(
          child: Container(
            height: 6,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              color: ativo ? AppColors.destaque : AppColors.borderMedium(context),
              borderRadius: BorderRadius.circular(3),
            ),
          ),
        );
      }),
    );
  }

  // Retorna o Widget correspondente à etapa atual
  Widget _buildEtapaConteudo() {
    switch (_etapaAtual) {
      case 0:
        return _buildEtapaBinaria(
          key: const ValueKey(0),
          titulo: 'Dificuldade de leitura?',
          subtitulo: 'Você possui dislexia ou sente que as letras se misturam ao ler?',
          valor: _dificuldadeLeitura,
          onChanged: (v) => setState(() => _dificuldadeLeitura = v),
          infoAcessibilidade: 'Esta opção ativará a fonte OpenDyslexic nas configurações.',
          icon: Icons.menu_book_outlined,
        );
      case 1:
        return _buildEtapaBinaria(
          key: const ValueKey(1),
          titulo: 'Déficit de atenção (TDAH)?',
          subtitulo: 'Você se distrai facilmente ou prefere interfaces de estudo limpas e focadas?',
          valor: _tdah,
          onChanged: (v) => setState(() => _tdah = v),
          infoAcessibilidade: 'Esta opção reduzirá animações complexas e simplificará o layout visual.',
          icon: Icons.psychology_outlined,
        );
      case 2:
        return _buildEtapaBinaria(
          key: const ValueKey(2),
          titulo: 'Sensibilidade a estímulos?',
          subtitulo: 'Você possui autismo ou fadiga visual com facilidade?',
          valor: _autismo,
          onChanged: (v) => setState(() => _autismo = v),
          infoAcessibilidade: 'Esta opção ativará o modo de Alto Contraste para facilitar a distinção visual.',
          icon: Icons.remove_red_eye_outlined,
        );
      case 3:
        return _buildEtapaSelecaoUnica(
          key: const ValueKey(3),
        );
      default:
        return const SizedBox();
    }
  }

  // Layout genérico para perguntas Sim/Não
  Widget _buildEtapaBinaria({
    required Key key,
    required String titulo,
    required String subtitulo,
    required bool valor,
    required ValueChanged<bool> onChanged,
    required String infoAcessibilidade,
    required IconData icon,
  }) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: AppColors.destaque, size: 48),
        const SizedBox(height: 16),
        Text(
          titulo,
          style: AppTextStyles.titulo(context, size: 24.0),
        ),
        const SizedBox(height: 8),
        Text(
          subtitulo,
          style: AppTextStyles.corpo(context, color: AppColors.textSecondary(context)),
        ),
        const SizedBox(height: 32),

        // Cards de Opção
        _buildCardOpcao(
          titulo: 'Sim, eu possuo',
          selecionado: valor == true,
          onTap: () => onChanged(true),
          icon: Icons.check_circle_outline,
        ),
        const SizedBox(height: 16),
        _buildCardOpcao(
          titulo: 'Não possuo',
          selecionado: valor == false,
          onTap: () => onChanged(false),
          icon: Icons.cancel_outlined,
        ),
        const Spacer(),
        
        // Alerta de automação
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardSecondary(context),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border(context)),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: AppColors.textSecondary(context), size: 18),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  infoAcessibilidade,
                  style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Layout para escolha de preferência de conteúdo (Múltiplas escolhas de 1 resposta)
  Widget _buildEtapaSelecaoUnica({required Key key}) {
    final opcoes = [
      {
        'id': 'visual',
        'label': 'Conteúdo Visual',
        'desc': 'Diagramas, tópicos objetivos e resumos simplificados.',
        'icon': Icons.insights_outlined
      },
      {
        'id': 'auditivo',
        'label': 'Conteúdo Auditivo',
        'desc': 'Foco em texto falado e explicações com suporte de voz (Text-to-Speech).',
        'icon': Icons.volume_up_outlined
      },
      {
        'id': 'texto',
        'label': 'Leitura Tradicional',
        'desc': 'Resumos e explicações textuais completos e detalhados.',
        'icon': Icons.text_snippet_outlined
      },
    ];

    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.auto_awesome_outlined, color: AppColors.destaque, size: 48),
        const SizedBox(height: 16),
        Text(
          'Preferência de estudo',
          style: AppTextStyles.titulo(context, size: 24.0),
        ),
        const SizedBox(height: 8),
        Text(
          'Como você se sente mais confortável para compreender novos conteúdos?',
          style: AppTextStyles.corpo(context, color: AppColors.textSecondary(context)),
        ),
        const SizedBox(height: 24),

        ...opcoes.map((opcao) {
          final bool selecionado = _preferenciaConteudo == opcao['id'];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _buildCardOpcaoCompleto(
              titulo: opcao['label'] as String,
              subtitulo: opcao['desc'] as String,
              icon: opcao['icon'] as IconData,
              selecionado: selecionado,
              onTap: () => setState(() => _preferenciaConteudo = opcao['id'] as String),
            ),
          );
        }).toList(),
        
        const Spacer(),

        if (_preferenciaConteudo == 'auditivo')
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.cardSecondary(context),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border(context)),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, color: AppColors.textSecondary(context), size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Esta opção ativará a Leitura em Voz Alta nas páginas de estudo automaticamente.',
                    style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  // Builders de Cards de Opção Customizados
  Widget _buildCardOpcao({
    required String titulo,
    required bool selecionado,
    required VoidCallback onTap,
    required IconData icon,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: selecionado
              ? AppColors.destaque.withOpacity(0.15)
              : AppColors.cardBackground(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selecionado ? AppColors.destaque : AppColors.border(context),
            width: selecionado ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              titulo,
              style: AppTextStyles.subtitulo(
                context,
                size: 16.0,
                color: selecionado ? AppColors.destaque : AppColors.textPrimary(context),
              ),
            ),
            Icon(
              icon,
              color: selecionado ? AppColors.destaque : AppColors.textHint(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardOpcaoCompleto({
    required String titulo,
    required String subtitulo,
    required IconData icon,
    required bool selecionado,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selecionado
              ? AppColors.destaque.withOpacity(0.15)
              : AppColors.cardBackground(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selecionado ? AppColors.destaque : AppColors.border(context),
            width: selecionado ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: selecionado ? AppColors.destaque : AppColors.textHint(context),
              size: 28,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    titulo,
                    style: AppTextStyles.subtitulo(
                      context,
                      size: 16.0,
                      color: selecionado ? AppColors.destaque : AppColors.textPrimary(context),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitulo,
                    style: AppTextStyles.legenda(
                      context,
                      color: selecionado ? AppColors.textPrimary(context).withOpacity(0.7) : AppColors.textSecondary(context),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
