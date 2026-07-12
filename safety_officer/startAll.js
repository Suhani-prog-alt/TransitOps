const { spawn } = require('child_process');

console.log('Starting Backend...');
const backend = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], { cwd: './backend', stdio: 'inherit' });

console.log('Starting Frontend on Port 8080...');
const frontend = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], { cwd: './frontend', stdio: 'inherit' });

process.on('SIGINT', () => {
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit();
});
