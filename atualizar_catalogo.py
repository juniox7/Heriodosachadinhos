import os
import json
import re
from PIL import Image

# Caminho absoluto para a pasta do site
ONEDRIVE_PASTA = r"C:\Users\junio\OneDrive\Documentos\pagina de catalogo para os cliente"

PASTAS = ['menino', 'menina', 'cha_revelacao']
EXTENSOES_VALIDAS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}

def renomear_para_codigos(caminho_pasta):
    """
    Renomeia todas as imagens na pasta para números sequenciais (1.jpg, 2.jpg)
    se elas já não forem apenas números.
    """
    if not os.path.exists(caminho_pasta):
        return

    arquivos = [f for f in os.listdir(caminho_pasta) if os.path.splitext(f)[1].lower() in EXTENSOES_VALIDAS]
    
    # Encontra qual é o maior número já existente na pasta
    maior_codigo = 0
    arquivos_nao_numericos = []
    
    for filename in arquivos:
        nome_base = os.path.splitext(filename)[0]
        # Se for um nome puramente numérico (ex: "13")
        if nome_base.isdigit():
            num = int(nome_base)
            if num > maior_codigo:
                maior_codigo = num
        else:
            arquivos_nao_numericos.append(filename)
            
    # Renomeia os arquivos que têm nomes zoados para o próximo número
    for filename in arquivos_nao_numericos:
        maior_codigo += 1
        ext = os.path.splitext(filename)[1].lower()
        novo_nome = f"{maior_codigo}{ext}"
        
        caminho_antigo = os.path.join(caminho_pasta, filename)
        caminho_novo = os.path.join(caminho_pasta, novo_nome)
        
        try:
            os.rename(caminho_antigo, caminho_novo)
        except Exception as e:
            print(f"Erro ao renomear {filename}: {e}")

def get_image_feature(filepath):
    try:
        with Image.open(filepath) as img:
            img = img.resize((8, 8)).convert('RGB')
            return list(img.getdata())
    except Exception:
        return None

def color_distance(feat1, feat2):
    if not feat1 or not feat2: return float('inf')
    dist = 0
    for (r1, g1, b1), (r2, g2, b2) in zip(feat1, feat2):
        dist += (r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2
    return dist

def sort_by_similarity(image_list, folder):
    if not image_list: return []
    
    print(f"  Analisando {len(image_list)} imagens na pasta '{os.path.basename(folder)}' para aproximar parecidas...")
    features = {}
    
    for img_name in image_list:
        feat = get_image_feature(os.path.join(folder, img_name))
        if feat:
            features[img_name] = feat
            
    if not features: return sorted(image_list)
        
    unvisited = set(features.keys())
    unreadable = [img for img in image_list if img not in unvisited]
    
    sorted_list = []
    current = sorted(list(unvisited))[0]
    sorted_list.append(current)
    unvisited.remove(current)
    
    while unvisited:
        closest = None
        min_dist = float('inf')
        for candidate in unvisited:
            dist = color_distance(features[current], features[candidate])
            if dist < min_dist:
                min_dist = dist
                closest = candidate
        
        sorted_list.append(closest)
        unvisited.remove(closest)
        current = closest
        
    return sorted_list + unreadable

def processar_catalogo():
    dados = {'menino': [], 'menina': [], 'cha_revelacao': []}
    arquivos_encontrados = 0

    for pasta in PASTAS:
        caminho_pasta = os.path.join(ONEDRIVE_PASTA, pasta)
        
        # 1. Renomeia as imagens com nomes estranhos para códigos sequenciais
        renomear_para_codigos(caminho_pasta)
        
        # 2. Pega a nova lista de arquivos (já renomeada)
        if not os.path.exists(caminho_pasta): continue
        lista_arquivos = [f for f in os.listdir(caminho_pasta) if os.path.splitext(f)[1].lower() in EXTENSOES_VALIDAS]
        
        # 3. Ordena pela IA de cor e salva no JSON
        if lista_arquivos:
            lista_ordenada = sort_by_similarity(lista_arquivos, caminho_pasta)
            dados[pasta] = lista_ordenada
            arquivos_encontrados += len(lista_ordenada)
                
    return dados, arquivos_encontrados

def gerar_data_js(dados):
    json_string = json.dumps(dados, indent=4, ensure_ascii=False)
    js_content = f"// ARQUIVO GERADO AUTOMATICAMENTE.\n// NÃO EDITE MANUALMENTE.\nconst catalogoData = {json_string};\n"
    
    caminho_js = os.path.join(ONEDRIVE_PASTA, 'data.js')
    with open(caminho_js, 'w', encoding='utf-8') as f:
        f.write(js_content)

if __name__ == "__main__":
    print("="*50)
    print("Iniciando conversão para códigos e IA de organização...")
    print("="*50)
    
    dados, total = processar_catalogo()
    gerar_data_js(dados)
    
    print("\n" + "="*50)
    print(f"SUCESSO! O catálogo organizou {total} imagens.")
    print("Todos os nomes confusos foram substituídos por Códigos (ex: 1, 2, 3...)")
    print("="*50)
    
    import time
    time.sleep(5)
