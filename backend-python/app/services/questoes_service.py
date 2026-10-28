import os
import json
import requests
import random
import re
from pathlib import Path
from dotenv import load_dotenv
from app.services.validador_ia import validar_entrada_ia

# Carrega o arquivo .env garantindo o caminho correto mesmo se iniciado da raiz
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

def _obter_api_key():
    key = os.getenv("GROQ_API_KEY")
    if not key:
        load_dotenv(dotenv_path=env_path)
        key = os.getenv("GROQ_API_KEY")
    return key

# Modelo principal na Groq
# Usamos 'openai/gpt-oss-20b' que possui taxa de limite de tokens (OTPM) ampla
# e gera JSON estruturado com alta precisão e rapidez na infraestrutura da Groq.
MODELO_PRINCIPAL = "openai/gpt-oss-20b"

# Timeout generoso para evitar falhas por demora da IA
TIMEOUT_GROQ = 40


def gerar_questoes_ia(tema: str, dificuldade: str, quantidade: int):
    """
    Função principal chamada pela rota de exercícios.
    Valida a mensagem/tema fornecido pelo usuário e, se for indevido,
    aciona um fallback específico que detalha com clareza o motivo da recusa.
    """
    tema_real = (tema or "").strip()
    if not tema_real:
        tema_real = "Conhecimentos Gerais"

    # 1. Validação prévia de conteúdo indevido / segurança
    valido, motivo = validar_entrada_ia(tema_real)
    if not valido:
        print(f"[IA/Validador] Mensagem indevida detectada para o tema '{tema_real}': {motivo}")
        return _gerar_fallback_mensagem_indevida(quantidade, motivo, tema_real)

    dificuldade_real = dificuldade if dificuldade else "médio"
    return _gerar_questoes_com_groq(tema_real, dificuldade_real, quantidade)


def _extrair_json_do_texto(texto: str):
    """
    Tenta extrair um array JSON do texto bruto retornado pela IA.
    Aplica múltiplas estratégias de limpeza para máxima robustez.
    """
    # Estratégia 1: remove blocos de markdown (```json ... ```) e tenta parse direto
    texto_limpo = re.sub(r'```(?:json)?', '', texto).strip()
    try:
        dados = json.loads(texto_limpo)
        if isinstance(dados, list):
            return dados
    except json.JSONDecodeError:
        pass

    # Estratégia 2: procura o primeiro '[' e o último ']' do texto original
    inicio = texto.find('[')
    fim = texto.rfind(']')
    if inicio != -1 and fim != -1 and fim > inicio:
        trecho = texto[inicio:fim + 1]
        try:
            dados = json.loads(trecho)
            if isinstance(dados, list):
                return dados
        except json.JSONDecodeError:
            pass

    # Estratégia 3: no texto limpo de markdown, procura o primeiro '[' e o último ']'
    inicio = texto_limpo.find('[')
    fim = texto_limpo.rfind(']')
    if inicio != -1 and fim != -1 and fim > inicio:
        trecho = texto_limpo[inicio:fim + 1]
        try:
            dados = json.loads(trecho)
            if isinstance(dados, list):
                return dados
        except json.JSONDecodeError:
            pass

    return None


