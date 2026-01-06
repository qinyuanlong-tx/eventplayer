# Git 配置脚本

Write-Host "检查 Git 是否已安装..." -ForegroundColor Cyan

# 尝试查找 git
$gitPath = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitPath) {
    Write-Host "错误: 未找到 Git。请先安装 Git for Windows。" -ForegroundColor Red
    Write-Host "下载地址: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "Git 已安装: $($gitPath.Source)" -ForegroundColor Green

# 检查是否已初始化
if (Test-Path .git) {
    Write-Host "Git 仓库已存在" -ForegroundColor Green
} else {
    Write-Host "初始化 Git 仓库..." -ForegroundColor Cyan
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "初始化失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "Git 仓库初始化成功" -ForegroundColor Green
}

# 检查用户配置
Write-Host ""
Write-Host "检查 Git 用户配置..." -ForegroundColor Cyan
$userName = git config user.name
$userEmail = git config user.email

if ((-not $userName) -or (-not $userEmail)) {
    Write-Host "警告: Git 用户信息未配置" -ForegroundColor Yellow
    Write-Host "请运行以下命令配置（如果需要）:" -ForegroundColor Yellow
    Write-Host "  git config --global user.name `"Your Name`"" -ForegroundColor Yellow
    Write-Host "  git config --global user.email `"your.email@example.com`"" -ForegroundColor Yellow
} else {
    Write-Host "用户名称: $userName" -ForegroundColor Green
    Write-Host "用户邮箱: $userEmail" -ForegroundColor Green
}

# 显示状态
Write-Host ""
Write-Host "当前 Git 状态:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "要创建提交，请运行:" -ForegroundColor Yellow
Write-Host "  git add ." -ForegroundColor Yellow
Write-Host "  git commit -m `"回退到打包版本：保留分屏功能，修复待机视频下一个按钮逻辑`"" -ForegroundColor Yellow
