import os
import re
import random
import json
import time
import asyncio
import textwrap
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
import requests
import edge_tts
from moviepy import VideoFileClip, AudioFileClip, TextClip, CompositeVideoClip, concatenate_videoclips

# ─── Configuração ────────────────────────────────────────────────────────────
load_dotenv()

BASE_DIR    = Path(__file__).parent.resolve()
DIR_BRUTOS  = BASE_DIR / "produtos_brutos"
DIR_PRONTOS = BASE_DIR / "prontos_para_postar"
FONT_PATH   = str(BASE_DIR / "Montserrat-Bold.ttf")

# Duração máxima do vídeo final (segundos)
MAX_DURACAO = 15

# Quantidade de vídeos gerados por produto a cada execução
VIDEOS_POR_PRODUTO = 3

# Garante que as pastas existem
DIR_BRUTOS.mkdir(exist_ok=True)
DIR_PRONTOS.mkdir(exist_ok=True)

EXTENSOES_VIDEO = {".mp4", ".mov", ".avi", ".mkv"}
VOZES_TTS = ["pt-BR-FranciscaNeural", "pt-BR-AntonioNeural", "pt-BR-ThalitaNeural"]

# ─── Validação de Pré-requisitos ─────────────────────────────────────────────

def validar_prerequisitos():
    """Verifica se todos os requisitos estão presentes antes de iniciar."""
    erros = []
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "":
        erros.append("GEMINI_API_KEY não encontrada no .env (crie o arquivo .env com sua chave).")
    
    if not Path(FONT_PATH).exists():
        erros.append(f"Fonte não encontrada: {FONT_PATH} (baixe a Montserrat-Bold.ttf e coloque na raiz do projeto).")
    
    if not DIR_BRUTOS.exists() or not any(DIR_BRUTOS.iterdir()):
        erros.append(f"Pasta de vídeos brutos vazia ou inexistente: {DIR_BRUTOS}")
    
    if erros:
        print("\n" + "=" * 55)
        print("   ERRO DE CONFIGURAÇÃO   ")
        print("=" * 55)
        for e in erros:
            print(f"  ❌ {e}")
        print("=" * 55)
        raise SystemExit(1)

# ─── Helpers ─────────────────────────────────────────────────────────────────

def limpar_json(texto: str) -> str:
    """Remove blocos markdown (```json ... ```) e whitespace extra do texto do Gemini."""
    texto = texto.strip()
    # Remove qualquer variação de bloco markdown
    texto = re.sub(r"^```[a-zA-Z]*\n?", "", texto)
    texto = re.sub(r"\n?```$", "", texto)
    return texto.strip()


def listar_arquivos_brutos(caminho_bruto: Path) -> list[Path]:
    """
    Retorna uma lista de caminhos de arquivos de vídeo.
    Se for pasta, lista todos os vídeos. Se for arquivo, lista ele mesmo.
    """
    if caminho_bruto.is_dir():
        arquivos = [f for f in caminho_bruto.iterdir() if f.suffix.lower() in EXTENSOES_VIDEO]
        if not arquivos:
            raise FileNotFoundError(f"Nenhum vídeo encontrado em: {caminho_bruto}")
        return arquivos
    elif caminho_bruto.is_file():
        return [caminho_bruto]
    else:
        raise FileNotFoundError(f"Arquivo/pasta não encontrado: {caminho_bruto}")


def fechar_clips(*clips):
    """Fecha todos os clips passados, ignorando erros individuais."""
    for c in clips:
        try:
            if c is not None:
                c.close()
        except Exception:
            pass

# ─── Geração de Roteiros (Gemini) ────────────────────────────────────────────

