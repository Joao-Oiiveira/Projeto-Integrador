
from app.core.database import engine, Base, SessionLocal
from app.models.conquista import Conquista
# Garante que o modelo conquista e outros existam
import app.models.conquista
import app.models.usuario

# Cria as tabelas
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Cria as conquistas base
conquistas_base = [
    {'titulo': 'Pioneiro', 'descricao': 'Concluiu a 1ª tarefa.', 'icone': 'menu_book', 'cor_icone': '0xFF1976D2', 'cor_fundo': '0xFFE3F2FD', 'meta_objetivo': 1, 'tipo_objetivo': 'tarefa_1'},
    {'titulo': 'Estudioso', 'descricao': 'Concluiu 10 tarefas.', 'icone': 'emoji_events', 'cor_icone': '0xFFFFB300', 'cor_fundo': '0xFFFFF8E1', 'meta_objetivo': 10, 'tipo_objetivo': 'tarefa_10'},
    {'titulo': 'Mestre das Exatas', 'descricao': 'Acertou 10 questões de Matemática.', 'icone': 'calculate', 'cor_icone': '0xFF388E3C', 'cor_fundo': '0xFFE8F5E9', 'meta_objetivo': 10, 'tipo_objetivo': 'matematica_10'},
    {'titulo': 'Fera da Gramática', 'descricao': 'Acertou 10 questões de Português.', 'icone': 'edit_note', 'cor_icone': '0xFF7B1FA2', 'cor_fundo': '0xFFF3E5F5', 'meta_objetivo': 10, 'tipo_objetivo': 'portugues_10'},
    {'titulo': 'Madrugador', 'descricao': 'Concluiu 1 tarefa antes das 08:00 da manhã.', 'icone': 'wb_sunny_outlined', 'cor_icone': '0xFFF57C00', 'cor_fundo': '0xFFFFF3E0', 'meta_objetivo': 1, 'tipo_objetivo': 'tarefa_madrugador'}
]

for item in conquistas_base:
    existe = db.query(Conquista).filter(Conquista.tipo_objetivo == item['tipo_objetivo']).first()
    if not existe:
        db.add(Conquista(**item))

db.commit()
print('Conquistas criadas/atualizadas com sucesso no MySQL!')
db.close()
