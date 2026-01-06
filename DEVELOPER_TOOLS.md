# 开发者工具使用说明

## 快捷键控制

在 Electron 窗口中，可以使用以下快捷键来控制开发者工具：

### 打开/关闭开发者工具
- **Windows/Linux**: 
  - `Ctrl + Shift + I` (打开/关闭)
  - `F12` (打开/关闭)
  - `Ctrl + Shift + J` (打开/关闭，并聚焦到Console)
  
- **macOS**:
  - `Cmd + Option + I` (打开/关闭)
  - `F12` (打开/关闭)

### 其他有用的快捷键
- `Ctrl + R` (Windows/Linux) / `Cmd + R` (macOS): 刷新页面
- `Ctrl + Shift + R` (Windows/Linux) / `Cmd + Shift + R` (macOS): 强制刷新（清除缓存）

## 代码中的设置

在开发模式下，代码会自动打开开发者工具（见 `src/main/main.ts`）。

如果你想禁用自动打开，可以注释掉这一行：
```typescript
mainWindow?.webContents.openDevTools();
```

## 开发者工具的功能

开发者工具包含以下标签页：
- **Elements**: 查看和编辑 HTML/CSS
- **Console**: 查看 JavaScript 日志和错误
- **Sources**: 调试 JavaScript 代码
- **Network**: 查看网络请求
- **Application**: 查看应用存储（LocalStorage, IndexedDB 等）

## 使用建议

1. **开发时**: 保持开发者工具打开，方便查看日志和调试
2. **测试时**: 可以关闭开发者工具，模拟用户环境
3. **调试**: 使用 Console 标签页查看 `console.log()` 输出
4. **网络问题**: 使用 Network 标签页查看 API 请求