def gerar_roteiros_gemini(produto_nome: str, nicho: str, quantidade: int = 2) -> list[dict]:
    print(f"\n[GEMINI] Gerando {quantidade} roteiros - {produto_nome} ({nicho})")
    
    for tentativa in range(2):
        try:
            prompt = f"""
Você é um especialista em TikTok e vídeos curtos (UGC) para e-commerce brasileiro.
Produto: '{produto_nome}' | Nicho: '{nicho}'

Gere {quantidade} roteiros virais usando o framework P.A.S (Problema, Agitação, Solução) para videos curtos. Para cada um, retorne:
- "hook_texto": frase curta e instigante (MAXIMO 6 palavras) que resume a Dor do cliente.
- "narracao": texto para locução (OBRIGATÓRIO: entre 25 e 35 palavras). Estrutura exigida: 1. Toque numa dor/problema; 2. Agite o problema (piore a dor); 3. Apresente o produto como a solução rápida. A última frase deve pedir para seguir a página.
- "legenda_post": texto engajador para usar como legenda na postagem do TikTok (inclua 3 a 5 hashtags).

Retorne APENAS um array JSON válido. NENHUM markdown, NENHUM texto fora do JSON.
Exemplo:
[{{"hook_texto": "Sua casa vive bagunçada?", "narracao": "Você passa o fim de semana todo limpando a casa e não descansa? Esse Mop Giratório limpa tudo na metade do tempo sem molhar as mãos. Siga a página e garanta o seu!", "legenda_post": "Facilite sua rotina de limpeza! 🚀\\n\\n#limpeza #praticidade #oferta #casa"}}]
""".strip()

            api_key = os.getenv("GEMINI_API_KEY")
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
            
            headers = {
                "Content-Type": "application/json",
                "X-goog-api-key": api_key
            }
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }

            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            texto_puro = data["candidates"][0]["content"]["parts"][0]["text"]
            
            texto = limpar_json(texto_puro)
            roteiros = json.loads(texto)

            # Validação básica de estrutura
            if not isinstance(roteiros, list) or not roteiros:
                raise ValueError("Resposta do Gemini não é uma lista válida.")
            for r in roteiros:
                if "hook_texto" not in r or "narracao" not in r:
                    raise ValueError(f"Roteiro inválido (campos ausentes): {r}")

            return roteiros

        except Exception as e:
            if tentativa == 1:
                print(f"[ERRO GEMINI] {e} — usando roteiro de fallback dinâmico.")
                variacoes_fallback = [
                    {"hook_texto": f"{produto_nome}: imperdível!", "narracao": f"Todo mundo está falando sobre {produto_nome}. Descubra o motivo e corra para o link na bio antes que acabe!", "legenda_post": f"Garante o seu! #{produto_nome.replace(' ', '')}"},
                    {"hook_texto": "Olha isso aqui!", "narracao": f"Se você ainda não conhece {produto_nome}, está perdendo tempo. A praticidade disso é surreal. Garanta o seu!", "legenda_post": "Praticidade é tudo! #praticidade #novidade"},
                    {"hook_texto": "A febre do momento", "narracao": f"Chegou a novidade que virou febre no Brasil. {produto_nome} é o que faltava na sua casa. Siga nossa página!", "legenda_post": "Siga para mais ofertas! #oferta #brasil"},
                    {"hook_texto": "A melhor dica", "narracao": f"Testei {produto_nome} e fiquei chocado com o resultado. Facilita muito a vida. Não fique de fora!", "legenda_post": "Facilite sua rotina! #dica #casa"},
                    {"hook_texto": "Segredo revelado", "narracao": f"Quem tem {produto_nome} sabe do que estou falando. Uma verdadeira mão na roda para o dia a dia. Corre pra ver!", "legenda_post": "Dica de ouro! #casa #utilidades"}
                ]
                escolhidos = random.sample(variacoes_fallback, min(quantidade, len(variacoes_fallback)))
                return escolhidos
            else:
                print(f"[AVISO] Resposta inválida do Gemini, tentando novamente em 20s... ({e})")
                time.sleep(20) # 20s para garantir que esfrie a API

# ─── Geração de Áudio (Edge TTS) ─────────────────────────────────────────────

