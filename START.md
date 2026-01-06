# 启动说明

## 推荐方式：一键启动

直接运行：
```bash
npm run dev
```

这个命令会自动：
1. 编译主进程代码（TypeScript → JavaScript）
2. 启动 Vite 开发服务器（端口 5173）
3. 等待 3 秒后自动启动 Electron 窗口

**停止应用：**
- 在终端按 `Ctrl+C` 停止 Vite 服务器
- 关闭 Electron 窗口

## 手动分步启动（可选）

如果需要更多控制，可以分步启动：

### 步骤 1：启动 Vite 开发服务器
在一个终端中运行：
```bash
npm run dev:react
```
等待看到 "VITE v5.x.x ready" 和端口信息（通常是 http://localhost:5173/）

### 步骤 2：启动 Electron
在另一个终端中运行：
```bash
npm run build:electron
npm run start
```

## 仅启动 Electron（Vite 服务器已在运行）

如果 Vite 服务器已经在运行，只需要启动 Electron：
```bash
npm run start
```

或者：
```bash
npm run dev:electron
```

