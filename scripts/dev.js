const { spawn } = require('child_process');
const { execSync } = require('child_process');

console.log('🚀 启动 EventPlayer 开发环境...\n');

// 1. 先编译主进程代码
console.log('📦 编译主进程代码...');
try {
  execSync('npm run build:electron', { stdio: 'inherit', shell: true });
  console.log('✅ 编译完成\n');
} catch (error) {
  console.error('❌ 编译失败');
  process.exit(1);
}

// 2. 启动 Vite 服务器
console.log('🌐 启动 Vite 开发服务器...');
const vite = spawn('npm', ['run', 'dev:react'], {
  stdio: 'inherit',
  shell: true
});

let electronProcess = null;

// 3. 等待 3 秒后启动 Electron
const electronTimeout = setTimeout(() => {
  console.log('\n⚡ 启动 Electron...');
  electronProcess = spawn('npm', ['run', 'start'], {
    stdio: 'inherit',
    shell: true
  });
  
  electronProcess.on('close', (code) => {
    console.log('\n👋 Electron 已关闭');
    if (code !== 0) {
      console.log('⚠️  Electron 非正常退出，代码:', code);
    }
  });
  
  electronProcess.on('error', (error) => {
    console.error('❌ Electron 启动失败:', error.message);
  });
}, 3000);

// 处理退出信号
const cleanup = () => {
  console.log('\n\n🛑 正在关闭...');
  clearTimeout(electronTimeout);
  if (electronProcess) {
    electronProcess.kill();
  }
  vite.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Vite 进程错误处理
vite.on('error', (error) => {
  console.error('❌ Vite 启动失败:', error.message);
  clearTimeout(electronTimeout);
  process.exit(1);
});

vite.on('close', (code) => {
  if (code !== 0) {
    console.log('\n⚠️  Vite 服务器已关闭，代码:', code);
  }
  if (electronProcess) {
    electronProcess.kill();
  }
  process.exit(code);
});

