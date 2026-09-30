import os
import json
import google.generativeai as genai
from typing import List, Dict

class IAService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-3.5-flash')
        else:
            self.model = None

    def gerar_questoes(self, tema: str, quantidade: int = 5, nivel: str = "Médio") -> List[Dict]:
        """
        Gera questões inéditas usando a IA baseada no tema fornecido.
        Retorna uma lista de dicionários no formato esperado.
        """
        if not self.model:
            raise Exception("API Key do Gemini não configurada no servidor.")

        prompt = f"""
Você é um professor especializado em criar questões objetivas para estudantes de Ensino Médio.
Gere {quantidade} questões sobre o tema "{tema}" com nível de dificuldade {nivel}.
As questões devem ser diretas, com texto curto (máximo 3 linhas de enunciado), pois serão lidas em um celular em movimento (ex: no ônibus).

Retorne EXATAMENTE e APENAS um JSON no formato de lista de objetos, sem marcações markdown como ```json, e sem nenhum texto antes ou depois:
[
  {{
    "enunciado": "Qual é o valor de x na equação 2x = 10?",
    "alternativas": ["2", "4", "5", "10", "20"],
    "alternativa_correta": 2,
    "explicacao_ia": "Dividindo ambos os lados por 2, temos x = 10 / 2 = 5."
  }}
]
"""
        response = self.model.generate_content(prompt)
        text = response.text.strip()
        
        # Limpar possiveis crases do markdown que o Gemini as vezes coloca mesmo pedindo pra não colocar
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        
        text = text.strip()

        try:
            questoes = json.loads(text)
            return questoes
        except Exception as e:
            raise Exception(f"Falha ao interpretar resposta da IA como JSON: {str(e)} \n\nResposta recebida: {text}")

ia_service = IAService()
