$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outputRoot = Join-Path $PSScriptRoot "dist"
$expectedOutput = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "dist"))
$resolvedOutput = [System.IO.Path]::GetFullPath($outputRoot)

if ($resolvedOutput -ne $expectedOutput -or (Split-Path $resolvedOutput -Leaf) -ne "dist") {
  throw "Refusing to prepare an unexpected desktop output directory: $resolvedOutput"
}

if (Test-Path -LiteralPath $resolvedOutput) {
  Remove-Item -LiteralPath $resolvedOutput -Recurse -Force
}
New-Item -ItemType Directory -Path $resolvedOutput | Out-Null

$assets = @(
  "styles.css",
  "data.js",
  "big-five.js",
  "big-five-italy.js",
  "big-five-germany.js",
  "big-five-france.js",
  "season-players.js",
  "season-data.js",
  "storage.js",
  "player-identity.js",
  "european-clubs.js",
  "simulation-core.js",
  "position-fit.js",
  "challenge-data.js",
  "app.js"
)

Copy-Item -LiteralPath (Join-Path $projectRoot "global 38-0.html") -Destination (Join-Path $resolvedOutput "index.html")
foreach ($asset in $assets) {
  Copy-Item -LiteralPath (Join-Path $projectRoot $asset) -Destination (Join-Path $resolvedOutput $asset)
}

$historyOutput = Join-Path $resolvedOutput "history-data"
New-Item -ItemType Directory -Path $historyOutput | Out-Null
Copy-Item -Path (Join-Path $projectRoot "history-data\*.js") -Destination $historyOutput

$copiedFiles = Get-ChildItem -LiteralPath $resolvedOutput -Recurse -File
$copiedBytes = ($copiedFiles | Measure-Object -Property Length -Sum).Sum
Write-Host ("Prepared {0} desktop assets ({1:N2} MiB)." -f $copiedFiles.Count, ($copiedBytes / 1MB))
