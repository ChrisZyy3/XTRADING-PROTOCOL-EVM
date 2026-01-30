module.exports = {
  apps: [{
    name: 'xtrading-frontend',
    script: 'npx',
    args: 'next dev',
    cwd: '/data/vcstakingv2/frontend/XTRADING-PROTOCOL-EVM/packages/nextjs',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'development',
      PORT: 3101,
      NEXT_TELEMETRY_DISABLED: '1',
    },
    error_file: '/data/vcstakingv2/frontend/XTRADING-PROTOCOL-EVM/logs/pm2-error.log',
    out_file: '/data/vcstakingv2/frontend/XTRADING-PROTOCOL-EVM/logs/pm2-out.log',
    log_file: '/data/vcstakingv2/frontend/XTRADING-PROTOCOL-EVM/logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
  }]
};
