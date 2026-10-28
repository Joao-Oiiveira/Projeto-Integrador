"""
Serviço de Validação de Entradas para a Inteligência Artificial do EduAcess.

Objetivo:
- Garantir que as solicitações enviadas à IA estejam em conformidade com a finalidade educacional.
- Proteger contra prompt injections, conteúdos prejudiciais, termos ofensivos e abusos.
- Preservar termos legítimos de biologia, história, química, saúde e outras disciplinas curriculares.
"""

import re
import unicodedata
from typing import Tuple, Optional

def normalizar_texto(texto: str) -> str:
    """Remove acentos, caracteres extras e converte para minúsculas."""
    if not texto:
        return ""
    nfkd = unicodedata.normalize('NFKD', texto.lower())
    sem_acento = "".join([c for c in nfkd if not unicodedata.combining(c)])
    return sem_acento.strip()

# ==========================================
# PALAVRAS / EXPRESSÕES DE SALVAGUARDA (WHITELIST EDUCACIONAL)
# ==========================================
# Se a entrada contiver estes termos no contexto pedagógico, não deve ser bloqueada.
SALVAGUARDAS_EDUCACIONAIS = [
    "reproducao humana",
    "sistema reprodutor",
    "aparelho reprodutor",
    "fecundacao",
    "orgaos genitais",
    "orgao genital",
    "sexualidade e saude",
    "educacao sexual",
    "doencas sexualmente transmissiveis",
    "ist",
    "dst",
    "embriologia",
    "genetica",
    "anatomia humana",
    "puberdade",
    "menstruacao",
    "ciclo menstrual",
    "mitose e meiose",
    "bomba de sodio e potassio",
    "bomba de hidrogenio na fisica",
    "bomba atomica na segunda guerra",
    "bomba atomica de hiroshima",
    "revolucao francesa",
    "primeira guerra mundial",
    "segunda guerra mundial",
    "guerra fria",
    "guerra do contestado",
    "guerra de canudos",
    "ditadura militar",
    "holocausto",
    "seguranca da informacao",
    "criptografia"
]

# ==========================================
# REGRAS DE INJEÇÃO DE PROMPT / JAILBREAK
# ==========================================
PADROES_PROMPT_INJECTION = [
    r"\bignore (as|todas as|quaisquer)?\s*(instrucoes|regras|diretrizes)\b",
    r"\besqueca (as|todas as)?\s*(instrucoes|regras)\b",
    r"\bdesconsidere (as|todas as)?\s*(instrucoes|regras)\b",
    r"\bignore previous instructions\b",
    r"\bdisregard previous\b",
    r"\bsystem prompt\b",
    r"\bprompt de sistema\b",
    r"\brevele (o|seu) prompt\b",
    r"\bmostre (o|seu) prompt\b",
    r"\bdan mode\b",
    r"\bjailbreak\b",
    r"\bmodo desenvolvedor\b",
    r"\bdeveloper mode\b",
    r"\bfinja que voce nao tem regras\b",
    r"\bvoce agora e um (hacker|criminoso|pirata)\b",
    r"\baja como se nao houvesse restricoes\b",
    r"\bnow you are\b"
]

# ==========================================
# REGRAS DE ATIVIDADES PERIGOSAS / ILEGAIS / CIBERCRIME
# ==========================================
PADROES_ATIVIDADES_PERIGOSAS = [
    # Fabricação de armas, bombas e venenos
    r"\bcomo (fazer|fabricar|construir|montar|produzir)\s+(uma?\s+)?(bomba|explosivo|veneno|arma de fogo|coquetel molotov)\b",
    r"\bcomo (comprar|adquirir|conseguir)\s+(armas?|explosivos?|venenos?)\s+ilega(l|is)\b",
    r"\breceita de (bomba|explosivo|veneno)\b",
    # Drogas ilícitas
    r"\bcomo (produzir|fabricar|sintetizar|refinar|preparar)\s+(.*?\b)?(cocaina|metanfetamina|crack|lsd|heroina|drogas?)\b",
    r"\b(fabricacao|producao|sintese)\s+de\s+(drogas?|entorpecentes|cocaina|metanfetamina)\b",
    r"\bcomo (comprar|traficar|vender)\s+(drogas?|entorpecentes|cocaina|metanfetamina)\b",
    # Cibercrime e invasão
    r"\bcomo (hackear|invadir|burlar|clonar)\s+(o\s+|a\s+|um\s+|uma\s+)?(whatsapp|instagram|facebook|site|sistema|computador|servidor|wifi|rede|cartao|banco)\b",
    r"\bcomo (roubar|descobrir|capturar)\s+(senhas?|dados|cartao de credito)\b",
    r"\btutorial de invasao de\b",
    r"\bscript para ddos\b",
    r"\bcomo criar (um\s+)?(virus|trojan|malware|ransomware|keylogger)\b",
    # Automutilação e suicídio
    r"\bcomo (se matar|cometer suicidio|cortar os pulsos|se enforcar)\b",
    r"\bmetodos de suicidio\b",
    r"\bcomo incentivar suicidio\b"
]

