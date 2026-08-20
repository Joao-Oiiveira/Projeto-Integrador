from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.disciplina import Disciplina
from app.models.trilha import TrilhaResposta
from app.api.rotas_auth import obter_usuario_logado

router = APIRouter()

@router.get("/")
def obter_estatisticas(db: Session = Depends(get_db), usuario=Depends(obter_usuario_logado)):
    # Total de disciplinas ativas globais ou do usuario
    disciplinas_ativas = db.query(Disciplina).filter(
        (Disciplina.usuario_id == usuario.id) | (Disciplina.usuario_id == None),
        Disciplina.ativo == True
    ).count()
    
    # Respostas totais na trilha
    respostas = db.query(TrilhaResposta).filter(TrilhaResposta.usuario_id == usuario.id).all()
    total_exercicios = len(respostas)
    acertos = sum(1 for r in respostas if r.acertou)
    
    if total_exercicios > 0:
        taxa_acerto = int((acertos / total_exercicios) * 100)
    else:
        taxa_acerto = 0
        
    progresso_disciplinas = []
    if total_exercicios > 0:
        progresso_disciplinas = [
            {"nome": "Matematica", "taxa_acerto": taxa_acerto, "cor": "#FF0000"}
        ]
        
    return {
        "disciplinas_ativas": disciplinas_ativas,
        "total_exercicios_resolvidos": total_exercicios,
        "taxa_acerto": taxa_acerto,
        "progresso_disciplinas": progresso_disciplinas
    }
