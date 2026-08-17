import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from app.core.database import get_db
from app.models.trilha import TrilhaModulo, TrilhaQuestao, ProgressoTrilha
from app.schemas.trilha import (
    TrilhaModuloResponse,
    TrilhaQuestaoResponse,
    IAGerarRequest,
    ProgressoTrilhaResponse
)
from app.api.rotas_auth import obter_usuario_logado
from app.services.ia_service import ia_service

router = APIRouter()

# ==========================================
# ROTAS DA TRILHA (FIXA/BANCO DE DADOS)
# ==========================================

@router.get("/{disciplina_id}/modulos", response_model=List[TrilhaModuloResponse])
def listar_modulos(disciplina_id: int, db: Session = Depends(get_db)):
    """Retorna os módulos de uma trilha."""
    modulos = db.query(TrilhaModulo).filter(TrilhaModulo.disciplina_id == disciplina_id).order_by(TrilhaModulo.ordem).all()
    return modulos

@router.get("/modulo/{modulo_id}/questoes")
def listar_questoes_modulo(modulo_id: int, db: Session = Depends(get_db)):
    """Retorna as questões de um módulo específico da trilha."""
    questoes = db.query(TrilhaQuestao).filter(TrilhaQuestao.modulo_id == modulo_id).all()
    if not questoes:
        raise HTTPException(status_code=404, detail="Módulo não encontrado ou sem questões.")
    
    # Parser manual por causa do String -> JSON
    resultado = []
    for q in questoes:
        resultado.append({
            "id": q.id,
            "modulo_id": q.modulo_id,
            "enunciado": q.enunciado,
            "alternativas": json.loads(q.alternativas),
            "alternativa_correta": q.alternativa_correta,
            "explicacao_ia": q.explicacao_ia
        })
    return resultado

@router.get("/progresso/{disciplina_id}", response_model=List[ProgressoTrilhaResponse])
def obter_progresso_trilha(
    disciplina_id: int, 
    db: Session = Depends(get_db), 
    usuario=Depends(obter_usuario_logado)
):
    """Retorna o progresso do usuário logado nos módulos de uma disciplina."""
    modulos_ids = [m.id for m in db.query(TrilhaModulo).filter(TrilhaModulo.disciplina_id == disciplina_id).all()]
    
    progresso = db.query(ProgressoTrilha).filter(
        ProgressoTrilha.usuario_id == usuario.id,
        ProgressoTrilha.modulo_id.in_(modulos_ids)
    ).all()
    
    return progresso

# Rota Administrativa para popular o banco com a IA (Opção de Endpoint em vez de Script isolado)
@router.post("/admin/gerar-modulo/{modulo_id}")
def admin_popular_modulo(modulo_id: int, tema: str, quantidade: int = 10, nivel: str = "Médio", db: Session = Depends(get_db)):
    """Rota utilitária para chamar o Gemini, criar questões e salvar no banco amarrado a um Módulo."""
    modulo = db.query(TrilhaModulo).filter(TrilhaModulo.id == modulo_id).first()
    if not modulo:
        raise HTTPException(status_code=404, detail="Módulo não encontrado")
    
    questoes_geradas = ia_service.gerar_questoes(tema, quantidade, nivel)
    
    novas_questoes = []
    for q_data in questoes_geradas:
        nova_questao = TrilhaQuestao(
            modulo_id=modulo_id,
            enunciado=q_data['enunciado'],
            alternativas=json.dumps(q_data['alternativas']),
            alternativa_correta=q_data['alternativa_correta'],
            explicacao_ia=q_data.get('explicacao_ia')
        )
        db.add(nova_questao)
        novas_questoes.append(nova_questao)
    
    db.commit()
    return {"mensagem": f"{len(novas_questoes)} questões criadas com sucesso para o módulo {modulo.nome}."}

# ==========================================
# ROTA DE IA (GERAÇÃO EM TEMPO REAL)
# ==========================================

@router.post("/ia/gerar", response_model=List[Dict])
def gerar_questoes_ia(request: IAGerarRequest, usuario=Depends(obter_usuario_logado)):
    """
    Gera questões em tempo real para o botão 'Vestibular & IA'.
    Elas NÃO são salvas no banco de dados.
    """
    questoes_geradas = ia_service.gerar_questoes(request.tema, request.quantidade, request.nivel)
    return questoes_geradas
