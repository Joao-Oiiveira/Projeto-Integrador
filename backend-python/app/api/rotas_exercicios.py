from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_usuario_atual
from app.models.usuario import Usuario
from app.models.exercicio import SessaoExercicio, RespostaQuestao
from app.schemas.exercicio import SessaoCreate, SessaoResponse, RespostaCreate
from app.services.questoes_service import gerar_questoes_ia

router = APIRouter()

# 1. Iniciar uma Sessão (Gera as questões via IA)
@router.post("/sessao", response_model=SessaoResponse)
def iniciar_sessao(dados: SessaoCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    
    # Salva a Sessão no Banco
    nova_sessao = SessaoExercicio(
        usuario_id=usuario.id,
        disciplina_id=dados.disciplina_id,
        tema=dados.tema,
        modo="ia", # Forçamos a ser sempre IA
        dificuldade=dados.modo, # O frontend vai mandar a dificuldade no campo 'modo' para não quebrar o schema antigo
        quantidade_questoes=dados.quantidade_questoes
    )
    db.add(nova_sessao)
    db.commit()
    db.refresh(nova_sessao)

    # Busca as Questões na Groq
    questoes = gerar_questoes_ia(dados.tema, dados.modo, dados.quantidade_questoes)

    return {
        "sessao_id": nova_sessao.id,
        "questoes": questoes
    }

# 2. Salvar a resposta
@router.post("/sessao/{sessao_id}/responder")
def responder_questao(sessao_id: int, resposta: RespostaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    sessao = db.query(SessaoExercicio).filter(SessaoExercicio.id == sessao_id, SessaoExercicio.usuario_id == usuario.id).first()
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    acertou = (resposta.alternativa_marcada == resposta.alternativa_correta)

    nova_resposta = RespostaQuestao(
        sessao_id=sessao.id,
        identificador_externo=resposta.identificador_externo,
        pergunta=resposta.pergunta,
        alternativa_marcada=resposta.alternativa_marcada,
        alternativa_correta=resposta.alternativa_correta,
        acertou=acertou,
        origem=resposta.origem
    )
    
    db.add(nova_resposta)
    db.commit()
    
    return {"status": "salvo", "acertou": acertou}

# 3. NOVO: Relatório de Desempenho
@router.get("/relatorio")
def obter_relatorio(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    # Busca todas as sessões do usuário ordenadas da mais recente para a mais antiga
    sessoes = db.query(SessaoExercicio).filter(SessaoExercicio.usuario_id == usuario.id).order_by(SessaoExercicio.data_criacao.desc()).all()
    
    relatorio = []
    for sessao in sessoes:
        # Conta quantos acertos o usuário teve nesta sessão
        acertos = db.query(func.count(RespostaQuestao.id)).filter(
            RespostaQuestao.sessao_id == sessao.id, 
            RespostaQuestao.acertou == True
        ).scalar()
        
        # Conta quantas questões ele respondeu no total nesta sessão
        respondidas = db.query(func.count(RespostaQuestao.id)).filter(
            RespostaQuestao.sessao_id == sessao.id
        ).scalar()
        
        relatorio.append({
            "sessao_id": sessao.id,
            "tema": sessao.tema or "Conhecimentos Gerais",
            "dificuldade": sessao.dificuldade or "Não definida",
            "quantidade_questoes": sessao.quantidade_questoes,
            "questoes_respondidas": respondidas,
            "acertos": acertos,
            "data": sessao.data_criacao.strftime("%d/%m/%Y %H:%M")
        })
        
    return relatorio