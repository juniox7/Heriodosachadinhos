param(
    [Parameter(Position = 0)]
    [string]$Imagem,

    [int]$Largura = 448,
    [int]$Altura = 768,
    [long]$Seed = 0
)

$ErrorActionPreference = "Stop"

$ComfyRoot = "C:\ComfyUI-ROCm-native"
$InputRoot = Join-Path $ComfyRoot "input\LTX_TESTE_MODELO"
$OutputRoot = Join-Path $ComfyRoot "output"
$BaseUrl = "http://127.0.0.1:8189"
$CachePath = Join-Path $ComfyRoot "temp\ltx_conditioning_cache\fashion_exact_outfit_subtle_motion.pt"

if (-not (Test-Path -LiteralPath $CachePath)) {
    throw "O cache de texto do LTX nao foi encontrado: $CachePath"
}

if ([string]::IsNullOrWhiteSpace($Imagem)) {
    $arquivo = Get-ChildItem -LiteralPath $InputRoot -File |
        Where-Object { $_.Extension -match '^\.(png|jpg|jpeg|webp)$' } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $arquivo) {
        throw "Coloque uma imagem em $InputRoot e execute novamente."
    }
    $Imagem = $arquivo.FullName
}

$Imagem = (Resolve-Path -LiteralPath $Imagem).Path
$InputRoot = (Resolve-Path -LiteralPath $InputRoot).Path.TrimEnd('\')

if (-not $Imagem.StartsWith($InputRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    $nome = [System.IO.Path]::GetFileName($Imagem)
    $destino = Join-Path $InputRoot $nome
    if (Test-Path -LiteralPath $destino) {
        $baseNome = [System.IO.Path]::GetFileNameWithoutExtension($nome)
        $extensao = [System.IO.Path]::GetExtension($nome)
        $destino = Join-Path $InputRoot ("{0}_{1}{2}" -f $baseNome, (Get-Date -Format 'yyyyMMdd_HHmmss'), $extensao)
    }
    Copy-Item -LiteralPath $Imagem -Destination $destino
    $Imagem = (Resolve-Path -LiteralPath $destino).Path
}

$ImagemRelativa = $Imagem.Substring($InputRoot.Length).TrimStart('\').Replace('\', '/')
$ImagemComfy = "LTX_TESTE_MODELO/$ImagemRelativa"
$nomeBase = [System.IO.Path]::GetFileNameWithoutExtension($Imagem)
$nomeSeguro = [regex]::Replace($nomeBase, '[^A-Za-z0-9_-]', '_')
if ([string]::IsNullOrWhiteSpace($nomeSeguro)) { $nomeSeguro = "video_moda" }

if ($Seed -eq 0) {
    $Seed = Get-Random -Minimum 1 -Maximum 2147483647
}

try {
    $fila = Invoke-RestMethod -Uri "$BaseUrl/queue" -Method Get -TimeoutSec 10
} catch {
    throw "O ComfyUI nao esta respondendo na porta 8189. Abra o ComfyUI novo e tente de novo."
}

if ($fila.queue_running.Count -gt 0 -or $fila.queue_pending.Count -gt 0) {
    throw "Ja existe uma geracao rodando no ComfyUI. Aguarde ela terminar."
}

Invoke-RestMethod -Uri "$BaseUrl/free" -Method Post -ContentType "application/json" `
    -Body '{"unload_models":true,"free_memory":true}' -TimeoutSec 15 | Out-Null
Start-Sleep -Seconds 2

$workflow = @{
    '1'  = @{ class_type = 'CheckpointLoaderSimple'; inputs = @{ ckpt_name = 'ltxv-2b-0.9.6-distilled-04-25.safetensors' } }
    '2'  = @{ class_type = 'LTXConditioningCacheLoad'; inputs = @{ filename = 'fashion_exact_outfit_subtle_motion' } }
    '3'  = @{ class_type = 'LoadImage'; inputs = @{ image = $ImagemComfy } }
    '4'  = @{ class_type = 'LTXVPreprocess'; inputs = @{ image = @('3', 0); img_compression = 0 } }
    '5'  = @{ class_type = 'LTXVImgToVideo'; inputs = @{ positive = @('2', 0); negative = @('2', 1); vae = @('1', 2); image = @('4', 0); width = $Largura; height = $Altura; length = 81; batch_size = 1; strength = 1.0 } }
    '6'  = @{ class_type = 'LTXVConditioning'; inputs = @{ positive = @('5', 0); negative = @('5', 1); frame_rate = 12.0 } }
    '7'  = @{ class_type = 'ManualSigmas'; inputs = @{ sigmas = '1.0000, 0.9937, 0.9875, 0.9812, 0.9750, 0.9094, 0.7250, 0.4219, 0.0' } }
    '8'  = @{ class_type = 'KSamplerSelect'; inputs = @{ sampler_name = 'euler_ancestral' } }
    '9'  = @{ class_type = 'CFGGuider'; inputs = @{ model = @('1', 0); positive = @('6', 0); negative = @('6', 1); cfg = 1.0 } }
    '10' = @{ class_type = 'RandomNoise'; inputs = @{ noise_seed = $Seed } }
    '11' = @{ class_type = 'SamplerCustomAdvanced'; inputs = @{ noise = @('10', 0); guider = @('9', 0); sampler = @('8', 0); sigmas = @('7', 0); latent_image = @('5', 2) } }
    '12' = @{ class_type = 'VAEDecodeTiled'; inputs = @{ samples = @('11', 1); vae = @('1', 2); tile_size = 256; overlap = 32; temporal_size = 8; temporal_overlap = 4 } }
    '13' = @{ class_type = 'CreateVideo'; inputs = @{ images = @('12', 0); fps = 12.0; bit_depth = 8 } }
    '14' = @{ class_type = 'SaveVideo'; inputs = @{ video = @('13', 0); filename_prefix = "LTX_MODA/${nomeSeguro}_7s"; format = 'mp4'; codec = 'h264' } }
}

$corpo = @{ prompt = $workflow; client_id = "ltx-moda-automatico" } | ConvertTo-Json -Depth 20 -Compress
$resposta = Invoke-RestMethod -Uri "$BaseUrl/prompt" -Method Post -ContentType "application/json" -Body $corpo -TimeoutSec 30

if ($resposta.node_errors.PSObject.Properties.Count -gt 0) {
    throw "O ComfyUI recusou o workflow: $($resposta.node_errors | ConvertTo-Json -Depth 10)"
}

$promptId = $resposta.prompt_id
$inicio = Get-Date
Write-Host "Gerando 6,75 segundos em ${Largura}x${Altura}. Prompt: $promptId"

while ($true) {
    Start-Sleep -Seconds 2
    $historico = Invoke-RestMethod -Uri "$BaseUrl/history/$promptId" -Method Get -TimeoutSec 10
    $propriedade = $historico.PSObject.Properties[$promptId]
    if ($propriedade) {
        $entrada = $propriedade.Value
        if ($entrada.status.status_str -ne 'success') {
            throw "A geracao terminou com erro. Verifique o painel do ComfyUI."
        }

        $item = $entrada.outputs.'14'.images[0]
        $saida = Join-Path $OutputRoot (Join-Path $item.subfolder $item.filename)
        $tempo = [math]::Round(((Get-Date) - $inicio).TotalSeconds, 1)

        Invoke-RestMethod -Uri "$BaseUrl/free" -Method Post -ContentType "application/json" `
            -Body '{"unload_models":true,"free_memory":true}' -TimeoutSec 15 | Out-Null

        Write-Host "Concluido em $tempo segundos."
        Write-Host "Video: $saida"
        Start-Process -FilePath "explorer.exe" -ArgumentList @('/select,', $saida)
        break
    }

    $decorrido = [math]::Round(((Get-Date) - $inicio).TotalSeconds)
    Write-Host "Processando... $decorrido s"
}