async def gerar_audio_tts(texto: str, caminho_saida: Path) -> list:
    voz_escolhida = random.choice(VOZES_TTS)
    print(f"[VOZ] Gerando narração com {voz_escolhida} (+15% vel)...")
    
    # Retry: tenta até 2 vezes caso a rede falhe durante a geração
    for tentativa_tts in range(2):
        try:
            comunicador = edge_tts.Communicate(texto, voz_escolhida, rate="+15%")
            palavras_temporizadas = []
            with open(caminho_saida, "wb") as f:
                async for chunk in comunicador.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        t_start = chunk["offset"] / 10_000_000
                        t_dur = chunk["duration"] / 10_000_000
                        palavras_temporizadas.append({"text": chunk["text"], "start": t_start, "end": t_start + t_dur})
            
            if not caminho_saida.exists() or caminho_saida.stat().st_size == 0:
                raise RuntimeError("Arquivo de áudio vazio")
            break  # Sucesso, sai do loop de retry
            
        except Exception as e:
            if tentativa_tts == 0:
                print(f"[AVISO TTS] Falha na rede, tentando novamente em 5s... ({e})")
                await asyncio.sleep(5)
            else:
                raise RuntimeError(f"Edge-TTS falhou após 2 tentativas: {e}")
        
    # FALLBACK: Se a API cortou o WordBoundary devido à aceleração da voz
    if not palavras_temporizadas:
        from moviepy import AudioFileClip
        try:
            audio_ia = AudioFileClip(str(caminho_saida))
            duracao = audio_ia.duration
            audio_ia.close()
        except Exception:
            duracao = 15.0 # fallback extremo
            
        palavras = texto.split()
        if palavras:
            # Ajuste fino: 0.95 garante que a legenda acompanhe o ritmo sem se antecipar demais
            tempo_por_palavra = (duracao * 0.95) / len(palavras)
            tempo_atual = 0.0
            for p in palavras:
                palavras_temporizadas.append({
                    "text": p,
                    "start": tempo_atual,
                    "end": tempo_atual + tempo_por_palavra
                })
                tempo_atual += tempo_por_palavra

    return palavras_temporizadas

# ─── Montagem do Vídeo (MoviePy) ─────────────────────────────────────────────

def forcar_9_16(clip):
    """Redimensiona e recorta o vídeo para preencher a tela 9:16 (1080x1920)"""
    TARGET_W = 1080
    TARGET_H = 1920
    clip_ratio = clip.w / clip.h
    target_ratio = TARGET_W / TARGET_H

    # MoviePy 2.0 usa .resized() e .cropped()
    # MoviePy 1.x usa .resize() e .crop()
    
    if hasattr(clip, "resized"):
        if clip_ratio > target_ratio:
            c_resized = clip.resized(height=TARGET_H)
        else:
            c_resized = clip.resized(width=TARGET_W)
        return c_resized.cropped(x_center=c_resized.w/2, y_center=c_resized.h/2, width=TARGET_W, height=TARGET_H)
    else:
        if clip_ratio > target_ratio:
            c_resized = clip.resize(height=TARGET_H)
        else:
            c_resized = clip.resize(width=TARGET_W)
        return c_resized.crop(x_center=c_resized.w/2, y_center=c_resized.h/2, width=TARGET_W, height=TARGET_H)


