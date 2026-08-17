from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.usuario import Usuario, PerfilUsuario, ConfiguracoesUsuario
from app.models.disciplina import Disciplina
from app.models.tarefa import Tarefa
from app.models.conquista import Conquista, UsuarioConquista
from app.models.exercicio import SessaoExercicio, RespostaQuestao
from app.schemas.usuario import UsuarioCreate, UsuarioLogin, GoogleLoginRequest, TokenResponse, UsuarioResponse, OnboardingUpdate
from app.api.deps import get_usuario_atual
from app.core.firebase import verificar_token_firebase

router = APIRouter()



# 1. Função de Cadastro (Registro)
@router.post("/registrar", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def registrar(user_in: UsuarioCreate, db: Session = Depends(get_db)):
    # Verifica se email já existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == user_in.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
    
    # Cria usuário com senha criptografada
    novo_usuario = Usuario(
        nome=user_in.nome,
        email=user_in.email,
        senha=get_password_hash(user_in.senha)
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    # Gera o token de login automático
    access_token = create_access_token(data={"sub": novo_usuario.email})
    return {"access_token": access_token, "token_type": "bearer", "usuario": novo_usuario}

# 2. Função de Autenticação (Login)
@router.post("/login", response_model=TokenResponse)
def login(user_in: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == user_in.email).first()
    
    if not usuario or not verify_password(user_in.senha, usuario.senha):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    
    access_token = create_access_token(data={"sub": usuario.email})
    return {"access_token": access_token, "token_type": "bearer", "usuario": usuario}

# 3. Pegar usuário logado (Usado quando o app é reaberto)
@router.get("/me", response_model=UsuarioResponse)
def obter_usuario_logado(usuario_atual: Usuario = Depends(get_usuario_atual)):
    return usuario_atual

# 4. Salvar dados do Onboarding
@router.post("/onboarding", response_model=UsuarioResponse)
def salvar_onboarding(dados: OnboardingUpdate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    
    # Atualiza o nome
    usuario_atual.nome = dados.nome
    
    # Atualiza ou cria o Perfil
    if usuario_atual.perfil:
        for key, value in dados.perfil.dict().items():
            setattr(usuario_atual.perfil, key, value)
    else:
        novo_perfil = PerfilUsuario(**dados.perfil.dict(), usuario_id=usuario_atual.id)
        db.add(novo_perfil)
        
    # Atualiza ou cria as Configurações
    if usuario_atual.configuracoes:
        for key, value in dados.configuracoes.dict().items():
            setattr(usuario_atual.configuracoes, key, value)
    else:
        novas_configs = ConfiguracoesUsuario(**dados.configuracoes.dict(), usuario_id=usuario_atual.id)
        db.add(novas_configs)
        
    db.commit()
    db.refresh(usuario_atual)
    
    return usuario_atual

# 5. Login / Cadastro via Google (Firebase Auth)
@router.post("/google", response_model=TokenResponse)
def login_com_google(dados: GoogleLoginRequest, db: Session = Depends(get_db)):
    # Valida o ID Token recebido do Firebase
    token_decodificado = verificar_token_firebase(dados.id_token)
    
    email = token_decodificado.get("email")
    nome = token_decodificado.get("name") or (email.split("@")[0] if email else "Usuário Google")
    
    if not email:
        raise HTTPException(status_code=400, detail="E-mail não retornado pelo Firebase.")
        
    # Busca o usuário no MySQL
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    
    # Se não existir, cadastra automaticamente no MySQL
    if not usuario:
        usuario = Usuario(
            nome=nome,
            email=email,
            senha=get_password_hash("GOOGLE_SSO_USER_NO_PASSWORD")
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        
    # Gera o Token de acesso do nosso aplicativo
    access_token = create_access_token(data={"sub": usuario.email})
    return {"access_token": access_token, "token_type": "bearer", "usuario": usuario}

# 6. Obter Estatísticas do Perfil (Ofensiva, Disciplinas, XP, Conquistas)
@router.get("/estatisticas")
def obter_estatisticas_usuario(db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    # 1. Total de disciplinas ativas adicionadas pelo usuário no MySQL
    total_disciplinas = db.query(Disciplina).filter(
        Disciplina.usuario_id == usuario_atual.id,
        Disciplina.ativo == True
    ).count()

    # 2. Cálculo da Ofensiva (dias seguidos realizando tarefas concluídas)
    tarefas_concluidas = db.query(Tarefa).filter(
        Tarefa.usuario_id == usuario_atual.id,
        Tarefa.status == 'concluida'
    ).all()
    
    total_tarefas_concluidas = len(tarefas_concluidas)

    ofensiva_dias = 0
    if tarefas_concluidas:
        datas_conclusao = {t.data_atualizacao.date() for t in tarefas_concluidas if t.data_atualizacao}
        hoje = date.today()
        
        dia_checar = hoje
        if dia_checar not in datas_conclusao:
            dia_checar = hoje - timedelta(days=1)
            
        while dia_checar in datas_conclusao:
            ofensiva_dias += 1
            dia_checar -= timedelta(days=1)

    # 3. Índice de Acertos por Disciplina
    # Conta total de respostas e acertos por disciplina
    respostas = db.query(
        SessaoExercicio.disciplina_id,
        Disciplina.nome,
        Disciplina.cor,
        func.count(RespostaQuestao.id).label('total'),
        func.sum(func.cast(RespostaQuestao.acertou, Integer)).label('acertos')
    ).join(RespostaQuestao, RespostaQuestao.sessao_id == SessaoExercicio.id)\
     .join(Disciplina, Disciplina.id == SessaoExercicio.disciplina_id)\
     .filter(SessaoExercicio.usuario_id == usuario_atual.id)\
     .group_by(SessaoExercicio.disciplina_id, Disciplina.nome, Disciplina.cor)\
     .all()
    
    progresso_disciplinas = []
    acertos_matematica = 0
    acertos_portugues = 0
    
    for r in respostas:
        taxa = (r.acertos / r.total) if r.total > 0 else 0
        if r.nome.lower() == 'matemática':
            acertos_matematica = r.acertos
        if r.nome.lower() == 'português':
            acertos_portugues = r.acertos
            
        progresso_disciplinas.append({
            "disciplina_id": r.disciplina_id,
            "nome": r.nome,
            "cor": r.cor,
            "taxa_acerto": taxa,
            "total_questoes": r.total,
            "acertos": int(r.acertos) if r.acertos else 0
        })

    # 4. Processar e Atualizar Conquistas
    # Pega todas as conquistas cadastradas no sistema
    todas_conquistas = db.query(Conquista).all()
    lista_conquistas_retorno = []
    
    for c in todas_conquistas:
        # Pega ou cria o progresso do usuário para esta conquista
        usu_conquista = db.query(UsuarioConquista).filter(
            UsuarioConquista.usuario_id == usuario_atual.id,
            UsuarioConquista.conquista_id == c.id
        ).first()
        
        if not usu_conquista:
            usu_conquista = UsuarioConquista(
                usuario_id=usuario_atual.id,
                conquista_id=c.id,
                progresso=0,
                desbloqueada=False
            )
            db.add(usu_conquista)
            db.commit()
            db.refresh(usu_conquista)
            
        # Atualizar progresso baseado no tipo_objetivo
        novo_progresso = usu_conquista.progresso
        
        if c.tipo_objetivo == 'tarefa_1':
            novo_progresso = min(total_tarefas_concluidas, 1)
        elif c.tipo_objetivo == 'tarefa_10':
            novo_progresso = min(total_tarefas_concluidas, 10)
        elif c.tipo_objetivo == 'matematica_10':
            novo_progresso = min(int(acertos_matematica) if acertos_matematica else 0, 10)
        elif c.tipo_objetivo == 'portugues_10':
            novo_progresso = min(int(acertos_portugues) if acertos_portugues else 0, 10)
        elif c.tipo_objetivo == 'tarefa_madrugador':
            # Checa se alguma tarefa foi concluída antes das 08h
            madrugador = db.query(Tarefa).filter(
                Tarefa.usuario_id == usuario_atual.id,
                Tarefa.status == 'concluida',
                func.extract('hour', Tarefa.data_atualizacao) < 8
            ).count()
            novo_progresso = min(madrugador, 1)
            
        # Salva o novo progresso
        if novo_progresso != usu_conquista.progresso:
            usu_conquista.progresso = novo_progresso
            if usu_conquista.progresso >= c.meta_objetivo and not usu_conquista.desbloqueada:
                usu_conquista.desbloqueada = True
                usu_conquista.data_desbloqueio = func.now()
            db.commit()
            db.refresh(usu_conquista)
            
        # Adiciona na lista de retorno
        lista_conquistas_retorno.append({
            "id": c.id,
            "titulo": c.titulo,
            "descricao": c.descricao,
            "icone": c.icone,
            "cor_icone": c.cor_icone,
            "cor_fundo": c.cor_fundo,
            "meta_objetivo": c.meta_objetivo,
            "progresso": usu_conquista.progresso,
            "desbloqueada": usu_conquista.desbloqueada
        })

    return {
        "ofensiva_dias": ofensiva_dias,
        "total_disciplinas": total_disciplinas,
        "total_xp": None,
        "conquistas": lista_conquistas_retorno,
        "progresso_disciplinas": progresso_disciplinas
    }
