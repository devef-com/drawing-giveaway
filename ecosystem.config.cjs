module.exports = {
  apps: [
    {
      name: 'drawing-giveaway',
      script: '.output/server/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Restart settings
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/dev/stderr',
      out_file: '/dev/stdout',
      merge_logs: true,
    },
  ],
}
