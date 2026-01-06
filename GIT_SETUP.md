# Git 配置说明

## 1. 检查 Git 是否已安装

在 PowerShell 或命令提示符中运行：
```bash
git --version
```

如果显示版本号，说明已安装。如果提示找不到命令，需要先安装 Git。

## 2. 安装 Git（如果未安装）

下载并安装 Git for Windows：
- 下载地址：https://git-scm.com/download/win
- 安装时选择默认选项即可

## 3. 配置 Git 用户信息（首次使用需要）

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 4. 初始化 Git 仓库

在项目根目录运行：
```bash
git init
```

## 5. 创建第一个提交

```bash
# 添加所有文件
git add .

# 创建提交
git commit -m "回退到打包版本：保留分屏功能，修复待机视频下一个按钮逻辑"
```

## 6. 查看提交历史

```bash
git log --oneline
```

## 注意事项

- `.gitignore` 文件已配置，会自动排除以下内容：
  - `node_modules/` - Node.js 依赖
  - `dist/` - 构建输出
  - `release/win-unpacked/` - 打包输出
  - `*.db`, `*.db-journal` - 数据库文件
  - `videos/`, `data/` - 视频和数据目录

