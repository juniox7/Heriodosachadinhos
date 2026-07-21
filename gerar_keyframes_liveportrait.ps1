param(
    [int]$Inicio = 0,
    [int]$Fim = 27
)

$ErrorActionPreference = "Stop"

$BaseUrl = "http://127.0.0.1:8189"
$ComfyRoot = "C:\ComfyUI-ROCm-native"
$KeyframeDir = Join-Path $ComfyRoot "input\LTX_DRIVING\white_keyframes"
$ProgressPath = Join-Path $ComfyRoot "temp\liveportrait_keyframes_progress.json"

for ($ordem = $Inicio; $ordem -le $Fim; $ordem++) {
    $pad = $ordem.ToString("000")
    $arquivo = Get-ChildItem -LiteralPath $KeyframeDir -Filter "key_${pad}_source_*.png" | Select-Object -First 1
    if (-not $arquivo) {
        throw "Keyframe $pad nao encontrado."
    }

    Invoke-RestMethod -Uri "$BaseUrl/free" -Method Post -ContentType "application/json" `
        -Body '{"unload_models":true,"free_memory":true}' -TimeoutSec 15 | Out-Null
    Start-Sleep -Seconds 2

    $workflow = @{
        '1' = @{ class_type = 'LoadImage'; inputs = @{ image = 'LTX_TESTE_MODELO/ModeloCorpoInteiro_00001_.png' } }
        '2' = @{ class_type = 'LoadImage'; inputs = @{ image = "LTX_DRIVING/white_keyframes/$($arquivo.Name)" } }
        '3' = @{ class_type = 'ImageCrop'; inputs = @{ image = @('2', 0); width = 512; height = 512; x = 0; y = 0 } }
        '4' = @{ class_type = 'DownloadAndLoadLivePortraitModels'; inputs = @{ precision = 'auto'; mode = 'human' } }
        '5' = @{ class_type = 'LivePortraitLoadMediaPipeCropper'; inputs = @{ landmarkrunner_onnx_device = 'CPU'; keep_model_loaded = $false } }
        '6' = @{ class_type = 'LivePortraitCropper'; inputs = @{ pipeline = @('4', 0); cropper = @('5', 0); source_image = @('1', 0); dsize = 512; scale = 2.3; vx_ratio = 0.0; vy_ratio = -0.125; face_index = 0; face_index_order = 'large-small'; rotate = $true } }
        '7' = @{ class_type = 'LivePortraitProcess'; inputs = @{ pipeline = @('4', 0); crop_info = @('6', 1); source_image = @('1', 0); driving_images = @('3', 0); lip_zero = $false; lip_zero_threshold = 0.03; stitching = $true; delta_multiplier = 0.75; mismatch_method = 'constant'; relative_motion_mode = 'single_frame'; driving_smooth_observation_variance = 0.000003; expression_friendly = $false; expression_friendly_multiplier = 1.0 } }
        '8' = @{ class_type = 'LivePortraitComposite'; inputs = @{ source_image = @('1', 0); cropped_image = @('7', 0); liveportrait_out = @('7', 1) } }
        '9' = @{ class_type = 'SaveImage'; inputs = @{ images = @('8', 0); filename_prefix = "LIVEPORTRAIT_KEYFRAMES/white/key_$pad" } }
    }

    $body = @{ prompt = $workflow; client_id = "liveportrait-keyframe-$pad" } | ConvertTo-Json -Depth 30 -Compress
    $res = Invoke-RestMethod -Uri "$BaseUrl/prompt" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 30
    $promptId = $res.prompt_id

    while ($true) {
        Start-Sleep -Seconds 1
        $history = Invoke-RestMethod -Uri "$BaseUrl/history/$promptId" -Method Get -TimeoutSec 10
        $property = $history.PSObject.Properties[$promptId]
        if ($property) {
            $entry = $property.Value
            if ($entry.status.status_str -ne 'success') {
                $message = $entry.status.messages[-1][1].exception_message
                throw "Falha no keyframe $pad`: $message"
            }
            break
        }
    }

    [pscustomobject]@{
        status = 'running'
        completed = $ordem - $Inicio + 1
        total = $Fim - $Inicio + 1
        last_keyframe = $ordem
        updated = (Get-Date).ToString('o')
    } | ConvertTo-Json | Set-Content -LiteralPath $ProgressPath -Encoding UTF8
}

Invoke-RestMethod -Uri "$BaseUrl/free" -Method Post -ContentType "application/json" `
    -Body '{"unload_models":true,"free_memory":true}' -TimeoutSec 15 | Out-Null

[pscustomobject]@{
    status = 'complete'
    completed = $Fim - $Inicio + 1
    total = $Fim - $Inicio + 1
    last_keyframe = $Fim
    updated = (Get-Date).ToString('o')
} | ConvertTo-Json | Set-Content -LiteralPath $ProgressPath -Encoding UTF8
