import json
import urllib.request
import random
import time
import os

# Configurações do Servidor
COMFYUI_URL = "http://127.0.0.1:8188"
WORKFLOW_FILE = "vton_input/work flow teste.json"

def carregar_workflow():
    with open(WORKFLOW_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def enviar_tarefa(workflow):
    p = {"prompt": workflow}
    data = json.dumps(p).encode('utf-8')
    req =  urllib.request.Request(f"{COMFYUI_URL}/prompt", data=data)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read())
    except Exception as e:
        print(f"Erro ao conectar com o ComfyUI: {e}")
        return None

def gerar_roupa(descricao_da_roupa):
    print(f"Preparando para gerar: {descricao_da_roupa}")
    
    # 1. Carrega o esqueleto do Workflow salvo pelo usuário
    workflow = carregar_workflow()
    
    # 2. Injeta as nossas variáveis no Workflow
    # O nó 6 é o nosso CLIPTextEncode positivo
    workflow["6"]["inputs"]["text"] = f"{descricao_da_roupa}, photorealistic, 8k, masterpiece, fashion photography"
    
    # O nó 5 é o KSampler, vamos gerar uma seed aleatória para sempre ser uma foto nova
    workflow["5"]["inputs"]["seed"] = random.randint(1, 9999999999999)
    
    # 3. Envia para o servidor
    resposta = enviar_tarefa(workflow)
    if resposta and "prompt_id" in resposta:
        prompt_id = resposta["prompt_id"]
        print(f"Tarefa enviada! ID: {prompt_id}")
        print("Você pode ver o progresso no terminal ou no navegador.")
        return prompt_id
    else:
        print("Falha ao enviar tarefa.")
        return None

if __name__ == "__main__":
    # Teste automático
    # Aqui você pode mudar para a roupa que quiser!
    minha_roupa = "a beautiful woman wearing a vintage denim jacket with patches"
    
    print("Iniciando a Máquina de Conteúdo VTON...")
    gerar_roupa(minha_roupa)