def _gerar_questoes_com_groq(tema: str, dificuldade: str, quantidade: int):
    """
    Comunicação com a Groq API para gerar questões de múltipla escolha.
    """
    key = _obter_api_key()
    if not key:
        print("[Groq] ERRO: GROQ_API_KEY não encontrada no arquivo .env")
        return _gerar_fallback(quantidade, motivo_tecnico="Chave da API de IA não configurada no servidor.")

    prompt = f"""Você é um professor especialista e preciso.
Gere EXATAMENTE {quantidade} questões de múltipla escolha sobre: "{tema}".
Dificuldade: {dificuldade.upper()}.

REGRAS:
1. Questões precisas historicamente, cientificamente e factualmente.
2. Verifique que "alternativa_correta" é a única resposta verdadeira.
3. Retorne APENAS o array JSON, sem nenhum texto antes ou depois.

Estrutura obrigatória:
[
  {{
    "identificador_externo": "groq_ia",
    "origem": "ia",
    "enunciado": "Texto da pergunta aqui...",
    "alternativas": [
      {{"letra": "A", "texto": "Opção 1"}},
      {{"letra": "B", "texto": "Opção 2"}},
      {{"letra": "C", "texto": "Opção 3"}},
      {{"letra": "D", "texto": "Opção 4"}},
      {{"letra": "E", "texto": "Opção 5"}}
    ],
    "alternativa_correta": "C"
  }}
]"""

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODELO_PRINCIPAL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": max(1000, quantidade * 350)
    }

    try:
        print(f"[Groq] Enviando requisição - tema='{tema}', qtd={quantidade}, modelo={MODELO_PRINCIPAL}")
        response = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT_GROQ)

        print(f"[Groq] STATUS: {response.status_code}")

        if response.status_code == 200:
            dados = response.json()
            texto_resposta = dados['choices'][0]['message']['content'].strip()

            questoes = _extrair_json_do_texto(texto_resposta)

            if questoes is not None and isinstance(questoes, list) and len(questoes) > 0:
                # Adiciona IDs únicos a cada questão
                for i, q in enumerate(questoes):
                    q["identificador_externo"] = f"groq_{random.randint(10000, 99999)}_{i}"
                print(f"[Groq] [OK] {len(questoes)} questão(ões) gerada(s) com sucesso.")
                return questoes[:quantidade]
            else:
                print(f"[Groq] [ERRO] Falha no parse do JSON. Texto bruto recebido:\n{texto_resposta}")

                # Verifica se a IA respondeu com recusa por tema indevido
                texto_baixa = texto_resposta.lower()
                termos_recusa = ["não posso", "nao posso", "política", "politica", "ofensiv", "inadequad", "diretrizes", "desculpe, mas", "viola"]
                if any(t in texto_baixa for t in termos_recusa):
                    return _gerar_fallback_mensagem_indevida(
                        quantidade,
                        f"A IA identificou que o assunto solicitado viola as diretrizes educacionais: {texto_resposta[:150]}",
                        tema
                    )

                return _gerar_fallback(quantidade, motivo_tecnico="A resposta da IA não pôde ser formatada como questões de múltipla escolha.")
        else:
            print(f"[Groq] [ERRO] HTTP {response.status_code}: {response.text}")
            erro_str = response.text.lower()
            if "content policy" in erro_str or "safety" in erro_str or "moderation" in erro_str:
                return _gerar_fallback_mensagem_indevida(
                    quantidade,
                    "A mensagem enviada acionou os filtros de segurança e moderação de conteúdo da IA.",
                    tema
                )
            return _gerar_fallback(quantidade, motivo_tecnico=f"Servidor da IA retornou código de erro HTTP {response.status_code}.")

    except requests.exceptions.Timeout:
        print(f"[Groq] [TIMEOUT] Timeout após {TIMEOUT_GROQ}s. API da Groq demorou demais.")
        return _gerar_fallback(quantidade, motivo_tecnico=f"O servidor da IA demorou mais de {TIMEOUT_GROQ}s para responder (tempo esgotado).")
    except Exception as e:
        print(f"[Groq] [ERRO] Exceção inesperada: {e}")
        return _gerar_fallback(quantidade, motivo_tecnico="Falha inesperada de comunicação com o serviço de IA.")


def _gerar_fallback_mensagem_indevida(quantidade: int, motivo: str, tema: str = None):
    """
    Fallback específico acionado quando o usuário escreve uma mensagem ou tema indevido.
    Em vez de genericamente dizer que a IA está indisponível, este fallback:
    1. Especifica exatamente o motivo da recusa pedagógica.
    2. Orienta o estudante a escolher um conteúdo educacional válido.
    3. Retorna uma questão de conhecimentos gerais com alternativas válidas, garantindo
       que o fluxo de navegação do frontend/mobile continue funcionando sem erros.
    """
    tema_aviso = f" '{tema}'" if tema else ""
    aviso_detalhado = (
        f"[Tema não permitido pelo EduAcess]\n"
        f"A solicitação para o assunto{tema_aviso} não pôde ser processada.\n\n"
        f"Motivo: {motivo}\n\n"
        f"Para continuar utilizando o gerador de exercícios, informe um tema curricular (ex: História do Brasil, Funções Matemáticas, Genética).\n\n"
        f"Enquanto você reformula seu tema, responda a esta questão de revisão geral:"
    )

    questoes_reserva = [
        {
            "pergunta": "Qual é a capital do Brasil?",
            "alternativas": [
                {"letra": "A", "texto": "Rio de Janeiro"},
                {"letra": "B", "texto": "São Paulo"},
                {"letra": "C", "texto": "Brasília"},
                {"letra": "D", "texto": "Salvador"},
                {"letra": "E", "texto": "Belo Horizonte"}
            ],
            "alternativa_correta": "C"
        },
        {
            "pergunta": "Qual planeta do Sistema Solar é conhecido como o 'Planeta Vermelho'?",
            "alternativas": [
                {"letra": "A", "texto": "Vênus"},
                {"letra": "B", "texto": "Marte"},
                {"letra": "C", "texto": "Júpiter"},
                {"letra": "D", "texto": "Saturno"},
                {"letra": "E", "texto": "Mercúrio"}
            ],
            "alternativa_correta": "B"
        },
        {
            "pergunta": "Qual é o gás predominante que os seres humanos absorvem na respiração para manter o metabolismo celular?",
            "alternativas": [
                {"letra": "A", "texto": "Gás Carbônico (CO2)"},
                {"letra": "B", "texto": "Metano (CH4)"},
                {"letra": "C", "texto": "Oxigênio (O2)"},
                {"letra": "D", "texto": "Hélio (He)"},
                {"letra": "E", "texto": "Monóxido de Carbono (CO)"}
            ],
            "alternativa_correta": "C"
        }
    ]

    resultado = []
    for i in range(quantidade):
        reserva = questoes_reserva[i % len(questoes_reserva)]
        resultado.append({
            "identificador_externo": f"fallback_indevido_{random.randint(10000, 99999)}_{i}",
            "origem": "recusa_mensagem_indevida",
            "motivo_recusa": motivo,
            "enunciado": f"{aviso_detalhado}\n\n{reserva['pergunta']}",
            "alternativas": reserva["alternativas"],
            "alternativa_correta": reserva["alternativa_correta"]
        })

    return resultado


