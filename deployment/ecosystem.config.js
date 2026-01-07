/**
 * PM2 Ecosystem File - CCE
 * Gestiona los procesos de Backend y Frontend
 *
 * Comandos útiles:
 *   pm2 start ecosystem.config.js          # Iniciar ambos procesos
 *   pm2 restart ecosystem.config.js        # Reiniciar ambos
 *   pm2 stop ecosystem.config.js           # Detener ambos
 *   pm2 logs                               # Ver logs de ambos
 *   pm2 logs backend                       # Ver logs del backend
 *   pm2 logs frontend                      # Ver logs del frontend
 *   pm2 monit                              # Monitor en tiempo real
 *   pm2 save                               # Guardar configuración actual
 */

module.exports = {
  apps: [
    // Backend - Express.js
    {
      name: 'cce-backend',
      script: './BackendCCE/src/server.js',
      cwd: '/home/cceapp/CCE',
      instances: 2, // 2 instancias para balanceo de carga
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/cce/backend-error.log',
      out_file: '/var/log/cce/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },

    // Frontend - Next.js (Production Build)
    {
      name: 'cce-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/cceapp/CCE/FrontendCCE',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/cce/frontend-error.log',
      out_file: '/var/log/cce/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    }
  ],

  /**
   * Deployment configuration (opcional)
   * Permite hacer deploys desde tu máquina local
   */
  deploy: {
    production: {
      user: 'cceapp',
      host: 'zeclogic.net.ar', // Reemplazar con IP del servidor
      ref: 'origin/main',
      repo: 'https://github.com/GastonNicolasBaez/CCE.git',
      path: '/home/cceapp/CCE',
      'post-deploy': 'cd BackendCCE && npm install && cd ../FrontendCCE && npm install && npm run build && pm2 reload ecosystem.config.js',
      'pre-deploy-local': 'echo "Iniciando deploy..."',
    }
  }
};
