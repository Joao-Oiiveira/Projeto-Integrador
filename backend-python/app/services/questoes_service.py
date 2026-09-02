import os
import json
import requests
import random
import re
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

def gerar_questoes_ia(tema: str, dificuldade: str, quantidade: int):
    """
    Função principal chamada pela rota. Prepara os dados e chama a Groq.
    """
    tema_real = tema if tema else "Conhecimentos Gerais"
    dificuldade_real = dificuldade if dificuldade else "médio"
    return _gerar_questoes_com_groq(tema_real, dificuldade_real, quantidade)

def _gerar_questoes_com_groq(tema: str, dificuldade: str, quantidade: int):
    """
    Comunicação direta com o Llama 3.3 de 70 Bilhões de parâmetros da Groq.
    """
    if not api_key:
        print("ERRO: GROQ_API_KEY não encontrada no arquivo .env")
        return _gerar_fallback(quantidade)

    prompt = f"""
    Você é um professor especialista, rigoroso e extremamente preciso.
    Gere EXATAMENTE {quantidade} questões de múltipla escolha sobre o tema: "{tema}".
    O nível de dificuldade das questões deve ser: {dificuldade.upper()}.
    
    REGRAS DE CONTEÚDO (MUITO IMPORTANTE):
    1. As questões devem ser 100% precisas historicamente, cientificamente e factualmente.
    2. Revise a "alternativa_correta" antes de gerar o JSON para garantir que ela é a única resposta verdadeira.
    
    REGRA DE FORMATO ABSOLUTA: Retorne APENAS um array JSON válido. Não escreva nenhuma introdução. APENAS O JSON.
    
    O JSON deve ter EXATAMENTE esta estrutura:
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
    ]
    """

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "openai/gpt-oss-120b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=20)
        
        if response.status_code == 200:
            dados = response.json()
            texto_resposta = dados['choices'][0]['message']['content'].strip()
            
            # Extrai apenas o JSON usando Expressão Regular
            match = re.search(r'\[.*\]', texto_resposta, re.DOTALL)
            
            if match:
                texto_json = match.group(0)
                questoes = json.loads(texto_json)
                
                # Adiciona IDs únicos
                for i, q in enumerate(questoes):
                    q["identificador_externo"] = f"groq_{random.randint(10000, 99999)}_{i}"
                    
                return questoes[:quantidade]
            else:
                print("Erro: A IA não retornou um array JSON válido.")
                return _gerar_fallback(quantidade)
        else:
            print(f"Erro da API Groq: {response.text}")
            return _gerar_fallback(quantidade)

    except Exception as e:
        print(f"Erro ao processar resposta da Groq: {e}")
        return _gerar_fallback(quantidade)

def _gerar_fallback(quantidade: int):
    """
    Plano B de segurança caso a API da Groq fique fora do ar.
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
    if not api_key:
        return []

    prompt = f"""
    Crie {quantidade} flashcards sobre o tema: "{tema}" (Dificuldade: {dificuldade}).
    Retorne APENAS um array JSON válido, sem introdução.
    Formato:
    [
      {{"pergunta": "O que é...", "resposta": "Significa..."}}
    ]
    """
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "openai/gpt-oss-120b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=20)
        if response.status_code == 200:
            import re
            texto = response.json()['choices'][0]['message']['content']
            match = re.search(r'\[.*\]', texto, re.DOTALL)
            if match:
                return json.loads(match.group(0))[:quantidade]
    except:
        pass
    return []