$ErrorActionPreference='SilentlyContinue'
$root='c:\Users\saiku\OneDrive\Desktop\THub\THub-App-Dev-0.1'
$log='server-auth-inline.log'
if(Test-Path $log){Remove-Item $log -Force}

$proc = Start-Process cmd -ArgumentList '/c pnpm --filter "./packages/server" start > server-auth-inline.log 2>&1' -WorkingDirectory $root -PassThru
Start-Sleep -Seconds 2

$activePort=$null
for($i=0;$i -lt 60;$i++){
  foreach($p in 2000,3000){
    try {
      $r=Invoke-WebRequest -Uri "http://localhost:$p/api/v1/ping" -UseBasicParsing -TimeoutSec 2
      if($r.StatusCode -eq 200){ $activePort=$p; break }
    } catch {}
  }
  if($activePort){break}
  Start-Sleep -Milliseconds 800
}

$results=@()
function Add-Result($name,$ok,$status,$detail){$script:results += [pscustomobject]@{test=$name;ok=$ok;status=$status;detail=$detail}}

if(-not $activePort){
  Add-Result 'server boot' $false 'ERR' 'Server did not become reachable on 2000/3000'
} else {
  $base="http://localhost:$activePort/api/v1/auth"
  Add-Result 'server boot' $true 200 "port=$activePort"

  $stamp=Get-Date -Format 'yyyyMMddHHmmss'
  $email="auth.smoke.$stamp@example.com"
  $pwd='Pass@12345'

  try {$r=Invoke-WebRequest -Uri "http://localhost:$activePort/api/v1/ping" -UseBasicParsing -TimeoutSec 5; Add-Result 'ping' $true $r.StatusCode $r.Content } catch { Add-Result 'ping' $false 'ERR' $_.Exception.Message }

  try {
    $r=Invoke-WebRequest -Uri "$base/check-email" -Method Post -ContentType 'application/json' -Body (@{email=$email}|ConvertTo-Json) -UseBasicParsing
    $j=$r.Content|ConvertFrom-Json
    Add-Result 'check-email (before register)' ($j.exists -eq $false) $r.StatusCode $r.Content
  } catch { Add-Result 'check-email (before register)' $false 'ERR' $_.Exception.Message }

  try {
    $r=Invoke-WebRequest -Uri "$base/register" -Method Post -ContentType 'application/json' -Body (@{email=$email;password=$pwd;firstName='Auth';lastName='Smoke';phone='9999999999';workspace=''}|ConvertTo-Json) -UseBasicParsing
    $j=$r.Content|ConvertFrom-Json
    $script:emailUserId=$j.userId
    Add-Result 'register (email)' ($j.userId -ne $null -and $j.user.email -eq $email) $r.StatusCode $r.Content
  } catch { Add-Result 'register (email)' $false 'ERR' $_.Exception.Message }

  try {
    $r=Invoke-WebRequest -Uri "$base/check-email" -Method Post -ContentType 'application/json' -Body (@{email=$email}|ConvertTo-Json) -UseBasicParsing
    $j=$r.Content|ConvertFrom-Json
    Add-Result 'check-email (after register)' ($j.exists -eq $true -and $j.login_type -eq 'email') $r.StatusCode $r.Content
  } catch { Add-Result 'check-email (after register)' $false 'ERR' $_.Exception.Message }

  try {
    $r=Invoke-WebRequest -Uri "$base/login" -Method Post -ContentType 'application/json' -Body (@{email=$email;password=$pwd}|ConvertTo-Json) -UseBasicParsing
    $j=$r.Content|ConvertFrom-Json
    $script:loginUserId=$j.userId
    Add-Result 'login (email success)' ($j.userId -eq $script:emailUserId) $r.StatusCode $r.Content
  } catch { Add-Result 'login (email success)' $false 'ERR' $_.Exception.Message }

  try {
    $r=Invoke-WebRequest -Uri "$base/login" -Method Post -ContentType 'application/json' -Body (@{email=$email;password='Wrong@123'}|ConvertTo-Json) -UseBasicParsing
    Add-Result 'login (wrong password should fail)' $false $r.StatusCode $r.Content
  } catch {
    if($_.Exception.Response){
      $code=$_.Exception.Response.StatusCode.value__
      Add-Result 'login (wrong password should fail)' ($code -eq 401) $code 'expected failure'
    } else { Add-Result 'login (wrong password should fail)' $false 'ERR' $_.Exception.Message }
  }

  if($script:loginUserId){
    try {
      $r=Invoke-WebRequest -Uri "$base/userdata?userId=$($script:loginUserId)" -Method Get -UseBasicParsing
      $j=$r.Content|ConvertFrom-Json
      Add-Result 'userdata (email user)' ($j.uid -eq $script:loginUserId) $r.StatusCode $r.Content
    } catch { Add-Result 'userdata (email user)' $false 'ERR' $_.Exception.Message }
  }

  $msEmail="ms.smoke.$stamp@example.com"
  $msUid=[guid]::NewGuid().ToString()
  try {
    $r=Invoke-WebRequest -Uri "$base/microsoft" -Method Post -ContentType 'application/json' -Body (@{uid=$msUid;email=$msEmail;name='MS Smoke';phone='';login_type='azure_ad';workspace=''}|ConvertTo-Json) -UseBasicParsing
    $j=$r.Content|ConvertFrom-Json
    Add-Result 'microsoft login (create/signin)' ($j.userId -eq $msUid -and $j.user.login_type -eq 'azure_ad') $r.StatusCode $r.Content
  } catch { Add-Result 'microsoft login (create/signin)' $false 'ERR' $_.Exception.Message }

  try {
    $r=Invoke-WebRequest -Uri "$base/login" -Method Post -ContentType 'application/json' -Body (@{email=$msEmail;password='any'}|ConvertTo-Json) -UseBasicParsing
    Add-Result 'login with microsoft account via email-password should fail' $false $r.StatusCode $r.Content
  } catch {
    if($_.Exception.Response){$code=$_.Exception.Response.StatusCode.value__; Add-Result 'login with microsoft account via email-password should fail' ($code -in 400,401) $code 'expected failure'} else { Add-Result 'login with microsoft account via email-password should fail' $false 'ERR' $_.Exception.Message }
  }

  try {
    $r=Invoke-WebRequest -Uri "$base/google" -Method Post -ContentType 'application/json' -Body (@{code='fake-code-for-smoke-test'}|ConvertTo-Json) -UseBasicParsing -TimeoutSec 20
    Add-Result 'google login (with fake code)' $false $r.StatusCode $r.Content
  } catch {
    if($_.Exception.Response){$code=$_.Exception.Response.StatusCode.value__; Add-Result 'google login (with fake code)' ($code -in 400,500) $code 'expected failure for fake code'} else { Add-Result 'google login (with fake code)' $false 'ERR' $_.Exception.Message }
  }

  try {
    $r=Invoke-WebRequest -Uri "http://localhost:$activePort/api/v1/auth/logout" -Method Post -UseBasicParsing
    Add-Result 'logout endpoint exists' $true $r.StatusCode $r.Content
  } catch {
    if($_.Exception.Response){$code=$_.Exception.Response.StatusCode.value__; Add-Result 'logout endpoint exists' ($code -notin 404,405) $code 'no logout route'} else { Add-Result 'logout endpoint exists' $false 'ERR' $_.Exception.Message }
  }
}

if($proc -and -not $proc.HasExited){ Stop-Process -Id $proc.Id -Force }

$results | Format-Table -AutoSize
"`nJSON_SUMMARY_START"
$results | ConvertTo-Json -Depth 6
"JSON_SUMMARY_END"
"`nLOG_TAIL_START"
if(Test-Path $log){ Get-Content $log -Tail 60 }
"LOG_TAIL_END"
