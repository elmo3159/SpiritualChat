# Kill all Node.js processes running on ports 3000-3010
# PowerShellスクリプト：開発サーバーをすべて停止

Write-Host "開発サーバーをすべて停止しています..." -ForegroundColor Yellow

# ポート3000-3010を使用しているプロセスを停止
3000..3010 | ForEach-Object {
    $port = $_
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            $connections | ForEach-Object {
                $processId = $_.OwningProcess
                $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
                Write-Host "ポート $port を使用しているプロセス $processName (PID: $processId) を停止します..." -ForegroundColor Cyan
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
    }
    catch {
        # エラーは無視
    }
}

Write-Host "`n完了しました！すべての開発サーバーが停止されました。" -ForegroundColor Green
Write-Host "次のコマンドで新しい開発サーバーを起動できます：" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor Cyan
