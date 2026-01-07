# 📦 Scripts de Deployment - CCE

Este directorio contiene todos los scripts necesarios para instalar y mantener el proyecto CCE en un servidor Ubuntu.

## 📋 Archivos Incluidos

### Scripts de Instalación
- **`setup-ubuntu.sh`** - Script principal que instala todo el software necesario
- **`setup-database.sh`** - Configura PostgreSQL y crea la base de datos
- **`setup-nginx.sh`** - Configura Nginx como reverse proxy

### Configuración
- **`nginx-config.conf`** - Configuración de Nginx para producción
- **`ecosystem.config.js`** - Configuración de PM2 para gestionar procesos

### Operaciones
- **`deploy.sh`** - Script de deploy completo (actualizar código y reiniciar)
- **`backup.sh`** - Script de backup automático de base de datos

## 🚀 Orden de Ejecución

### Primera Vez (Instalación Completa)

```bash
# 1. Clonar repositorio
git clone https://github.com/GastonNicolasBaez/CCE.git
cd CCE/deployment

# 2. Dar permisos de ejecución
chmod +x *.sh

# 3. Instalar software base (Node.js, PostgreSQL, Nginx, etc)
sudo ./setup-ubuntu.sh

# 4. Configurar base de datos
sudo ./setup-database.sh
# ⚠️ GUARDA las credenciales que muestra

# 5. Configurar variables de entorno
cd ../BackendCCE
nano .env  # Ver guía en DEPLOY-SELFHOSTING.md

cd ../FrontendCCE
nano .env.local  # Ver guía

# 6. Instalar dependencias y compilar
cd ../BackendCCE
npm install --production

cd ../FrontendCCE
npm install
npm run build

# 7. Ejecutar migraciones
cd ../BackendCCE
npm run migrate:auto

# 8. Configurar Nginx
cd ../deployment
sudo ./setup-nginx.sh

# 9. Iniciar aplicación
pm2 start ecosystem.config.js
pm2 save

# 10. Configurar SSL (después de que DNS esté apuntando)
sudo certbot --nginx -d zeclogic.net.ar -d www.zeclogic.net.ar
```

### Actualizaciones (Deploy)

```bash
cd /home/cceapp/CCE/deployment
sudo ./deploy.sh
```

Este script hace automáticamente:
- Git pull
- Instala dependencias
- Ejecuta migraciones
- Compila frontend
- Reinicia servicios con PM2

### Backup Manual

```bash
cd /home/cceapp/CCE/deployment
sudo ./backup.sh
```

Para backup automático diario, agregar a crontab:
```bash
sudo crontab -e
# Agregar:
0 3 * * * /home/cceapp/CCE/deployment/backup.sh >> /var/log/cce/backup.log 2>&1
```

## 📖 Documentación Completa

Ver **`DEPLOY-SELFHOSTING.md`** en la raíz del proyecto para la guía completa paso a paso.

## 🔧 Comandos Útiles

### PM2
```bash
pm2 status              # Ver estado de procesos
pm2 logs                # Ver logs en tiempo real
pm2 logs cce-backend    # Logs solo del backend
pm2 logs cce-frontend   # Logs solo del frontend
pm2 restart all         # Reiniciar todo
pm2 monit              # Monitor en tiempo real
```

### Nginx
```bash
sudo systemctl status nginx     # Ver estado
sudo systemctl restart nginx    # Reiniciar
sudo nginx -t                   # Probar configuración
sudo tail -f /var/log/nginx/cce-error.log  # Ver logs de error
```

### PostgreSQL
```bash
sudo systemctl status postgresql  # Ver estado
psql -U cce_user -d cce_db       # Conectar a la DB
sudo tail -f /var/log/postgresql/postgresql-15-main.log  # Ver logs
```

## ⚙️ Variables de Entorno Requeridas

### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cce_db
DB_USER=cce_user
DB_PASSWORD=tu-password-aqui
JWT_SECRET=tu-secret-aqui
FRONTEND_URL=https://zeclogic.net.ar
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://zeclogic.net.ar
```

## 🆘 Troubleshooting

### Backend no inicia
```bash
pm2 logs cce-backend  # Ver el error
cd /home/cceapp/CCE/BackendCCE
cat .env              # Verificar variables de entorno
```

### Frontend no compila
```bash
cd /home/cceapp/CCE/FrontendCCE
rm -rf .next node_modules
npm install
npm run build
```

### Nginx da error 502
```bash
# Verificar que backend y frontend estén corriendo
pm2 status

# Si no están, iniciarlos
pm2 start /home/cceapp/CCE/deployment/ecosystem.config.js
```

## 📊 Monitoreo

### Ver uso de recursos
```bash
htop              # Monitor general del sistema
pm2 monit         # Monitor de aplicaciones
df -h             # Espacio en disco
free -h           # Memoria RAM
```

### Ver logs en tiempo real
```bash
# Logs de aplicación
pm2 logs

# Logs de Nginx
sudo tail -f /var/log/nginx/cce-access.log

# Logs del sistema
sudo journalctl -f
```

## 🔒 Seguridad

### Firewall (UFW)
```bash
sudo ufw status         # Ver reglas activas
sudo ufw allow 80/tcp   # Abrir puerto HTTP
sudo ufw allow 443/tcp  # Abrir puerto HTTPS
```

### Fail2ban
```bash
sudo systemctl status fail2ban  # Ver estado
sudo fail2ban-client status     # Ver jails activos
```

## 📞 Soporte

Para más información, consulta:
- **DEPLOY-SELFHOSTING.md** - Guía completa de instalación
- **ANALISIS-PROYECTO.md** - Análisis del proyecto y mejoras sugeridas
- **README.md** - Documentación general del proyecto

---

**Proyecto:** Club Comandante Espora - Sistema de Gestión
**Dominio:** https://zeclogic.net.ar
**Stack:** Next.js 14 + Express.js + PostgreSQL
