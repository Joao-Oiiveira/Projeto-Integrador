from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_usuario_atual
from app.models.usuario import Usuario
from app.models.exercicio import SessaoExercicio, RespostaQuestao
from app.schemas.exercicio import SessaoCreate, SessaoResponse, RespostaCreate
from app.services.questoes_service import buscar_questoes_enem, gerar_questoes_ia

router = APIRouter()

# 1. Iniciar uma Sessão (Gera/Busca as questões)
@router.post("/sessao", response_model=SessaoResponse)
def iniciar_sessao(dados: SessaoCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    
    # 1. Salva a Sessão no Banco
    nova_sessao = SessaoExercicio(
        usuario_id=usuario.id,
        disciplina_id=dados.disciplina_id,
        tema=dados.tema,
        modo=dados.modo,
        quantidade_questoes=dados.quantidade_questoes
    )
    db.add(nova_sessao)
    db.commit()
    db.refresh(nova_sessao)

    # 2. Busca as Questões (Sem salvar no banco!)
    questoes = []
    if dados.modo == 'vestibular':
        questoes = buscar_questoes_enem(dados.quantidade_questoes)
    elif dados.modo == 'ia':
        questoes = gerar_questoes_ia(dados.tema, dados.quantidade_questoes)
    else:
        raise HTTPException(status_code=400, detail="Modo inválido. Escolha 'vestibular' ou 'ia'.")

    # 3. Devolve o ID da sessão e as questões para o React
    return {
        "sessao_id": nova_sessao.id,
        "questoes": questoes
    }

# 2. Salvar a resposta de uma questão
@router.post("/sessao/{sessao_id}/responder")
def responder_questao(sessao_id: int, resposta: RespostaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    
    # Verifica se a sessão existe e pertence ao usuário
    sessao = db.query(SessaoExercicio).filter(SessaoExercicio.id == sessao_id, SessaoExercicio.usuario_id == usuario.id).first()
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    # Calcula se o aluno acertou
    acertou = (resposta.alternativa_marcada == resposta.alternativa_correta)

    # Salva o histórico no banco
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