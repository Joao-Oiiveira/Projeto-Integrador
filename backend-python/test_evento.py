import requests

data = {
    "titulo": "Teste",
    "descricao": "Desc",
    "data_inicio": "2026-08-19T20:00:00.000Z",
    "data_fim": "2026-08-19T21:00:00.000Z",
    "cor": "#FF0000"
}
# Precisa do token. Vou usar o login
login = requests.post("http://localhost:8000/auth/login", data={"username": "teste@teste.com", "password": "123"})
if login.status_code == 200:
    token = login.json()["access_token"]
    res = requests.post(
        "http://localhost:8000/eventos/",
        json=data,
        headers={"Authorization": f"Bearer {token}"}
    )
    print(res.status_code, res.text)
else:
    print("Login falhou")
