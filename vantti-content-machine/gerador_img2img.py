import os
import json
import time
import requests
import base64
import random
from dotenv import load_dotenv
import fal_client

load_dotenv()

def image_to_base64(filepath):
    print(f"[LOG] Codificando imagem de referencia: {os.path.basename(filepath)}")
    with open(filepath, "rb") as img_file:
        encoded = base64.b64encode(img_file.read()).decode('utf-8')
        ext = os.path.splitext(filepath)[1][1:].lower()
        if ext == 'jpg': ext = 'jpeg'
        return f"data:image/{ext};base64,{encoded}"

def gerar_planejamento_gemini(quantidade=1):
    print("[LOG] Gemini: Planejando o mes e variando os nichos de mercado...")
    api_key = os.getenv("GEMINI_API_KEY")
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
    
    headers = {"Content-Type": "application/json", "X-goog-api-key": api_key}
    
    system = "Você é o Estrategista Chefe da Vantti. Planeje um cronograma mensal de posts focados na venda de automação de WhatsApp. A CADA POST, mude o nicho de mercado dinamicamente (Ex: Painel Solar, Imobiliária, Odontologia, Concessionária). Retorne EXATAMENTE UM ARRAY JSON contendo objetos: 'dia': numero do dia, 'nicho': nicho escolhido, 'titulo_curto': Frase EXTREMAMENTE CURTA (max 4 palavras, todas em maiusculo) baseada no nicho, 'legenda': texto persuasivo."
    
    payload = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"parts": [{"text": f"Gere {quantidade} post de teste em formato JSON puro, sem markdown."}]}]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        data = response.json()
        texto = data['candidates'][0]['content']['parts'][0]['text'].strip()
        if texto.startswith("```json"): texto = texto.replace("```json", "", 1).replace("```", "")
        return json.loads(texto)
    except Exception as e:
        print("[ERRO GEMINI]", e)
        return [{"dia": 1, "nicho": "Energia Solar", "titulo_curto": "VENDA MAIS PAINEL SOLAR", "legenda": "A automação..."}]

def gerar_post_referencia(titulo, nicho, base64_image, filepath):
    print(f"[LOG] Fal.ai (Ideogram): Clonando estilo da foto base e injetando texto de {nicho}: '{titulo}'")
    
    prompt = f"A highly professional Instagram post design for a tech agency targeting the {nicho} market. Preserve the exact aesthetic, layout, background color, and composition of the reference image perfectly. Typography: Bold, elegant text spelling exactly: \"{titulo}\". The text should be placed exactly where the text is in the reference image. Studio lighting, 8k resolution, crisp text without spelling errors."
    
    arguments = {
        "prompt": prompt,
        "image_url": base64_image,
        "image_weight": 60, # Define o quao rigido ele deve seguir a imagem base (0 a 100)
        "aspect_ratio": "3:4",
        "style_type": "Design",
        "magic_prompt_option": "On"
    }
    
    try:
        res = fal_client.subscribe("fal-ai/ideogram/v2", arguments=arguments)
        img_url = res['images'][0]['url']
        r = requests.get(img_url)
        with open(filepath, 'wb') as f:
            f.write(r.content)
        return True
    except Exception as e:
        print("[ERRO FAL]", e)
        return False

def iniciar_maquina():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ref_dir = os.path.join(base_dir, "templates_referencia")
    if not os.path.exists(ref_dir): os.makedirs(ref_dir)
    
    # Valida imagens de referencia
    refs = [f for f in os.listdir(ref_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    if not refs:
        print(f"\n[ERRO CRITICO] Nenhuma foto encontrada na pasta!")
        print(f"Coloque pelo menos 1 foto na pasta: {ref_dir} antes de rodar o script.")
        return
        
    print(f"[LOG] Foram encontradas {len(refs)} fotos de referencia.")
    
    posts = gerar_planejamento_gemini(1) # 1 post para o teste rapido
    out_dir = os.path.join(base_dir, "posts_baseados_em_referencia")
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    for post in posts:
        ref_file = os.path.join(ref_dir, random.choice(refs))
        print(f"\n--- Gerando Post Dia {post.get('dia', 1)} (Nicho: {post.get('nicho', 'Geral')}) ---")
        
        b64 = image_to_base64(ref_file)
        pasta_post = os.path.join(out_dir, f"Post_Nicho_{post.get('nicho', 'Geral').replace(' ','_')}")
        if not os.path.exists(pasta_post): os.makedirs(pasta_post)
            
        caminho = os.path.join(pasta_post, f"post_final.png")
        
        if gerar_post_referencia(post.get('titulo_curto', 'TESTE'), post.get('nicho', 'Geral'), b64, caminho):
            with open(os.path.join(pasta_post, "legenda.txt"), "w", encoding="utf-8") as f:
                f.write(f"TITULO: {post.get('titulo_curto', '')}\n\nLEGENDA:\n{post.get('legenda', '')}")
            print(f"[SUCESSO] Post finalizado e salvo em: {pasta_post}")
        
if __name__ == "__main__":
    iniciar_maquina()
