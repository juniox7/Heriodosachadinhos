# 🤖 Máquina de Vídeos UGC (TikTok / Shorts)

Um gerador automático de vídeos curtos projetado para escalar a produção de e-commerce. Ele cria variações infinitas de vídeos a partir de clipes crus, gerando roteiros com IA, narração hiper-realista, edição com cortes rápidos, legendas dinâmicas (estilo Karaokê) e formatação perfeita para alta retenção.

---

## 📂 Estrutura de Pastas

Para a máquina funcionar perfeitamente, a estrutura deve ser mantida assim:

```text
vantti-content-machine/
│
├── gerador_tiktok.py          # O Cérebro (Script Principal)
├── Montserrat-Bold.ttf        # Fonte usada nas legendas (Não apagar)
├── .env                       # Arquivo oculto com a sua GEMINI_API_KEY
│
├── produtos_brutos/           # VOCÊ COLOCA OS VÍDEOS AQUI
│   ├── 1_bruto/               # Vídeos originais do Produto 1
│   ├── 2_bruto/               # Vídeos originais do Produto 2
│   └── 3_bruto/               # Vídeos originais do Produto 3
│
└── prontos_para_postar/       # A MÁQUINA SALVA OS VÍDEOS AQUI (Automático)
    ├── Utilidades/
    │   ├── Umidificador_de_Ar/
    │   │   ├── TikTok_Post_1.mp4  (Vídeo Final)
    │   │   └── TikTok_Post_1.txt  (Legenda para o post com hashtags)
```

---

## ⚙️ Como Funciona a Nova Engenharia

### 1. Copywriting Avançado (Gemini)
A máquina conecta na API do Google Gemini para gerar Roteiros Curtos (25 a 35 palavras).
- **Framework P.A.S.:** Cada vídeo segue estritamente a fórmula **Problema, Agitação, Solução**, criando ganchos dolorosos e altíssima retenção nos primeiros 3 segundos.
- **Proteção Anti-Bloqueio:** Timeout de 30s implementado e pausa de `5 segundos` entre requisições.
- **Rede de Segurança (Fallback):** Se o Google falhar, o script aciona um banco de roteiros virais genéricos e garante a entrega do vídeo.

### 2. Narração Neural Acelerada (Edge TTS)
O texto gerado vira locução quase idêntica à humana.
- **Vozes Dinâmicas:** A cada vídeo gerado, a máquina sorteia aleatoriamente entre vozes masculinas e femininas (`Francisca`, `Antonio`, `Thalita`).
- **Aceleração TikTok:** O áudio é gerado 15% mais rápido por padrão para ditar um ritmo frenético ao vídeo.
- **Robustez:** Conta com sistema de *Retry Automático* duplo caso a rede do usuário oscile.

### 3. Edição com Retenção Viral (MoviePy)
- **Jump Cuts:** Os clipes não são mais estáticos. A máquina picota e embaralha cenas cortando cada pedaço com duração variando entre 1.5s e 2.5s.
- **Efeito Zoom (Movimento Falso):** 50% de chance de cada corte receber um leve zoom em `85%` para dar sensação de câmera em movimento constante.
- **Auto-Corte Vertical:** Força qualquer formato de vídeo original a virar `9:16 (1080x1920)`.
- **Limpeza Inteligente:** Filtra vídeos crus muito curtos (< 1s) para evitar quebras de frame e remove o áudio original.
- **Otimização de Tamanho:** Usa o preset de compressão `medium`, gerando vídeos ultra leves (~3MB a 5MB) ideais para upload em massa.

### 4. Textos e Legendas Karaokê
- **Hook Superior:** Uma frase isca fixada no topo da tela, com empacotamento (`textwrap` em 14 caracteres) e blindagem de margem, impedindo cortes acidentais de tela no TikTok/Reels.
- **Legendas Dinâmicas no Eixo Inferior:** Grupos de 3 palavras pulando no centro-inferior (marca Y de 75%), na janela de leitura natural do usuário, sem tapar botões ou a cena principal.
- **Sincronia Matemática Perfeita:** A lógica do script calcula o timing exato multiplicando a velocidade por `0.95x`, forçando as legendas Karaokê a brotarem frações de segundo *antes* da pronúncia da locução. Isso destrói completamente qualquer atraso na leitura e mantém o cérebro hipnotizado na imagem.

---

## 🚀 Como Usar e Configurar

Sempre que quiser adicionar um **produto novo**, abra o arquivo `gerador_tiktok.py` (linha ~450) e adicione uma nova linha na lista de produtos, apontando para a pasta onde você jogou os clipes crus:

```python
    produtos = [
        {"nicho": "Utilidades", "nome": "Umidificador de Ar",     "arquivo_bruto": "1_bruto"},
        {"nicho": "Utilidades", "nome": "Lampada Led de Sensor",  "arquivo_bruto": "2_bruto"},
        # Exemplo de produto novo:
        {"nicho": "Casa",       "nome": "Vassoura Magica",        "arquivo_bruto": "4_bruto"},
    ]
```

Para decidir **quantos vídeos gerar** por produto a cada "Fornada", basta mudar a constante na linha 27:
```python
VIDEOS_POR_PRODUTO = 3  # Mude para 10, 20 ou quantos quiser para escalar!
```

**Para rodar a máquina de fato:**
Abra o terminal dentro desta pasta e ordene a produção:
```bash
python gerador_tiktok.py
```
O console vai atualizar o status em tempo real com todos os avisos blindados. Ao finalizar, seus vídeos otimizados estarão esperando na pasta `prontos_para_postar`.
