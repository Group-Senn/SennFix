# setup-emulator-tunnel.ps1
# Script para configurar la redirección de puertos hacia el emulador de Android Studio

$adbPath = "c:\Users\java2\AppData\Local\Android\Sdk\platform-tools\adb.exe"

if (-not (Test-Path $adbPath)) {
    Write-Error "No se encontró adb.exe en la ruta: $adbPath"
    exit 1
}

Write-Host "Buscando dispositivos Android conectados..." -ForegroundColor Cyan
$devices = & $adbPath devices | Select-String -Pattern "device$"

if ($devices.Count -eq 0) {
    Write-Host "No se encontraron emuladores o dispositivos conectados activos." -ForegroundColor Yellow
    Write-Host "Por favor, inicia tu emulador 'Pixel_8_Pro_API_34' desde Android Studio e inténtalo de nuevo." -ForegroundColor Yellow
    exit 1
}

$success = $false

foreach ($deviceLine in $devices) {
    $deviceId = ($deviceLine -split "`t")[0]
    
    # Intentamos comprobar si responde a comandos básicos para descartar emuladores congelados o BlueStacks que bloqueen
    $bootCompleted = & $adbPath -s $deviceId shell getprop sys.boot_completed 2>$null
    
    # Comprobar si es un emulador real y responde al shell
    $testShell = & $adbPath -s $deviceId shell echo "test" 2>$null
    
    if ($testShell -eq "test") {
        Write-Host "Dispositivo activo encontrado: $deviceId" -ForegroundColor Green
        Write-Host "Aplicando redirección de puertos..." -ForegroundColor Cyan
        
        # Aplicamos la redirección
        & $adbPath -s $deviceId reverse tcp:5173 tcp:5173 2>$null
        & $adbPath -s $deviceId reverse tcp:3000 tcp:3000 2>$null
        
        # Verificar
        $list = & $adbPath -s $deviceId reverse --list
        if ($list -like "*tcp:5173*") {
            Write-Host "[OK] Puerto 5173 (Frontend) redireccionado con exito a $deviceId" -ForegroundColor Green
            Write-Host "[OK] Puerto 3000 (Backend) redireccionado con exito a $deviceId" -ForegroundColor Green
            $success = $true
        }
    } else {
        Write-Host "Ignorando dispositivo incompatible o bloqueado: $deviceId (probablemente BlueStacks o iniciando)" -ForegroundColor Gray
    }
}

if ($success) {
    Write-Host "`n¡Todo listo! Abre el navegador Chrome en tu emulador e ingresa a: http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "`nNo se pudo redireccionar en ningún emulador activo. Asegúrate de iniciar tu emulador en Android Studio." -ForegroundColor Red
}
