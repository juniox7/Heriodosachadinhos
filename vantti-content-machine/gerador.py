import os
import json
import time
import requests
import textwrap
from dotenv import load_dotenv
import google.generativeai as genai
import fal_client
from PIL import Image, ImageDraw, ImageFont

# Carregar variáveis de ambiente
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def download_font():
    font_path = "Montserrat-Bold.ttf"
    if not os.path.exists(font_path):
        print("[LOG] Baixando fonte Montserrat oficial...")
        url = "https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Bold.ttf"
        r = requests.get(url, allow_redirects=True)
        open(font_path, 'wb').write(r.content)
    return font_path

def gerar_planejamento_posts(quantidade=2):
    print("[LOG] Tentando conectar ao Gemini via API REST pura...")
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key.startswith("AQ."):
             # Just in case the user copied "AQ." by accident previously, let's clean it up if it's there
             api_key = api_key
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        system_instruction = "Você é o Diretor de Marketing da Vantti, uma empresa que vende Automação de WhatsApp (IA) para Clínicas Odontológicas de alto padrão em São Paulo. Seu objetivo é criar posts para o Instagram que batam na dor do dentista (demora no atendimento, perder orçamentos altos) e ofereçam a Vantti como solução. Retorne EXATAMENTE um array JSON contendo objetos com: 'dia': numero, 'titulo_curto': Frase curta MAXIMO 6 PALAVRAS para a imagem, 'elemento_visual': objeto 3D minimalista em ingles, 'legenda': legenda persuasiva."
        
        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"parts": [{"text": f"Gere {quantidade} posts JSON exatos, sem markdown."}]}]
        }
        
        response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
        
        if response.status_code != 200:
            print(f"[ERRO GEMINI] Código {response.status_code}: {response.text}")
            raise Exception("Erro na API")
            
        data = response.json()
        texto = data['candidates'][0]['content']['parts'][0]['text'].strip()
        
        if texto.startswith("```json"):
            texto = texto.replace("```json", "", 1).replace("```", "")
        return json.loads(texto)
    except Exception as e:
        print(f"[LOG] Falha no Gemini ({e}). Usando roteiros fixos de teste...")
        return [
            {
                "dia": 1,
                "titulo_curto": "PACIENTE QUE ESPERA AGENDA EM OUTRA CLINICA",
                "elemento_visual": "A 3D render of a glossy blue Whatsapp chat bubble icon, soft lighting, highly detailed",
                "legenda": "Se você demora, seu concorrente agradece..."
            },
            {
                "dia": 2,
                "titulo_curto": "PARE DE PERDER ORCAMENTOS NO WHATSAPP",
                "elemento_visual": "A 3D render of a modern smartphone standing upright",
                "legenda": "A automação é o segredo das grandes clínicas..."
            }
        ]

def gerar_fundo_3d(elemento_visual):
    print(f"[LOG] Pedindo para Fal.ai gerar fundo LIMPO (Sem Texto)...")
    prompt = f"A highly professional, high-end agency Instagram post background. Aesthetic: Clean, minimalist, corporate, tech. Background: Solid pristine off-white/light-grey background. In the absolute center: {elemento_visual}. CRITICAL INSTRUCTION: ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO WATERMARKS anywhere in the image. Studio lighting, 8k resolution, photorealistic."
    
    try:
        result = fal_client.subscribe(
            "fal-ai/ideogram/v2",
            arguments={"prompt": prompt, "aspect_ratio": "3:4", "style_type": "Design"}
        )
        return requests.get(result['images'][0]['url']).content
    except Exception as e:
        print(f"[ERRO] Erro na Fal.ai: {e}")
        return None

def adicionar_texto_imagem(img_data, titulo, filepath):
    print(f"[LOG] Escrevendo tipografia perfeita: '{titulo}'")
    font_path = download_font()
    
    with open("temp_bg.png", "wb") as f:
        f.write(img_data)
        
    img = Image.open("temp_bg.png").convert("RGBA")
    draw = ImageDraw.Draw(img)
    
    W, H = img.size
    font_size = int(W * 0.08) # 8% da largura da imagem
    font = ImageFont.truetype(font_path, font_size)
    
    # Logo Vantti
    logo_font = ImageFont.truetype(font_path, int(font_size*0.4))
    draw.text((W*0.08, H*0.05), "@VANTTI", fill="#0A192F", font=logo_font)
    
    # Texto Responsivo
    margin = W * 0.08
    lines = textwrap.wrap(titulo, width=15)
    
    y_text = H * 0.10
    for line in lines:
        draw.text((margin, y_text), line, font=font, fill="#0A192F")
        y_text += font_size * 1.1
        
    img.convert("RGB").save(filepath, quality=100)
    os.remove("temp_bg.png")

def iniciar_maquina(quantidade=2):
    print("[INICIO] Maquina de Conteudo Vantti v2.0 (Design Profissional)")
    
    posts = gerar_planejamento_posts(quantidade)
        
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, "posts_gerados")
    if not os.path.exists(output_dir): os.makedirs(output_dir)
        
    for post in posts:
        dia_str = f"Dia_{str(post.get('dia')).zfill(2)}"
        pasta_dia = os.path.join(output_dir, dia_str)
        if not os.path.exists(pasta_dia): os.makedirs(pasta_dia)
            
        print(f"\n--- Processando {dia_str} ---")
        
        with open(os.path.join(pasta_dia, "legenda.txt"), "w", encoding="utf-8") as f:
            f.write(f"HOOK: {post.get('titulo_curto')}\n\n{post.get('legenda')}")
            
        img_data = gerar_fundo_3d(post.get('elemento_visual'))
        if img_data:
            caminho_imagem = os.path.join(pasta_dia, "post.png")
            adicionar_texto_imagem(img_data, post.get('titulo_curto'), caminho_imagem)
            print("[SUCESSO] Post finalizado com sucesso!")
        
        time.sleep(2)
        
    print("\n[FINALIZADO] Maquina V2.0 finalizada. Abra as fotos!")

if __name__ == "__main__":
    iniciar_maquina(2)
