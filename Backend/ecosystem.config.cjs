module.exports = {
  apps: [
    {
      name: 'arrow-puzzle-backend',
      script: 'src/server.js',
      instances: 'max', // Scales horizontally across all available CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
