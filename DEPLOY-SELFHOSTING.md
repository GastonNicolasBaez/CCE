# 🖥️ Guía Completa de Deploy - Self-Hosting en PC Propia

Esta guía te llevará paso a paso para instalar y configurar el proyecto CCE en una PC con Ubuntu Server.

---

## 📋 Requisitos Previos

### Hardware Mínimo
- **CPU:** 2 cores
- **RAM:** 4GB (recomendado 8GB)
- **Disco:** 20GB libres (SSD recomendado)
- **Conexión:** 24/7 al router por ethernet

### Acceso Necesario
- Acceso físico o SSH a la PC
- Acceso admin al router (para port forwarding)
- Dominio: `zeclogic.net.ar` (ya configurado)

---

## 🚀 Parte 1: Instalación del Sistema Operativo

### Paso 1.1: Descargar Ubuntu Server

1. Descarga **Ubuntu Server 22.04 LTS** desde: https://ubuntu.com/download/server
2. Crea un USB booteable con [Rufus](https://rufus.ie/) (Windows) o `dd` (Linux)

### Paso 1.2: Instalar Ubuntu Server

1. Bootea desde el USB
2. Selecciona idioma: **Spanish** o **English**
3. Durante la instalación:
   - **Hostname:** `cce-server`
   - **Usuario:** `cceapp` (este será el usuario principal)
   - **Contraseña:** [Elige una segura]
   - **Instalar OpenSSH server:** ✅ SÍ (importante para acceso remoto)
   - **Particiones:** Usar disco completo (default)

4. Una vez instalado, reinicia y remueve el USB

### Paso 1.3: Configurar IP Estática (Opcional pero recomendado)

```bash
# Editar netplan
sudo nano /etc/netplan/00-installer-config.yaml
```

Configuración ejemplo (ajusta a tu red):
```yaml
network:
  version: 2
  ethernets:
    enp0s3:  # Cambia según tu interfaz (usa 'ip a' para verla)
      dhcp4: no
      addresses:
        - 192.168.1.100/24  # IP fija dentro de tu red
      gateway4: 192.168.1.1  # IP de tu router
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

Aplicar configuración:
```bash
sudo netplan apply
```

### Paso 1.4: Actualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

---

## 📦 Parte 2: Instalación Automática de Software

### Paso 2.1: Clonar el Repositorio

```bash
# Instalar Git primero
sudo apt install -y git

# Clonar repositorio
cd /home/cceapp
git clone https://github.com/GastonNicolasBaez/CCE.git
cd CCE
```

### Paso 2.2: Ejecutar Script de Instalación

Este script instala: Node.js, PostgreSQL, PM2, Nginx, Certbot, UFW, Fail2ban

```bash
cd deployment
chmod +x *.sh  # Dar permisos de ejecución

# Ejecutar instalación principal
sudo ./setup-ubuntu.sh
```

⏱️ **Tiempo estimado:** 10-15 minutos

El script instalará todo automáticamente. Al finalizar verás un resumen.

---

## 🗄️ Parte 3: Configurar Base de Datos

### Paso 3.1: Crear Base de Datos y Usuario

```bash
cd /home/cceapp/CCE/deployment
sudo ./setup-database.sh
```

El script te preguntará:
- **Nombre de BD:** `cce_db` (default)
- **Usuario:** `cce_user` (default)
- **Contraseña:** Se genera automáticamente

⚠️ **IMPORTANTE:** Guarda las credenciales que aparecen en pantalla. Las necesitarás en el siguiente paso.

Ejemplo de output:
```
Credenciales de la base de datos:
  • Host: localhost
  • Puerto: 5432
  • Base de datos: cce_db
  • Usuario: cce_user
  • Contraseña: aBcD1234EfGh5678IjKl  # ← GUARDA ESTO
```

---

## ⚙️ Parte 4: Configurar Variables de Entorno

### Paso 4.1: Backend - Archivo .env

```bash
cd /home/cceapp/CCE/BackendCCE
nano .env
```

Contenido del archivo:
```bash
# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://zeclogic.net.ar

# Database (usa las credenciales del paso anterior)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cce_db
DB_USER=cce_user
DB_PASSWORD=aBcD1234EfGh5678IjKl  # ← La que te dio el script

# JWT Secret (genera una clave aleatoria)
JWT_SECRET=$(openssl rand -base64 32)

# Email Configuration (opcional por ahora)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=Club Comandante Espora <noreply@zeclogic.net.ar>

# MercadoPago (opcional por ahora)
MP_ACCESS_TOKEN=tu-token-aqui
MP_PUBLIC_KEY=tu-public-key-aqui
```

Guardar: `Ctrl+O`, `Enter`, `Ctrl+X`

### Paso 4.2: Frontend - Archivo .env.local

```bash
cd /home/cceapp/CCE/FrontendCCE
nano .env.local
```

Contenido:
```bash
# API URL (producción)
NEXT_PUBLIC_API_URL=https://zeclogic.net.ar

# O si aún no tienes SSL:
# NEXT_PUBLIC_API_URL=http://zeclogic.net.ar
```

Guardar: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🌐 Parte 5: Configurar Router (Port Forwarding)

Para que el mundo exterior pueda acceder a tu servidor, necesitas abrir puertos en el router.

### Paso 5.1: Obtener IP Local del Servidor

```bash
ip a | grep "inet "
# Busca algo como: inet 192.168.1.100/24
```

### Paso 5.2: Acceder al Router

1. Abre un navegador y ve a la IP del router (usualmente `192.168.1.1` o `192.168.0.1`)
2. Ingresa usuario/contraseña del router (a veces está en una etiqueta del router)

### Paso 5.3: Configurar Port Forwarding

Cada router es diferente, pero busca sección: **Port Forwarding**, **NAT**, o **Virtual Servers**

**Configuración necesaria:**

| Nombre | Puerto Externo | Puerto Interno | IP Interna | Protocolo |
|--------|---------------|----------------|------------|-----------|
| HTTP   | 80            | 80             | 192.168.1.100 | TCP    |
| HTTPS  | 443           | 443            | 192.168.1.100 | TCP    |

**Ejemplo visual:**
```
Regla 1: HTTP
  - Servicio: HTTP (o Custom)
  - Puerto externo: 80
  - Puerto interno: 80
  - IP destino: 192.168.1.100
  - Protocolo: TCP
  - Estado: Habilitado ✅

Regla 2: HTTPS
  - Servicio: HTTPS (o Custom)
  - Puerto externo: 443
  - Puerto interno: 443
  - IP destino: 192.168.1.100
  - Protocolo: TCP
  - Estado: Habilitado ✅
```

### Paso 5.4: Verificar IP Pública

```bash
curl ifconfig.me
# Output: Tu IP pública (ej: 181.45.123.45)
```

⚠️ **Importante:** Si tu IP es dinámica (cambia cada cierto tiempo), considera usar **DynamicDNS** (No-IP, DuckDNS).

---

## 🌍 Parte 6: Configurar Dominio

### Paso 6.1: Configurar DNS de zeclogic.net.ar

Necesitas apuntar el dominio a la IP pública de tu casa/oficina.

**Accede al panel de gestión de tu dominio** (donde compraste zeclogic.net.ar) y crea estos registros DNS:

```
Tipo  | Nombre | Valor              | TTL
------|--------|--------------------|---------
A     | @      | 181.45.123.45      | 3600
A     | www    | 181.45.123.45      | 3600
```

Reemplaza `181.45.123.45` con tu IP pública real (del Paso 5.4)

### Paso 6.2: Verificar Propagación DNS

Espera 5-30 minutos y verifica:

```bash
# Desde cualquier computadora
ping zeclogic.net.ar
# Debería responder con tu IP pública
```

O usa herramientas online:
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 🚀 Parte 7: Deploy del Proyecto

### Paso 7.1: Instalar Dependencias

```bash
cd /home/cceapp/CCE

# Backend
cd BackendCCE
npm install --production

# Frontend
cd ../FrontendCCE
npm install
npm run build  # Esto puede tardar 2-5 minutos
```

### Paso 7.2: Ejecutar Migraciones de Base de Datos

```bash
cd /home/cceapp/CCE/BackendCCE
npm run migrate:auto
```

Deberías ver:
```
✅ Database connection established successfully
✅ Migration completed
```

### Paso 7.3: Configurar Nginx (SIN SSL por ahora)

Primero configuramos Nginx para HTTP básico, luego agregaremos SSL.

```bash
# Editar configuración de Nginx
sudo nano /home/cceapp/CCE/deployment/nginx-config.conf
```

Comenta las líneas SSL (agrega # al inicio):

```nginx
# Comentar estas líneas por ahora:
#    ssl_certificate /etc/letsencrypt/live/zeclogic.net.ar/fullchain.pem;
#    ssl_certificate_key /etc/letsencrypt/live/zeclogic.net.ar/privkey.pem;
#    ssl_trusted_certificate /etc/letsencrypt/live/zeclogic.net.ar/chain.pem;
```

Y cambia el `listen 443 ssl http2` por:
```nginx
    listen 80;
    listen [::]:80;
```

Guardar y ejecutar:

```bash
cd /home/cceapp/CCE/deployment
sudo ./setup-nginx.sh
```

### Paso 7.4: Iniciar Aplicación con PM2

```bash
cd /home/cceapp/CCE/deployment
pm2 start ecosystem.config.js
pm2 save
```

Verificar que estén corriendo:
```bash
pm2 status
```

Deberías ver:
```
┌─────┬──────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ status  │ restart │ uptime  │ cpu      │
├─────┼──────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ cce-backend  │ online  │ 0       │ 5s      │ 0%       │
│ 1   │ cce-frontend │ online  │ 0       │ 5s      │ 0%       │
└─────┴──────────────┴─────────┴─────────┴─────────┴──────────┘
```

### Paso 7.5: Verificar Funcionamiento

```bash
# Verificar backend
curl http://localhost:3001/health

# Verificar frontend
curl http://localhost:3000

# Verificar Nginx
curl http://localhost
```

Si todo funciona, intenta acceder desde tu navegador:
```
http://zeclogic.net.ar
```

🎉 **¡Debería funcionar!**

---

## 🔒 Parte 8: Configurar SSL/HTTPS (Let's Encrypt)

Una vez que el sitio funcione con HTTP, agrega SSL:

### Paso 8.1: Restaurar configuración SSL de Nginx

```bash
sudo nano /etc/nginx/sites-available/cce
```

Descomenta las líneas SSL que comentaste antes y restaura `listen 443 ssl http2`

### Paso 8.2: Obtener Certificado SSL

```bash
sudo certbot --nginx -d zeclogic.net.ar -d www.zeclogic.net.ar
```

Certbot te preguntará:
- **Email:** Tu email (para avisos de renovación)
- **Términos:** Acepta (A)
- **Redirect HTTP → HTTPS:** Sí (2)

Si todo sale bien:
```
Congratulations! You have successfully enabled HTTPS
```

### Paso 8.3: Verificar Renovación Automática

```bash
sudo certbot renew --dry-run
```

Si sale OK, los certificados se renovarán automáticamente cada 90 días.

### Paso 8.4: Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

Ahora accede con HTTPS:
```
https://zeclogic.net.ar
```

🔒 **¡Debería tener el candado verde!**

---

## 🔧 Parte 9: Mantenimiento y Monitoreo

### Comandos Útiles de PM2

```bash
# Ver logs en tiempo real
pm2 logs

# Ver solo backend
pm2 logs cce-backend

# Ver solo frontend
pm2 logs cce-frontend

# Monitor en tiempo real (CPU, RAM)
pm2 monit

# Reiniciar todo
pm2 restart all

# Reiniciar solo backend
pm2 restart cce-backend

# Detener todo
pm2 stop all
```

### Configurar Backup Automático

```bash
# Dar permisos
sudo chmod +x /home/cceapp/CCE/deployment/backup.sh

# Agregar a crontab (backup diario a las 3 AM)
sudo crontab -e

# Agregar esta línea al final:
0 3 * * * /home/cceapp/CCE/deployment/backup.sh >> /var/log/cce/backup.log 2>&1
```

### Ver Logs del Sistema

```bash
# Logs de Nginx
sudo tail -f /var/log/nginx/cce-access.log
sudo tail -f /var/log/nginx/cce-error.log

# Logs de aplicación
pm2 logs

# Logs del sistema
sudo journalctl -u nginx -f
```

### Actualizar el Proyecto

```bash
# Usar el script de deploy
cd /home/cceapp/CCE/deployment
sudo ./deploy.sh
```

Este script hace:
1. Git pull
2. Instala dependencias
3. Ejecuta migraciones
4. Compila frontend
5. Reinicia servicios

---

## 📊 Parte 10: Verificación Final

### Checklist de Funcionamiento

- [ ] Ubuntu Server instalado y actualizado
- [ ] Node.js, PostgreSQL, Nginx corriendo
- [ ] Base de datos creada y migrada
- [ ] Variables de entorno configuradas
- [ ] Port forwarding configurado en router
- [ ] DNS apuntando a tu IP pública
- [ ] Nginx sirviendo la aplicación
- [ ] PM2 gestionando procesos
- [ ] SSL/HTTPS funcionando
- [ ] Backup automático configurado

### URLs para Verificar

```bash
✅ https://zeclogic.net.ar (Frontend)
✅ https://zeclogic.net.ar/api/socios (Backend API)
✅ https://zeclogic.net.ar/health (Health check)
```

---

## 🆘 Troubleshooting

### Problema: No puedo acceder desde internet

**Solución:**
1. Verifica port forwarding en el router
2. Verifica que el firewall permita los puertos:
   ```bash
   sudo ufw status
   ```
3. Verifica que Nginx esté escuchando:
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

### Problema: Backend no responde

```bash
# Ver logs
pm2 logs cce-backend

# Ver estado
pm2 status

# Reiniciar
pm2 restart cce-backend

# Ver si el puerto está ocupado
sudo netstat -tulpn | grep :3001
```

### Problema: Frontend muestra error

```bash
# Ver logs
pm2 logs cce-frontend

# Verificar que .env.local tenga la API URL correcta
cat /home/cceapp/CCE/FrontendCCE/.env.local

# Recompilar
cd /home/cceapp/CCE/FrontendCCE
npm run build
pm2 restart cce-frontend
```

### Problema: Base de datos no conecta

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Probar conexión manual
psql -h localhost -U cce_user -d cce_db

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `pm2 logs`
2. Revisa el análisis del proyecto: `ANALISIS-PROYECTO.md`
3. Contacta al equipo de desarrollo

---

## 🎯 Próximos Pasos

Una vez que todo funcione:
1. Implementar autenticación (ver `ANALISIS-PROYECTO.md`)
2. Configurar sistema de cuotas completo
3. Implementar multi-tenant
4. Agregar app móvil

**¡Felicitaciones! Tu servidor está en producción.** 🚀