# ==========================================
# CONTEÚDO ADULTO / SEXUAL EXPLÍCITO VULGAR
# ==========================================
PADROES_CONTEUDO_ADULTO = [
    r"\b(porno|pornografia|hentai|putaria|xvideos|redtube|onlyfans)\b",
    r"\b(sexo oral|sexo anal|boquete|anal|suruba|bacanal|orgia)\b",
    r"\b(buceta|xoxota|caralho|pau grande|rola grande|gozada|gozar na)\b",
    r"\b(pedofilia|conteudo infantil explicito)\b"
]

# ==========================================
# OFENSAS, DISCURSO DE ÓDIO E LINGUAGEM DEPRECIATIVA
# ==========================================
PADROES_OFENSAS = [
    r"\b(filho da puta|arrombado|seu merda|vai se foder|vai tomar no cu|puta que pariu)\b",
    r"\b(desgracado|seu lixo|nazista de merda)\b",
    r"\b(macaco|preto imundo)\b", # Discurso racista explícito
    r"\b(viado de merda|traveco imundo)\b" # Discurso homofóbico explícito
]

def validar_entrada_ia(tema: str) -> Tuple[bool, Optional[str]]:
    """
    Valida se a entrada fornecida pelo usuário é compatível com os objetivos educacionais do EduAcess.
    
    Retorno:
        (True, None) se a entrada for válida.
        (False, mensagem_explicativa) se for inválida.
    """
    if tema is None:
        return False, "O tema para a IA não pode ser nulo. Por favor, informe um assunto de estudo."

    texto_bruto = tema.strip()
    
    # 1. Validação de tamanho mínimo
    if len(texto_bruto) < 2:
        return False, "O tema informado é muito curto. Por favor, digite um assunto de estudo com pelo menos 2 caracteres."

    # 2. Validação de tamanho máximo razoável para temas
    if len(texto_bruto) > 250:
        return False, "O tema informado é muito longo (máximo de 250 caracteres). Por favor, forneça um título ou assunto mais conciso."

    # Normalização para as verificações regex
    texto_norm = normalizar_texto(texto_bruto)

    # 3. Verificação de Repetição / Spam / Texto sem sentido (Gibberish)
    # Ex: aaaaaaaa, ????????, .....
    if re.search(r'(.)\1{5,}', texto_norm):
        return False, "A solicitação contém repetições excessivas ou caracteres sem sentido. Por favor, informe um tema educacional válido."

    # Verifica se não há pelo menos um caractere alfanumérico
    if not re.search(r'[a-z0-9]', texto_norm):
        return False, "O tema precisa conter palavras ou números válidos para estudo."

    # Verifica se o texto é apenas uma sequência de consoantes sem sentido (ex: "sdfghjkl")
    palavras = texto_norm.split()
    todas_sem_vogais = True
    for p in palavras:
        if len(p) >= 4 and re.search(r'[aeiouy]', p):
            todas_sem_vogais = False
            break
        elif len(p) < 4:
            todas_sem_vogais = False
            break
    if todas_sem_vogais and len(texto_norm) >= 5:
        return False, "O tema fornecido não parece ser uma palavra ou disciplina compreensível. Por favor, verifique o que digitou."

    # 4. Checagem de Salvaguardas Educacionais (Whitelist rápida)
    # Se bater exatamente ou contiver um tema curricular sabidamente sensível, aprovamos antecipadamente
    for salvaguarda in SALVAGUARDAS_EDUCACIONAIS:
        if salvaguarda in texto_norm:
            # Mesmo em salvaguardas, verificamos se não há injeção de prompt associada
            for padrao in PADROES_PROMPT_INJECTION:
                if re.search(padrao, texto_norm):
                    return False, (
                        "A solicitação contém comandos de sistema ou instruções não permitidas. "
                        "O assistente de IA do EduAcess é dedicado exclusivamente a fins educacionais."
                    )
            return True, None

    # 5. Validação contra Injeção de Prompt (Prompt Injection / Jailbreak)
    for padrao in PADROES_PROMPT_INJECTION:
        if re.search(padrao, texto_norm):
            return False, (
                "A solicitação contém instruções de comando que não são permitidas. "
                "O assistente de IA do EduAcess foi projetado exclusivamente para apoiar seus estudos e tirar dúvidas acadêmicas."
            )

    # 6. Validação contra Atividades Perigosas, Crimes ou Danos
    for padrao in PADROES_ATIVIDADES_PERIGOSAS:
        if re.search(padrao, texto_norm):
            return False, (
                "Não é possível processar esta solicitação pois ela envolve atividades perigosas, ilegais ou nocivas. "
                "O EduAcess destina-se apenas a conteúdos de aprendizagem e disciplinas curriculares."
            )

    # 7. Validação contra Conteúdo Sexual Explícito e Adulto
    for padrao in PADROES_CONTEUDO_ADULTO:
        if re.search(padrao, texto_norm):
            return False, (
                "A solicitação contém termos de conteúdo adulto ou sexual explícito incompatíveis com a finalidade pedagógica. "
                "Por favor, pesquise apenas temas acadêmicos (ex: Biologia, História, Matemática)."
            )

    # 8. Validação contra Linguagem Ofensiva e Discurso de Ódio
    for padrao in PADROES_OFENSAS:
        if re.search(padrao, texto_norm):
            return False, (
                "A solicitação contém palavras ofensivas ou inadequadas. "
                "O EduAcess promove um ambiente de aprendizado respeitoso e acolhedor para todos."
            )

    # Entrada aprovada
    return True, None