def montar_video(
    caminho_bruto: Path,
    audio_path: Path,
    hook_texto: str,
    palavras_temporizadas: list,
    output_path: Path,
    nicho: str = ""
) -> bool:
    """
    Retorna True em caso de sucesso, False em caso de falha.
    Garante que todos os clips são fechados mesmo em erro.
    """
    clips_brutos: list[VideoFileClip] = []
    audio_ia: AudioFileClip | None = None
    video_final = video_base = video_cortado = video_com_audio = None
    txt_hook = None
    clips_legenda = []
    segmentos = []

    print(f"[EDICAO] Montando: {output_path.name}")
    try:
        # 1. Carregar lista de arquivos
        arquivos = listar_arquivos_brutos(caminho_bruto)
        
        # Embaralhar a lista para garantir que vídeos gerados no mesmo dia sejam diferentes
        if len(arquivos) > 1:
            random.shuffle(arquivos)
            
        # 2. Carregar TODOS os vídeos da pasta e remover o áudio original por segurança
        #    Filtra vídeos muito curtos (< 1s) que podem causar erros no subclipped()
        for arq in arquivos:
            clip_raw = VideoFileClip(str(arq))
            if clip_raw.duration is not None and clip_raw.duration < 1.0:
                print(f"[AVISO] Vídeo ignorado (< 1s): {arq.name}")
                clip_raw.close()
                continue
            clip_mudo = clip_raw.without_audio() if hasattr(clip_raw, "without_audio") else clip_raw.set_audio(None)
            clips_brutos.append(clip_mudo)
        
        if not clips_brutos:
            raise ValueError("Nenhum vídeo bruto válido (todos com menos de 1 segundo?).")

        # 3. Montar mosaico de segmentos
        #    Cada clipe contribui DURACAO_SEGMENTO segundos.
        #    Se acabar os clipes antes de completar o áudio, volta ao início (loop).
        duracao_alvo = 8 if nicho == "Moda" else MAX_DURACAO
        segmentos = []
        tempo_restante = duracao_alvo  # será ajustado depois pelo áudio
        iteracoes = 0
        while tempo_restante > 0:
            # Escolhe um clip COMPLETAMENTE ALEATORIO a cada segmento
            # Assim o video 2 pode vir antes do 1, repetir, misturar, etc.
            clip_base = random.choice(clips_brutos)
            
            # Cortes rápidos entre 1.5s e 2.5s (Jump Cuts dinâmicos)
            duracao_sorteada = random.uniform(1.5, 2.5)
            fim_seg = min(duracao_sorteada, clip_base.duration, tempo_restante)
            
            # Sortear um ponto de início aleatório dentro do clipe
            limite_inicio = max(0, clip_base.duration - fim_seg)
            inicio_seg = random.uniform(0, limite_inicio)
            
            # Recortar o trecho aleatório e forçar 9:16
            trecho = clip_base.subclipped(inicio_seg, inicio_seg + fim_seg)
            trecho_916 = forcar_9_16(trecho)
            
            # 50% de chance de aplicar um zoom estático para dinamismo visual ("Jump Cut" intencional)
            if random.random() > 0.5:
                w, h = trecho_916.w, trecho_916.h
                if hasattr(trecho_916, "cropped"):
                    trecho_916 = trecho_916.cropped(x_center=w/2, y_center=h/2, width=w*0.85, height=h*0.85).resized(width=w, height=h)
                else:
                    trecho_916 = trecho_916.crop(x_center=w/2, y_center=h/2, width=w*0.85, height=h*0.85).resize(width=w, height=h)
            
            # Forçar 30 FPS para evitar erros de concatenação
            trecho_fps = trecho_916.with_fps(30) if hasattr(trecho_916, "with_fps") else trecho_916.set_fps(30)
            
            segmentos.append(trecho_fps)
            
            tempo_restante -= fim_seg
            iteracoes += 1
            if iteracoes > 100:
                break

        if len(segmentos) > 1:
            video_base = concatenate_videoclips(segmentos, method="compose")
        else:
            video_base = segmentos[0]

        if video_base.duration is None or video_base.duration <= 0:
            raise ValueError("Vídeo bruto com duração inválida (arquivo corrompido?).")

        # 4. Carregar áudio de IA
        if nicho != "Moda":
            audio_ia = AudioFileClip(str(audio_path))
            # 5. Duração final = mínimo entre o vídeo, o áudio e o limite
            duracao_final = min(video_base.duration, audio_ia.duration, duracao_alvo)
            video_cortado = video_base.subclipped(0, duracao_final)
            audio_cortado = audio_ia.subclipped(0, duracao_final)
            # 6. Substituir áudio original pelo áudio de IA
            video_com_audio = video_cortado.with_audio(audio_cortado)
        else:
            audio_ia = None
            duracao_final = min(video_base.duration, duracao_alvo)
            video_cortado = video_base.subclipped(0, duracao_final)
            video_com_audio = video_cortado

        # 7. Criar legenda (hook) fixo no topo da tela para dar contexto
        if nicho != "Moda":
            texto_quebrado = "\n".join(textwrap.wrap(hook_texto, width=14))
            txt_hook = (
                TextClip(
                    font=FONT_PATH, text=texto_quebrado, font_size=70,
                    color="white", stroke_color="black", stroke_width=6,
                    method="label", text_align="center", margin=(25, 25)
                )
                .with_position(("center", 0.15), relative=True)
                .with_duration(duracao_final)
            )

        # 8. Criar legendas dinâmicas (Karaokê) no centro
        clips_legenda = []
        if nicho != "Moda":
            agrupamento = 3 # Exibe de 3 em 3 palavras
            for i in range(0, len(palavras_temporizadas), agrupamento):
                grupo = palavras_temporizadas[i:i+agrupamento]
                if not grupo:
                    continue
                texto_grupo = " ".join([p["text"] for p in grupo])
                inicio_t = grupo[0]["start"]
                fim_t = grupo[-1]["end"]
                
                # Garantir limites seguros
                if inicio_t >= duracao_final:
                    break
                fim_t = min(fim_t, duracao_final)
                if fim_t - inicio_t <= 0:
                    continue

                texto_formatado_grupo = "\n".join(textwrap.wrap(texto_grupo.upper(), width=14))
                txt_dinamico = (
                    TextClip(
                        font=FONT_PATH, text=texto_formatado_grupo, font_size=80,
                        color="yellow", stroke_color="black", stroke_width=6,
                        method="label", text_align="center", margin=(25, 25)
                    )
                    .with_position(("center", 0.75), relative=True)
                )
                
                # Compatibilidade MoviePy 2 e 1
                if hasattr(txt_dinamico, "with_start"):
                    txt_dinamico = txt_dinamico.with_start(inicio_t).with_end(fim_t)
                else:
                    txt_dinamico = txt_dinamico.set_start(inicio_t).set_end(fim_t)
                    
                clips_legenda.append(txt_dinamico)

        # 9. Compor vídeo final
        elementos = [video_com_audio]
        if txt_hook:
            elementos.append(txt_hook)
        elementos.extend(clips_legenda)
        video_final = CompositeVideoClip(elementos)

        # 10. Renderizar (preset medium = melhor compressão, arquivos ~50% menores)
        video_final.write_videofile(
            str(output_path),
            fps=30,
            codec="libx264",
            audio_codec="aac",
            preset="medium",
            logger=None,
        )
        return True

    except Exception as e:
        print(f"[ERRO EDICAO] {e}")
        return False

    finally:
        # Garantia: fecha TODOS os clips independentemente de erro para liberar RAM e arquivo
        fechar_clips(*clips_brutos, audio_ia, video_final, video_base, video_cortado, video_com_audio)
        if txt_hook: fechar_clips(txt_hook)
        fechar_clips(*clips_legenda)
        fechar_clips(*segmentos)

