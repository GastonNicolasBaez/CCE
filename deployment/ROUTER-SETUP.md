# 🌐 Guía de Configuración del Router - Port Forwarding

Esta guía te ayudará a configurar el port forwarding en tu router para que el servidor CCE sea accesible desde internet.

---

## 📋 Información que necesitas

Antes de empezar, necesitas:

1. **IP Local del Servidor CCE**
   ```bash
   # Ejecuta en el servidor:
   ip a | grep "inet "
   # Busca algo como: 192.168.1.100
   ```

2. **IP del Router**
   - Usualmente: `192.168.1.1` o `192.168.0.1`
   - Puedes verificarla con:
     ```bash
     ip route | grep default
     ```

3. **Usuario y Contraseña del Router**
   - A veces está en una etiqueta pegada al router
   - Algunos routers comunes:
     - **Telecentro:** admin / admin
     - **Fibertel:** admin / (vacío) o admin / admin
     - **Movistar:** admin / admin
     - **Personal:** admin / personal

---

## 🔧 Paso a Paso: Configuración General

### Paso 1: Acceder al Router

1. Abre un navegador web
2. Ingresa la IP del router en la barra de direcciones: `http://192.168.1.1`
3. Ingresa usuario y contraseña

### Paso 2: Buscar la Sección de Port Forwarding

Cada router tiene un menú diferente. Busca alguna de estas secciones:

- **Port Forwarding**
- **Virtual Servers**
- **NAT**
- **Aplicaciones y Juegos**
- **Redirección de Puertos**
- **DMZ** (NO uses esto, necesitamos port forwarding específico)

### Paso 3: Crear Reglas de Port Forwarding

Necesitas crear **2 reglas** (una para HTTP y otra para HTTPS):

#### Regla 1: HTTP (Puerto 80)

```
Nombre/Descripción:    CCE-HTTP
Servicio:              Custom o HTTP
Puerto Externo:        80
Puerto Interno:        80
IP Destino/Interna:    192.168.1.100  ← (IP de tu servidor)
Protocolo:             TCP
Estado:                Habilitado/Enabled
```

#### Regla 2: HTTPS (Puerto 443)

```
Nombre/Descripción:    CCE-HTTPS
Servicio:              Custom o HTTPS
Puerto Externo:        443
Puerto Interno:        443
IP Destino/Interna:    192.168.1.100  ← (IP de tu servidor)
Protocolo:             TCP
Estado:                Habilitado/Enabled
```

### Paso 4: Guardar y Aplicar

- Haz clic en **Guardar**, **Aplicar** o **Save**
- Algunos routers se reinician automáticamente (espera 1-2 minutos)

---

## 📱 Guías Específicas por Proveedor/Marca

### Telecentro (Routers Technicolor/Arris)

1. Accede a: `http://192.168.0.1`
2. Usuario: `admin` / Contraseña: `admin` (o la que esté en la etiqueta)
3. Ve a: **Avanzadas** → **NAT** → **Port Forwarding**
4. Haz clic en **Agregar regla**
5. Completa los campos y guarda

### Fibertel/Cablevision (Routers Ubee, Cisco)

1. Accede a: `http://192.168.0.1`
2. Usuario: `admin` / Contraseña: (vacío o `admin`)
3. Ve a: **Firewall** → **Virtual Servers** o **Port Forwarding**
4. Agrega las reglas manualmente

### Movistar (Routers Huawei)

1. Accede a: `http://192.168.1.1`
2. Usuario: `admin` / Contraseña: `admin`
3. Ve a: **Aplicaciones** → **Port Forwarding**
4. Haz clic en **Nueva Regla**

### Personal (Routers ZTE)

1. Accede a: `http://192.168.0.1`
2. Usuario: `admin` / Contraseña: `personal`
3. Ve a: **Application** → **Port Forwarding**
4. Crea las reglas

### TP-Link

1. Accede a: `http://192.168.0.1` o `http://192.168.1.1`
2. Usuario: `admin` / Contraseña: `admin`
3. Ve a: **Forwarding** → **Virtual Servers**
4. Haz clic en **Add New**
5. Completa:
   - Service Port: `80` (primera regla) o `443` (segunda regla)
   - Internal Port: `80` o `443`
   - IP Address: `192.168.1.100`
   - Protocol: `TCP`
   - Status: `Enabled`

### D-Link

1. Accede a: `http://192.168.0.1`
2. Usuario: `admin` / Contraseña: (vacío o `admin`)
3. Ve a: **Advanced** → **Port Forwarding**
4. Agrega las reglas

---

## ✅ Verificar que Funcione

### Desde el Servidor

```bash
# Obtener tu IP pública
curl ifconfig.me
# Ejemplo output: 181.45.123.45

# Verificar que Nginx esté escuchando
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Desde Internet (Otra Red)

1. **Opción 1: Usar tu teléfono móvil con 4G/5G** (NO conectado al WiFi de casa)
   - Abre el navegador
   - Ingresa: `http://TU_IP_PUBLICA` (ej: `http://181.45.123.45`)
   - Deberías ver el sitio

2. **Opción 2: Usar herramientas online**
   - https://www.yougetsignal.com/tools/open-ports/
   - Ingresa tu IP pública y puerto 80, luego 443
   - Debe decir "Open" (abierto)

3. **Opción 3: Con el dominio** (si ya configuraste DNS)
   - `http://zeclogic.net.ar`

---

## 🔍 Troubleshooting

