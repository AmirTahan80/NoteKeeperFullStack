param(
    [int]$Port = 5127,
    [int]$PostgresPort = 55432
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$postgresBin = Get-ChildItem 'C:\Program Files\PostgreSQL' -Recurse -Filter initdb.exe -ErrorAction Stop |
    Select-Object -First 1 -ExpandProperty DirectoryName

if (-not $postgresBin) {
    throw 'PostgreSQL command-line tools were not found.'
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("notekeeper-e2e-" + [Guid]::NewGuid().ToString('N'))
$dataPath = Join-Path $tempRoot 'postgres'
$publishPath = Join-Path $tempRoot 'publish'
$postgresLog = Join-Path $tempRoot 'postgres.log'
$serverOut = Join-Path $tempRoot 'server.out.log'
$serverError = Join-Path $tempRoot 'server.error.log'
$downloadPath = Join-Path $tempRoot 'downloaded-file'
$serverProcess = $null
$postgresStarted = $false

try {
    Write-Host 'Creating an isolated PostgreSQL cluster...'
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null

    & (Join-Path $postgresBin 'initdb.exe') -D $dataPath -U notekeeper -A trust --no-locale | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'initdb failed.' }

    & (Join-Path $postgresBin 'pg_ctl.exe') -D $dataPath -o "-p $PostgresPort -h 127.0.0.1" -l $postgresLog start
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL failed to start.' }
    $postgresStarted = $true

    & (Join-Path $postgresBin 'createdb.exe') -h 127.0.0.1 -p $PostgresPort -U notekeeper notekeeper
    if ($LASTEXITCODE -ne 0) { throw 'Test database creation failed.' }

    Write-Host 'Publishing the application...'
    & dotnet publish (Join-Path $repoRoot 'NoteBookKeeper.Api\NoteBookKeeper.Api.csproj') -c Release -o $publishPath --nologo | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Server publish failed.' }

    $webRoot = Join-Path $publishPath 'wwwroot'
    New-Item -ItemType Directory -Path $webRoot -Force | Out-Null
    Copy-Item -Path (Join-Path $repoRoot 'ClientApp\dist\NoteKeeper\*') -Destination $webRoot -Recurse -Force

    $env:ConnectionStrings__DefaultConnection = "Host=127.0.0.1;Port=$PostgresPort;Database=notekeeper;Username=notekeeper"
    $env:Jwt__Key = 'e2e-test-key-with-at-least-thirty-two-characters-1234567890'
    $env:Jwt__Issuer = 'NoteKeeper'
    $env:Jwt__Audience = 'NoteKeeper'
    $env:ASPNETCORE_ENVIRONMENT = 'Production'
    $env:ASPNETCORE_URLS = "http://127.0.0.1:$Port"

    Write-Host 'Starting the web application...'
    $serverProcess = Start-Process dotnet `
        -ArgumentList (Join-Path $publishPath 'NoteBookKeeper.Api.dll') `
        -WorkingDirectory $publishPath `
        -RedirectStandardOutput $serverOut `
        -RedirectStandardError $serverError `
        -WindowStyle Hidden `
        -PassThru

    $baseUrl = "http://127.0.0.1:$Port"
    $healthy = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $health = Invoke-WebRequest "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 2
            if ($health.StatusCode -eq 200) {
                $healthy = $true
                break
            }
        }
        catch {
            Start-Sleep -Milliseconds 500
        }
    }
    if (-not $healthy) { throw 'The web app did not become healthy.' }

    Write-Host 'Running API and authorization checks...'
    $homeResponse = Invoke-WebRequest $baseUrl -UseBasicParsing
    if ($homeResponse.Content -notmatch '<app-root') { throw 'Angular index.html was not served.' }

    $suffix = [Guid]::NewGuid().ToString('N').Substring(0, 8)
    $firstUser = "owner-$suffix"
    $secondUser = "other-$suffix"
    $password = 'TestPassword!123'

    foreach ($userName in @($firstUser, $secondUser)) {
        $registerBody = @{
            userName = $userName
            email = "$userName@example.test"
            password = $password
            rePassword = $password
        } | ConvertTo-Json
        Invoke-RestMethod "$baseUrl/api/User/register" -Method Post -ContentType 'application/json' -Body $registerBody
    }

    $publicProfileResponse = Invoke-WebRequest "$baseUrl/api/User/public/$firstUser" -UseBasicParsing
    $publicProfile = $publicProfileResponse.Content | ConvertFrom-Json
    $publicProperties = @($publicProfile.PSObject.Properties.Name)
    if ($publicProfile.userName -ne $firstUser) {
        throw 'The public profile did not return the expected username.'
    }
    if ($publicProperties.Count -ne 1 -or $publicProperties[0] -ne 'userName') {
        throw "The public profile exposed unexpected fields: $($publicProperties -join ', ')."
    }
    if ($publicProfileResponse.Content -match [Regex]::Escape("$firstUser@example.test")) {
        throw 'The public profile exposed the user email address.'
    }

    function Get-TestToken([string]$UserName) {
        $body = @{ userName = $UserName; password = $password } | ConvertTo-Json
        $loginResponse = Invoke-RestMethod "$baseUrl/api/User/Login" -Method Post -ContentType 'application/json' -Body $body
        if ($loginResponse.userName -ne $UserName) {
            throw 'Login did not return the public username.'
        }
        return $loginResponse.token
    }

    $ownerToken = Get-TestToken $firstUser
    $otherToken = Get-TestToken $secondUser
    $ownerHeaders = @{ Authorization = "Bearer $ownerToken" }
    $otherHeaders = @{ Authorization = "Bearer $otherToken" }

    $topicBody = @{ topic = 'E2E topic'; description = 'Created by the automated smoke test.' } | ConvertTo-Json
    Invoke-RestMethod "$baseUrl/api/AddNote/CreateNoteSetting" -Method Post -Headers $ownerHeaders -ContentType 'application/json' -Body $topicBody

    $topics = Invoke-RestMethod "$baseUrl/api/AddNote/GetNotes?pageNumber=1&pageSize=10" -Headers $ownerHeaders
    if ($topics.totalCount -ne 1) { throw 'Topic pagination returned an unexpected count.' }
    $topicId = $topics.items[0].uuid

    $favicon = Join-Path $repoRoot 'ClientApp\public\favicon.ico'
    & curl.exe --silent --show-error --fail `
        -H "Authorization: Bearer $ownerToken" `
        -F 'detail=E2E note' `
        -F 'searchWords=smoke-test' `
        -F "noteSettingId=$topicId" `
        -F "files=@$favicon;type=image/x-icon" `
        "$baseUrl/api/AddNote/CreateNoteItem"
    if ($LASTEXITCODE -ne 0) { throw 'Note item creation failed.' }

    $items = @(Invoke-RestMethod "$baseUrl/api/AddNote/GetNoteItems/$topicId" -Headers $ownerHeaders)
    if ($items.Count -ne 1 -or $items[0].filePaths.Count -ne 1) { throw 'The created note or attachment was not returned.' }
    $filePath = @($items[0].filePaths)[0]
    $fileUrl = $baseUrl + $filePath

    $unauthorizedStatus = & curl.exe --silent --output NUL --write-out '%{http_code}' $fileUrl
    if ($unauthorizedStatus -ne '401') { throw "Attachment without a token returned $unauthorizedStatus instead of 401." }

    & curl.exe --silent --show-error --fail -H "Authorization: Bearer $ownerToken" -o $downloadPath $fileUrl
    if ($LASTEXITCODE -ne 0 -or (Get-Item $downloadPath).Length -eq 0) { throw 'Authorized attachment download failed.' }

    try {
        Invoke-WebRequest "$baseUrl/api/AddNote/GetNoteItems/$topicId" -Headers $otherHeaders -UseBasicParsing | Out-Null
        throw 'A different user was able to read the owner''s notes.'
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
    }

    $deleteStaleUserSql = "DO `$`$ BEGIN EXECUTE format('DELETE FROM %I WHERE %I = %L', 'Users', 'NormalizedUserName', '$($secondUser.ToUpperInvariant())'); END `$`$;"
    & (Join-Path $postgresBin 'psql.exe') `
        -h 127.0.0.1 `
        -p $PostgresPort `
        -U notekeeper `
        -d notekeeper `
        -c $deleteStaleUserSql | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not prepare the stale-session check.' }

    try {
        Invoke-WebRequest `
            "$baseUrl/api/AddNote/CreateNoteSetting" `
            -Method Post `
            -Headers $otherHeaders `
            -ContentType 'application/json' `
            -Body $topicBody `
            -UseBasicParsing | Out-Null
        throw 'A token for a missing user was accepted.'
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw }
    }

    [PSCustomObject]@{
        Health = 'Healthy'
        Angular = 'Served'
        Registration = 'Passed'
        Login = 'Passed'
        PublicProfilePrivacy = 'Passed'
        NoteAndAttachment = 'Passed'
        OwnershipIsolation = 'Passed'
        StaleSessionHandling = 'Passed'
    } | Format-List
}
catch {
    if (Test-Path $serverError) { Get-Content $serverError }
    if (Test-Path $serverOut) { Get-Content $serverOut }
    throw
}
finally {
    if ($serverProcess -and -not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force
    }
    if ($postgresStarted) {
        & (Join-Path $postgresBin 'pg_ctl.exe') -D $dataPath stop -m fast
    }

    $resolvedTemp = [System.IO.Path]::GetFullPath($tempRoot)
    $systemTemp = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
    $tempLeaf = Split-Path $resolvedTemp -Leaf
    $safeToRemove = $resolvedTemp.StartsWith($systemTemp, [StringComparison]::OrdinalIgnoreCase) -and $tempLeaf.StartsWith('notekeeper-e2e-')
    if ($safeToRemove) {
        Remove-Item -LiteralPath $resolvedTemp -Recurse -Force -ErrorAction SilentlyContinue
    }
}