# ─── Processamento por Produto ───────────────────────────────────────────────

async def processar_produto(nicho: str, produto_nome: str, bruto_nome: str) -> dict:
    """
    bruto_nome pode ser:
      - "mop_bruto.mp4"         → arquivo único
      - "mop_bruto"             → pasta com vários clipes
    Retorna dict com contagem de sucessos e falhas.
    """
    sucessos_produto = 0
    falhas_produto   = 0
    caminho_bruto = DIR_BRUTOS / bruto_nome

    if not caminho_bruto.exists():
        print(f"[AVISO] Bruto '{bruto_nome}' não encontrado em produtos_brutos/. Produto ignorado.")
        return {"sucessos": 0, "falhas": 0}

    # Pausa de 5 segundos entre as requisições de cada produto para não estourar limite da API
    time.sleep(5)
    roteiros = gerar_roteiros_gemini(produto_nome, nicho, quantidade=VIDEOS_POR_PRODUTO)

    # Pasta de saída para este produto
    pasta_saida = DIR_PRONTOS / nicho / produto_nome.replace(" ", "_")
    pasta_saida.mkdir(parents=True, exist_ok=True)

    for i, roteiro in enumerate(roteiros, start=1):
        print(f"\n--- Video {i}/{len(roteiros)} - {produto_nome} ---")
        hook      = roteiro.get("hook_texto", "Confira isso!")
        narracao  = roteiro.get("narracao", "")

        if not narracao.strip():
            print("[AVISO] Narração vazia, pulando este roteiro.")
            continue

        # Arquivo de saída com timestamp para nunca sobrescrever vídeos anteriores
        data_hora = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_tmp  = pasta_saida / f".temp_audio_{i}.mp3"
        output_mp4 = pasta_saida / f"TikTok_Post_{i}_{data_hora}.mp4"

        try:
            if nicho != "Moda":
                palavras = await gerar_audio_tts(narracao, audio_tmp)
            else:
                palavras = []
                
            sucesso = montar_video(caminho_bruto, audio_tmp, hook, palavras, output_mp4, nicho)

            if sucesso:
                # Salva a legenda gerada pela IA em um arquivo de texto ao lado do vídeo
                legenda = roteiro.get("legenda_post", "Siga nossa página para mais ofertas! #promocao")
                txt_path = output_mp4.with_suffix(".txt")
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(legenda)

                print(f"[OK] Video e legenda salvos: {output_mp4.name}")
                sucessos_produto += 1
            else:
                print(f"[ERRO] Falha ao montar video {i} de {produto_nome}.")
                falhas_produto += 1

        finally:
            # Sempre limpa o áudio temporário
            if audio_tmp.exists():
                audio_tmp.unlink()

        time.sleep(1)  # Evita throttle da API Gemini

    return {"sucessos": sucessos_produto, "falhas": falhas_produto}