def _gerar_fallback(quantidade: int, motivo_tecnico: str = None):
    """
    Plano B de segurança acionado exclusivamente em caso de indisponibilidade técnica real
    (timeout, queda de rede ou erro interno da Groq).
    """
    detalhe = motivo_tecnico if motivo_tecnico else "O serviço de Inteligência Artificial está temporariamente instável ou inacessível."
    aviso_tecnico = (
        f"[Aviso de Conexão com a IA]\n"
        f"{detalhe}\n\n"
        f"Para que você não perca seu ritmo de estudo, disponibilizamos a questão reserva abaixo:"
    )

    return [
        {
            "identificador_externo": f"fallback_tecnico_{random.randint(1000, 9999)}",
            "origem": "banco_reserva_tecnico",
            "enunciado": f"{aviso_tecnico}\n\nQual é a capital do Brasil?",
            "alternativas": [
                {"letra": "A", "texto": "Rio de Janeiro"},
                {"letra": "B", "texto": "São Paulo"},
                {"letra": "C", "texto": "Brasília"},
                {"letra": "D", "texto": "Salvador"},
                {"letra": "E", "texto": "Belo Horizonte"}
            ],
            "alternativa_correta": "C"
        }
    ] * quantidade


def gerar_flashcards_ia(tema: str, dificuldade: str, quantidade: int):
    """
    Gera flashcards via Groq IA.
    Inclui validação contra mensagens indevidas, logs de depuração e extração robusta do JSON.
    """
    tema_real = (tema or "").strip()
    if not tema_real:
        tema_real = "Conhecimentos Gerais"

    # Validação prévia de tema indevido
    valido, motivo = validar_entrada_ia(tema_real)
    if not valido:
        print(f"[Groq/Flashcards] Mensagem indevida detectada para o tema '{tema_real}': {motivo}")
        return [
            {
                "pergunta": "Solicitacao Recusada pelo EduAcess",
                "resposta": f"Motivo: {motivo} Por favor, digite um assunto de estudo legitimo (ex: Revolucao Francesa, Fotossintese, Trigonometria)."
            }
        ]

    key = _obter_api_key()
    if not key:
        print("[Groq/Flashcards] ERRO: GROQ_API_KEY não encontrada no arquivo .env")
        return [
            {
                "pergunta": "Serviço Temporariamente Indisponível",
                "resposta": "A chave da API de Inteligência Artificial não foi encontrada no servidor."
            }
        ]

    prompt = f"""Crie EXATAMENTE {quantidade} flashcards sobre: "{tema_real}" (Dificuldade: {dificuldade}).
Retorne APENAS o array JSON, sem texto antes ou depois.

Estrutura:
[
  {{"pergunta": "O que é...", "resposta": "Significa..."}}
]"""

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {
        "model": MODELO_PRINCIPAL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": max(800, quantidade * 200)
    }

    try:
        print(f"[Groq/Flashcards] Enviando requisição - tema='{tema_real}', qtd={quantidade}")
        response = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT_GROQ)

        print(f"[Groq/Flashcards] STATUS: {response.status_code}")

        if response.status_code == 200:
            texto = response.json()['choices'][0]['message']['content'].strip()

            flashcards = _extrair_json_do_texto(texto)

            if flashcards is not None and isinstance(flashcards, list) and len(flashcards) > 0:
                print(f"[Groq/Flashcards] [OK] {len(flashcards)} flashcard(s) gerado(s).")
                return flashcards[:quantidade]
            else:
                print(f"[Groq/Flashcards] [ERRO] Falha no parse. Texto bruto:\n{texto}")
                return [
                    {
                        "pergunta": "Falha na Formatação da IA",
                        "resposta": "A resposta da IA não pôde ser convertida em cartões de estudo. Tente novamente."
                    }
                ]
        else:
            print(f"[Groq/Flashcards] [ERRO] HTTP {response.status_code}: {response.text}")
            return [
                {
                    "pergunta": "Erro no Servidor de IA",
                    "resposta": f"A API da Groq retornou o código de erro HTTP {response.status_code}."
                }
            ]

    except requests.exceptions.Timeout:
        print(f"[Groq/Flashcards] [TIMEOUT] Timeout após {TIMEOUT_GROQ}s.")
        return [
            {
                "pergunta": "Tempo Limite Esgotado",
                "resposta": "A requisição para gerar flashcards demorou mais do que o esperado. Tente novamente em instantes."
            }
        ]
    except Exception as e:
        print(f"[Groq/Flashcards] [ERRO] Exceção inesperada: {e}")
        return [
            {
                "pergunta": "Erro Inesperado",
                "resposta": f"Ocorreu uma falha ao comunicar com a IA: {str(e)}"
            }
        ]
