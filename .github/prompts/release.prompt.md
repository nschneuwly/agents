---
description: Bereitet einen Patch-Release vor — prüft Working Tree, bumpt Version, ergänzt CHANGELOG, staged alles. KEIN Commit, KEIN Tag, KEIN Push.
---

# Release (Patch) — Prepare only

Drei Schritte. Führe die PowerShell-Blöcke 1:1 als Einzeiler aus. Dein einziger Denk-Schritt ist die Changelog-Kuration.

## Schritt 1 — Pre-Flight + Plan

```powershell
$d = git status --porcelain; if ($d) { Write-Error "Working Tree nicht clean:`n$d"; return }; $cur = (Get-Content package.json -Raw | ConvertFrom-Json).version; $p = $cur.Split('.'); $next = "$($p[0]).$($p[1]).$([int]$p[2] + 1)"; $base = git log --grep="^VERSION " -1 --pretty=format:"%H" 2>$null; if ($base) { $commits = git log "$base..HEAD" --pretty=format:"%h %s" --no-merges; $since = "letzter VERSION-Commit ($($base.Substring(0,7)))" } else { $commits = git log -20 --pretty=format:"%h %s" --no-merges; $since = "(noch kein VERSION-Commit - letzte 20)" }; Write-Host "Current: $cur  ->  Next: $next"; Write-Host "Since: $since"; Write-Host "--- Commits ---"; Write-Host $commits; Write-Host "--- CHANGELOG (head) ---"; if (Test-Path src/public/CHANGELOG.md) { Get-Content src/public/CHANGELOG.md -TotalCount 8 } else { Write-Host "(leer / nicht vorhanden)" }
```

Bei Working-Tree-Fehler **abbrechen**.

## Schritt 2 — CHANGELOG-Eintrag schreiben

Bearbeite `src/public/CHANGELOG.md`. Füge direkt unter `# Changelog` einen neuen `## <next>`-Block ein. Nutze passende `### Added` / `### Fixed` / `### Changed`-Kategorien (nur die mit Inhalt).

- Prägnante, nutzerorientierte Bullets. Verwandte Commits zusammenfassen.
- Rein interne Änderungen (Format, CI, Doc-Typos) weglassen.
- Sprache am bestehenden Changelog orientieren.

## Schritt 3 — Bump + Stage

```powershell
npm version patch --no-git-tag-version | Out-Null; git add src/public/CHANGELOG.md package.json; if (Test-Path package-lock.json) { git add package-lock.json }; git status --short
```

Fertig. Dem User die neue Version melden und ihn auf die SCM-Box zum Committen verweisen.

**Pushe NICHT. Committe NICHT. Tagge NICHT.**