# ─── Entrada Principal ────────────────────────────────────────────────────────

async def iniciar_maquina() -> None:
    print("=" * 55)
    print("   MAQUINA DE VIDEOS TIKTOK   ")
    print("=" * 55)

    # Verifica se tudo está configurado antes de começar
    validar_prerequisitos()

    # ── CONFIGURE SEUS PRODUTOS AQUI ──
    # "arquivo_bruto" pode ser:
    #   - um arquivo:  "mop_bruto.mp4"
    #   - uma pasta:   "mop_bruto"   (coloque vários clipes dentro)
    produtos = [
        {"nicho": "Utilidades", "nome": "Umidificador de Ar",     "arquivo_bruto": "1_bruto"},
        {"nicho": "Utilidades", "nome": "Lampada Led de Sensor",  "arquivo_bruto": "2_bruto"},
        {"nicho": "Utilidades", "nome": "Tapa Olho com Fone",     "arquivo_bruto": "3_bruto"},
        {"nicho": "Moda", "nome": "Calca Feminina Marrom",             "arquivo_bruto": "50_bruto"},
        {"nicho": "Moda", "nome": "Jaqueta Branca Feminina Aveludada", "arquivo_bruto": "51_bruto"},
        {"nicho": "Moda", "nome": "Camisa Basica Feminina Branca",     "arquivo_bruto": "52_bruto"},
    ]

    sucessos = 0
    falhas   = 0

    for prod in produtos:
        resultado = await processar_produto(prod["nicho"], prod["nome"], prod["arquivo_bruto"])
        sucessos += resultado["sucessos"]
        falhas   += resultado["falhas"]

    print("\n" + "=" * 55)
    print(f"  RESUMO: {sucessos} videos gerados com SUCESSO  |  {falhas} FALHAS")
    print("  Abra a pasta 'prontos_para_postar' para ver os videos!")
    print("=" * 55)


if __name__ == "__main__":
    asyncio.run(iniciar_maquina())
