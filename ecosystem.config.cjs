module.exports = {
  apps: [
    {
      name: 'the-marketing-reset',
      script: 'node_modules/.bin/next',
      args: 'start -p 3007',
      cwd: '/var/www/the-marketing-reset',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
      },
      max_memory_restart: '250M',
      instances: 1,
      autorestart: true,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/www/the-marketing-reset/logs/error.log',
      out_file: '/var/www/the-marketing-reset/logs/out.log',
      merge_logs: true,
    },
  ],
};
