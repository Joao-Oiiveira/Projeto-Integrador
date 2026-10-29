import sys
from pydantic import ValidationError
from app.schemas.disciplina import DisciplinaCreate
from app.schemas.flashcard import BaralhoCreate, FlashcardCreate
from app.schemas.tarefa import TarefaCreate
from app.schemas.evento import EventoCreate
from datetime import datetime

print("=== TESTANDO VALIDAÇÕES DOS SCHEMAS PYDANTIC ===")

# 1. Casos que DEVEM passar
try:
    d = DisciplinaCreate(nome="Matemática Aplicada", descricao="Cálculo e álgebra")
    assert d.nome == "Matemática Aplicada"

    d2 = DisciplinaCreate(nome="Física 1")
    assert d2.nome == "Física 1"

    b = BaralhoCreate(nome="Fórmulas de Trigonometria", disciplina_id=1)
    assert b.nome == "Fórmulas de Trigonometria"

    f = FlashcardCreate(baralho_id=1, pergunta="O que é o Teorema de Pitágoras?", resposta="a² + b² = c²")
    assert f.pergunta.startswith("O que é")

    t = TarefaCreate(titulo="Entregar lista 02", disciplina_id=1)
    assert t.titulo == "Entregar lista 02"

    e = EventoCreate(titulo="Prova Bimestral", data_inicio=datetime.now())
    assert e.titulo == "Prova Bimestral"

    print("[OK] Todos os casos válidos foram aceitos com sucesso.")
except Exception as ex:
    print(f"[FALHA] Caso válido falhou: {ex}")
    sys.exit(1)

# 2. Casos que DEVEM falhar (apenas números ou símbolos)
casos_invalidos = [
    (DisciplinaCreate, {"nome": "12345"}, "apenas números"),
    (DisciplinaCreate, {"nome": "??????"}, "apenas símbolos"),
    (DisciplinaCreate, {"nome": "---"}, "apenas símbolos"),
    (DisciplinaCreate, {"nome": "a"}, "muito curto"),
    (BaralhoCreate, {"nome": "99999999"}, "apenas números"),
    (BaralhoCreate, {"nome": "!@#$%^"}, "apenas símbolos"),
    (TarefaCreate, {"titulo": "123456"}, "apenas números"),
    (TarefaCreate, {"titulo": "---"}, "apenas símbolos"),
    (EventoCreate, {"titulo": "12345", "data_inicio": datetime.now()}, "apenas números"),
    (EventoCreate, {"titulo": "***", "data_inicio": datetime.now()}, "apenas símbolos"),
]

erros = 0
for schema_cls, dados, motivo_esperado in casos_invalidos:
    try:
        schema_cls(**dados)
        print(f"[ERRO - Deveria ter falhado]: {schema_cls.__name__} com dados {dados}")
        erros += 1
    except ValidationError as ve:
        msg = str(ve)
        print(f"[OK RECUSADO]: {schema_cls.__name__} -> {ve.errors()[0]['msg']}")
    except Exception as ex:
        print(f"[OK RECUSADO OUTRO]: {ex}")

if erros > 0:
    print(f"\nTotal de falhas: {erros}")
    sys.exit(1)

print("\nTODOS OS TESTES DE VALIDAÇÃO DOS SCHEMAS PASSARAM COM SUCESSO!")

