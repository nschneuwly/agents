# Setup Copilot — Skills/Prompts/Instructions global registrieren

Dieser Prompt wird **einmal pro Kollege** ausgeführt, **innerhalb dieses Repos**. Er registriert die `.github/`-Ordner dieses Repos in den VS Code User-Settings, damit Skills/Prompts/Instructions in **allen** Workspaces verfügbar sind.

## Was dieser Prompt tut

1. Ermittelt den absoluten Pfad dieses Repos
2. Prüft, dass `.github/skills/`, `.github/prompts/` und `.github/instructions/` existieren (vorhandene werden registriert, fehlende übersprungen)
3. Aktualisiert `%APPDATA%\Code\User\settings.json`:
   - `chat.promptFilesLocations` → `<repo>/.github/prompts`
   - `chat.instructionsFilesLocations` → `<repo>/.github/instructions`
   - `chat.modeFilesLocations` (für Skills) → `<repo>/.github/skills`
4. Idempotent — kann beliebig oft ausgeführt werden
5. Zeigt am Ende eine Verifikation: welche Pfade aktiv sind und wie viele Dateien drin liegen

## Ausführung

Führe folgenden PowerShell-Einzeiler aus. Der Prompt darf **nicht** einfach den Pfad raten — er muss `git rev-parse --show-toplevel` benutzen, damit auch funktioniert wenn der User in einem Unterordner steht.

```powershell
$ErrorActionPreference = 'Stop'
$repo = (git rev-parse --show-toplevel) -replace '/', '\'
if (-not (Test-Path "$repo\.github")) { Write-Error "Kein .github-Ordner gefunden unter $repo"; return }
$settingsFile = "$env:APPDATA\Code\User\settings.json"
if (-not (Test-Path $settingsFile)) { New-Item -ItemType File -Path $settingsFile -Force | Out-Null; '{}' | Set-Content $settingsFile -Encoding UTF8 }
$raw = Get-Content $settingsFile -Raw
$settings = if ([string]::IsNullOrWhiteSpace($raw)) { [ordered]@{} } else { $raw | ConvertFrom-Json -AsHashtable }
$map = @{
    'chat.promptFilesLocations'       = "$repo\.github\prompts"
    'chat.instructionsFilesLocations' = "$repo\.github\instructions"
    'chat.modeFilesLocations'         = "$repo\.github\skills"
}
foreach ($key in $map.Keys) {
    $path = $map[$key]
    if (-not (Test-Path $path)) { Write-Host "skip  $key  (Ordner fehlt: $path)" -ForegroundColor DarkGray; continue }
    if (-not $settings.ContainsKey($key)) { $settings[$key] = [ordered]@{} }
    $settings[$key][$path] = $true
    Write-Host "✓ $key → $path" -ForegroundColor Green
}
$settings | ConvertTo-Json -Depth 20 | Set-Content $settingsFile -Encoding UTF8
Write-Host ""
Write-Host "→ VS Code neu starten, damit die Settings greifen."
Write-Host ""
Write-Host "Verifikation:"
foreach ($key in $map.Keys) {
    if (-not $settings.ContainsKey($key)) { continue }
    foreach ($p in $settings[$key].Keys) {
        $count = if (Test-Path $p) { (Get-ChildItem $p -Recurse -File -ErrorAction SilentlyContinue).Count } else { 0 }
        $mark = if (Test-Path $p) { '✓' } else { '✗' }
        Write-Host "  $mark  $p  ($count files)" -ForegroundColor Cyan
    }
}
```

## Nach erfolgreicher Ausführung

- VS Code neu starten
- Im Copilot-Chat unten prüfen ob die Skills/Prompts/Instructions geladen sind
- Test: Befehl `/release` (oder ein anderer Prompt aus diesem Repo) sollte in **jedem** Workspace verfügbar sein

## Updates der Skills

Wenn Verbesserungen an Skills/Prompts/Instructions in diesem Repo committed werden:

```powershell
cd <pfad-zu-diesem-repo>
git pull
```

Die Settings müssen **nicht** neu gesetzt werden — sie zeigen weiterhin auf die gleichen Ordner.

## Deinstallation

Falls jemand die globale Registrierung wieder loswerden will:
- `%APPDATA%\Code\User\settings.json` öffnen
- Aus `chat.promptFilesLocations`, `chat.instructionsFilesLocations`, `chat.modeFilesLocations` die Einträge mit Pfad zu diesem Repo entfernen
- VS Code neu starten
