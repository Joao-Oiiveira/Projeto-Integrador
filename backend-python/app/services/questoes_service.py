import os
import json
import requests
import random
import re
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

# Modelo principal — robusto para JSON estruturado
MODELO_PRINCIPAL = "qwen/qwen3.8-27b"

# Timeout generoso para evitar falhas por demora da IA
TIMEOUT_GROQ = 40


def gerar_questoes_ia(tema: str, dificuldade: str, quantidade: int):
    """
    Função principal chamada pela rota. Prepara os dados e chama a Groq.
    """
    tema_real = tema if tema else "Conhecimentos Gerais"
    dificuldade_real = dificuldade if dificuldade else "médio"
    return _gerar_questoes_com_groq(tema_real, dificuldade_real, quantidade)


def _extrair_json_do_texto(texto: str):
    """
    Tenta extrair um array JSON do texto bruto retornado pela IA.
    Aplica múltiplas estratégias de limpeza para máxima robustez.
    """
    # Estratégia 1: regex para [...] com conteúdo interno
    match = re.search(r'\[.*?\]', texto, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # Estratégia 2: procura o primeiro '[' e o último ']' do texto
    inicio = texto.find('[')
    fim = texto.rfind(']')
    if inicio != -1 and fim != -1 and fim > inicio:
        trecho = texto[inicio:fim + 1]
        try:
            return json.loads(trecho)
        except json.JSONDecodeError:
            pass

    # Estratégia 3: remove blocos de markdown (```json ... ```) e tenta de novo
    texto_limpo = re.sub(r'```(?:json)?', '', texto).strip()
    inicio = texto_limpo.find('[')
    fim = texto_limpo.rfind(']')
    if inicio != -1 and fim != -1 and fim > inicio:
        trecho = texto_limpo[inicio:fim + 1]
        try:
            return json.loads(trecho)
        except json.JSONDecodeError:
            pass

    return None


def _gerar_questoes_com_groq(tema: str, dificuldade: str, quantidade: int):
    """
    Comunicação com a Groq API para gerar questões de múltipla escolha.
    Modelo: llama-3.1-8b-instant (mais rápido e confiável para JSON estruturado).
    """
    if not api_key:
        print("ERRO: GROQ_API_KEY não encontrada no arquivo .env")
        return _gerar_fallback(quantidade)

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
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODELO_PRINCIPAL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }

    try:
        print(f"[Groq] Enviando requisição — tema='{tema}', qtd={quantidade}, modelo={MODELO_PRINCIPAL}")
        response = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT_GROQ)

        # LOG DE DEBUG OBRIGATÓRIO
        print(f"[Groq] STATUS: {response.status_code}")

        if response.status_code == 200:
            dados = response.json()
            texto_resposta = dados['choices'][0]['message']['content'].strip()

            questoes = _extrair_json_do_texto(texto_resposta)

            if questoes is not None and isinstance(questoes, list) and len(questoes) > 0:
                # Adiciona IDs únicos a cada questão
                for i, q in enumerate(questoes):
                    q["identificador_externo"] = f"groq_{random.randint(10000, 99999)}_{i}"
                print(f"[Groq] ✅ {len(questoes)} questão(ões) gerada(s) com sucesso.")
                return questoes[:quantidade]
            else:
                print(f"[Groq] ❌ Falha no parse do JSON. Texto bruto recebido:\n{texto_resposta}")
                return _gerar_fallback(quantidade)
        else:
            print(f"[Groq] ❌ Erro HTTP {response.status_code}: {response.text}")
            return _gerar_fallback(quantidade)

    except requests.exceptions.Timeout:
        print(f"[Groq] ⏱️ Timeout após {TIMEOUT_GROQ}s. API da Groq demorou demais.")
        return _gerar_fallback(quantidade)
    except Exception as e:
        print(f"[Groq] ❌ Exceção inesperada: {e}")
        return _gerar_fallback(quantidade)


def _gerar_fallback(quantidade: int):
    """
    Plano B de segurança caso a API da Groq falhe.
    """
    return [
        {
            "identificador_externo": f"fallback_{random.randint(1000, 9999)}",
            "origem": "banco_reserva",
            "enunciado": "A Inteligência Artificial está temporariamente indisponível. Qual é a capital do Brasil?",
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
    Inclui logs de debug e extração robusta do JSON.
    """
    if not api_key:
        print("ERRO: GROQ_API_KEY não encontrada no arquivo .env")
        return []

    prompt = f"""Crie EXATAMENTE {quantidade} flashcards sobre: "{tema}" (Dificuldade: {dificuldade}).
Retorne APENAS o array JSON, sem texto antes ou depois.

Estrutura:
[
  {{"pergunta": "O que é...", "resposta": "Significa..."}}
]"""

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": MODELO_PRINCIPAL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3
    }

    try:
        print(f"[Groq/Flashcards] Enviando requisição — tema='{tema}', qtd={quantidade}")
        response = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT_GROQ)

        # LOG DE DEBUG OBRIGATÓRIO
        print(f"[Groq/Flashcards] STATUS: {response.status_code}")

        if response.status_code == 200:
            texto = response.json()['choices'][0]['message']['content'].strip()

            flashcards = _extrair_json_do_texto(texto)

            if flashcards is not None and isinstance(flashcards, list) and len(flashcards) > 0:
                print(f"[Groq/Flashcards] ✅ {len(flashcards)} flashcard(s) gerado(s).")
                return flashcards[:quantidade]
            else:
                print(f"[Groq/Flashcards] ❌ Falha no parse. Texto bruto:\n{texto}")
                return []
        else:
            print(f"[Groq/Flashcards] ❌ Erro HTTP {response.status_code}: {response.text}")
            return []

    except requests.exceptions.Timeout:
        print(f"[Groq/Flashcards] ⏱️ Timeout após {TIMEOUT_GROQ}s.")
        return []
    except Exception as e:
        print(f"[Groq/Flashcards] ❌ Exceção inesperada: {e}")
        return []