### Problema: No puedo acceder al router

**Solución:**
```bash
# Verificar IP del router
ip route | grep default
# Output ejemplo: default via 192.168.1.1

# Hacer ping
ping 192.168.1.1

# Si no responde, intenta resetear el router (botón físico)
```

### Problema: Port forwarding no funciona

**Checklist:**
- [ ] ¿El servidor tiene IP fija en la red local?
- [ ] ¿Firewall del servidor permite los puertos? (`sudo ufw status`)
- [ ] ¿Nginx está corriendo? (`sudo systemctl status nginx`)
- [ ] ¿Los puertos están escuchando? (`sudo netstat -tulpn | grep :80`)
- [ ] ¿Guardaste y aplicaste los cambios en el router?
- [ ] ¿Esperaste 1-2 minutos después de aplicar?

**Comando útil:**
```bash
# Desde el servidor, probar si el puerto está abierto desde fuera
# (Requiere: sudo apt install nmap)
nmap -p 80,443 TU_IP_PUBLICA
```

### Problema: Solo funciona desde la red local

Esto significa que el port forwarding no está configurado correctamente.

**Soluciones:**
1. Verifica que la IP interna sea correcta (`192.168.x.x`)
2. Asegúrate de que el protocolo sea **TCP**, no UDP
3. Algunos routers tienen **NAT Loopback** deshabilitado (no podrás acceder desde dentro con IP pública)
4. Contacta a tu ISP, algunos bloquean puerto 80/443

### Problema: Mi ISP bloquea el puerto 80

Algunos ISPs (especialmente en planes residenciales) bloquean puerto 80 y/o 443.

**Soluciones:**
1. **Opción A:** Usar puerto alternativo (ej: 8080, 8443)
   - Configura port forwarding: `8080 → 80` y `8443 → 443`
   - Accede con: `http://zeclogic.net.ar:8080`

2. **Opción B:** Contratar IP fija empresarial (costo adicional)

3. **Opción C:** Usar Cloudflare Tunnel (gratis)
   - No requiere port forwarding
   - Ver: https://www.cloudflare.com/products/tunnel/

---

## 🌐 IP Dinámica vs IP Estática

### IP Dinámica (cambia cada cierto tiempo)

Si tu IP pública cambia, el dominio dejará de funcionar.

**Solución:** Usar **Dynamic DNS** (DDNS)

#### Configurar DuckDNS (Gratis)

1. Ve a https://www.duckdns.org/
2. Crea una cuenta (con Google, GitHub, etc)
3. Crea un dominio, ej: `cce.duckdns.org`
4. Instala el cliente en el servidor:

```bash
# Crear directorio
mkdir -p /home/cceapp/duckdns
cd /home/cceapp/duckdns

# Crear script
nano duck.sh
```

Contenido:
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=cce&token=TU-TOKEN-AQUI&ip=" | curl -k -o /home/cceapp/duckdns/duck.log -K -
```

```bash
# Dar permisos
chmod +x duck.sh

# Probar
./duck.sh

# Ver resultado (debe decir "OK")
cat duck.log

# Agregar a crontab (actualizar cada 5 minutos)
crontab -e
# Agregar:
*/5 * * * * /home/cceapp/duckdns/duck.sh >/dev/null 2>&1
```

Ahora tu servidor estará siempre accesible en: `https://cce.duckdns.org`

### IP Estática (Recomendado para producción)

Algunos ISPs ofrecen IP fija por un costo adicional mensual.

**Ventajas:**
- No necesitas DDNS
- Más profesional
- Más estable

**Desventajas:**
- Costo adicional ($5-20 USD/mes en Argentina)

---

## 🔐 Seguridad Adicional

### Cambiar Puerto SSH (Opcional)

Para evitar ataques automáticos al puerto 22:

```bash
# Editar configuración SSH
sudo nano /etc/ssh/sshd_config

# Cambiar línea:
Port 2222  # O cualquier puerto > 1024

# Reiniciar SSH
sudo systemctl restart sshd

# Agregar regla de firewall
sudo ufw allow 2222/tcp

# Agregar port forwarding en el router:
# 2222 → 2222 (TCP)
```

Ahora conecta con: `ssh -p 2222 cceapp@zeclogic.net.ar`

### Bloquear IPs Maliciosas (Fail2ban)

Ya está instalado por el script `setup-ubuntu.sh`. Verifica:

```bash
sudo systemctl status fail2ban
sudo fail2ban-client status sshd
```

Bloqueará automáticamente IPs que intenten acceso no autorizado.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa que el firewall del servidor permita los puertos: `sudo ufw status`
2. Verifica que Nginx esté corriendo: `sudo systemctl status nginx`
3. Prueba desde otra red (4G del celular)
4. Contacta a tu ISP si sospechas bloqueo de puertos

---

## ✅ Checklist Final

- [ ] Port forwarding configurado (puerto 80 y 443)
- [ ] Firewall del servidor permite los puertos
- [ ] Nginx corriendo y sirviendo en puerto 80/443
- [ ] IP pública obtenida (`curl ifconfig.me`)
- [ ] Acceso funciona desde otra red (4G del celular)
- [ ] DNS configurado (zeclogic.net.ar apunta a tu IP)
- [ ] SSL configurado con Let's Encrypt
- [ ] (Opcional) Dynamic DNS si tienes IP dinámica

---

**Una vez completado todo, tu servidor estará accesible en: https://zeclogic.net.ar** 🎉
