import os
import json
import time
import requests
import textwrap
from dotenv import load_dotenv
import fal_client
from PIL import Image, ImageDraw, ImageFont

load_dotenv()

def download_font():
    font_path = "Montserrat-Bold.ttf"
    if not os.path.exists(font_path):
        print("[LOG] Baixando fonte oficial Vantti (Montserrat)...")
        url = "https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Bold.ttf"
        r = requests.get(url, allow_redirects=True)
        open(font_path, 'wb').write(r.content)
    return font_path

def gerar_planejamento_gemini(quantidade=5):
    print("[LOG] Conectando ao Gemini para planejar pauta...")
    api_key = os.getenv("GEMINI_API_KEY")
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
    
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": api_key
    }
    
    system = "Você é o Diretor de Marketing da Vantti. Crie posts para o Instagram. Retorne EXATAMENTE um array JSON contendo objetos: 'dia': string (Segunda, Quarta ou Sexta), 'titulo_curto': Frase de impacto (max 5 palavras) em MAIUSCULO, 'elemento_visual': objeto 3D minimalista em ingles, 'legenda': texto do post."
    
    payload = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"parts": [{"text": f"Gere {quantidade} posts JSON exatos (2 para Segunda, 1 para Quarta, 2 para Sexta). Sem markdown."}]}]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code != 200:
            print(f"[ERRO GEMINI] {response.text}")
            return fallback_json()
            
        data = response.json()
        texto = data['candidates'][0]['content']['parts'][0]['text'].strip()
        if texto.startswith("```json"): texto = texto.replace("```json", "", 1).replace("```", "")
        return json.loads(texto)
    except Exception as e:
        print(f"[ERRO JSON] {e}")
        return fallback_json()

def fallback_json():
    return [
        {"dia": "Segunda", "titulo_curto": "AGENDA LOTADA COM IA", "elemento_visual": "A minimalist 3D render of a futuristic blue calendar icon floating", "legenda": "Comece a semana lotando a agenda."},
        {"dia": "Quarta", "titulo_curto": "PARE DE PERDER ORCAMENTOS", "elemento_visual": "A minimalist 3D render of a modern smartphone with a checkmark on screen", "legenda": "No meio da semana, quantos leads você já perdeu?"}
    ]

def gerar_base_visual_limpa(dia, elemento_visual):
    if dia in ["Segunda", "Sexta"]:
        print(f"[LOG] Gerando Fundo Premium (Flux Pro) para {dia}...")
        model = "fal-ai/flux/dev"
    else:
        print(f"[LOG] Gerando Fundo Economico (Flux Schnell) para {dia}...")
        model = "fal-ai/flux/schnell"
        
    prompt = f"A highly professional Instagram post background. Aesthetic: Clean, minimalist, corporate, tech. Solid pristine off-white/light-grey background. In the lower center: {elemento_visual}. CRITICAL INSTRUCTION: ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO UI ELEMENTS anywhere in the image. Studio lighting, highly detailed."
    
    try:
        res = fal_client.subscribe(model, arguments={"prompt": prompt, "aspect_ratio": "3:4"})
        return requests.get(res['images'][0]['url']).content
    except Exception as e:
        print(f"[ERRO Base] {e}")
        return None

def aplicar_tipografia_agencia(img_data, titulo, filepath):
    print(f"[LOG] Carimbando tipografia Vantti de agencia: '{titulo}'")
    font_path = download_font()
    
    with open("temp_bg.png", "wb") as f:
        f.write(img_data)
        
    img = Image.open("temp_bg.png").convert("RGBA")
    draw = ImageDraw.Draw(img)
    W, H = img.size
    
    # Tamanho da fonte dinâmico (aprox 12% da largura)
    font_size = int(W * 0.12)
    font_title = ImageFont.truetype(font_path, font_size)
    font_logo = ImageFont.truetype(font_path, int(font_size * 0.35))
    
    cor_texto = "#0A192F" # Azul marinho super escuro corporativo
    
    # 1. Desenhar a Logo @VANTTI no canto superior esquerdo
    margin_x = W * 0.08
    margin_y = H * 0.08
    draw.text((margin_x, margin_y), "@VANTTI", fill=cor_texto, font=font_logo)
    
    # 2. Desenhar o Titulo Principal Responsivo
    lines = textwrap.wrap(titulo, width=12) # Quebra linha a cada ~12 caracteres
    y_text = margin_y + (font_size * 1.5)
    
    for line in lines:
        draw.text((margin_x, y_text), line, font=font_title, fill=cor_texto)
        y_text += font_size * 1.1 # Espaçamento entre linhas
        
    # Salvar final com maxima qualidade
    img.convert("RGB").save(filepath, quality=100)
    os.remove("temp_bg.png")

def iniciar_maquina():
    print("[INICIO] Maquina de Conteudo HIBRIDA (IA de Imagem + Python Typography)")
    
    posts = gerar_planejamento_gemini(2) # Usando 2 por enquanto para acelerar o teste
    
    output_dir = os.path.join(os.path.dirname(__file__), "posts_perfeitos")
    if not os.path.exists(output_dir): os.makedirs(output_dir)
        
    for i, post in enumerate(posts):
        pasta_dia = os.path.join(output_dir, f"Post_{i+1}_{post.get('dia')}")
        if not os.path.exists(pasta_dia): os.makedirs(pasta_dia)
            
        print(f"\n--- Processando {post.get('dia')} ---")
        
        with open(os.path.join(pasta_dia, "legenda.txt"), "w", encoding="utf-8") as f:
            f.write(f"TITULO: {post.get('titulo_curto')}\n\nLEGENDA:\n{post.get('legenda')}")
            
        img_data = gerar_base_visual_limpa(post.get('dia'), post.get('elemento_visual'))
        
        if img_data:
            caminho_imagem = os.path.join(pasta_dia, "post_final.png")
            aplicar_tipografia_agencia(img_data, post.get('titulo_curto'), caminho_imagem)
            print(f"[SUCESSO] Post impecavel salvo em: {pasta_dia}")
                
        time.sleep(2)
        
    print("\n[FINALIZADO] Lote gerado! A perfeição mora aqui.")

if __name__ == "__main__":
    iniciar_maquina()
