import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, status

# Caminho para o arquivo de credenciais na raiz do backend-python
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CREDENTIALS_PATH = os.path.join(BASE_DIR, "firebase-credentials.json")

# Inicializa o Firebase apenas uma vez
if not firebase_admin._apps:
    if os.path.exists(CREDENTIALS_PATH):
        cred = credentials.Certificate(CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    else:
        print(f"⚠️ AVISO: Arquivo {CREDENTIALS_PATH} não foi encontrado. O Firebase não foi inicializado.")

def verificar_token_firebase(id_token: str) -> dict:
    """
    Verifica o ID Token enviado pelo aplicativo/frontend.
    Se o token for válido, devolve os dados do usuário no Google (email, nome, uid, foto).
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token do Firebase inválido ou expirado: {str(e)}"
        )
