import re
from typing import Optional

REGEX_LETRAS = re.compile(r'[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]')

def validar_texto_obrigatorio(
    valor: str, 
    nome_campo: str = "campo", 
    min_tamanho: int = 2, 
    max_tamanho: int = 150,
    min_letras: int = 2
) -> str:
    """
    Valida campos de texto obrigatórios (nomes, títulos, perguntas):
    - Não vazio
    - Mínimo e máximo de caracteres
    - Não composto apenas por números (ex: '12345')
    - Não composto apenas por símbolos ou pontuação (ex: '???', '---', '@#$%')
    - Deve conter pelo menos `min_letras` letras alfabéticas legíveis
    """
    if valor is None:
        raise ValueError(f"O {nome_campo} é obrigatório.")

    if not isinstance(valor, str):
        valor = str(valor)

    texto = valor.strip()
    if len(texto) < min_tamanho:
        raise ValueError(f"O {nome_campo} deve ter pelo menos {min_tamanho} caracteres.")

    if len(texto) > max_tamanho:
        raise ValueError(f"O {nome_campo} não pode ter mais de {max_tamanho} caracteres.")

    # Apenas dígitos
    if texto.isdigit():
        raise ValueError(f"O {nome_campo} não pode ser composto apenas por números. Digite um nome que contenha letras.")

    # Apenas números com pontuação ou espaços (ex: "123.456-78") sem letras
    letras = REGEX_LETRAS.findall(texto)
    if not letras:
        raise ValueError(f"O {nome_campo} não pode ser composto apenas por números ou símbolos. Digite um nome que contenha letras.")

    if len(letras) < min_letras:
        raise ValueError(f"O {nome_campo} deve conter pelo menos {min_letras} letras legíveis.")

    return texto

def validar_texto_opcional(
    valor: Optional[str], 
    nome_campo: str = "descrição", 
    max_tamanho: int = 500
) -> Optional[str]:
    """
    Valida textos opcionais:
    - Se None ou vazio, retorna None.
    - Se preenchido, não pode conter apenas pontuação/símbolos ou exceder o limite.
    """
    if valor is None or not str(valor).strip():
        return None

    texto = str(valor).strip()
    if len(texto) > max_tamanho:
        raise ValueError(f"A {nome_campo} não pode ter mais de {max_tamanho} caracteres.")

    # Se preenchido, precisa conter pelo menos alguma letra ou número
    if not re.search(r'[a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]', texto):
        raise ValueError(f"A {nome_campo} não pode conter apenas símbolos ou pontuação.")

    return texto

