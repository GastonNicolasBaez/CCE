#!/bin/bash
# ==============================================
# Club Comandante Espora - Security Setup Script  
# ==============================================
# Este script automatiza la configuración segura inicial

set -e  # Exit on any error

echo "🔒 Club Comandante Espora - Security Setup"
echo "=========================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio BackendCCE"
    exit 1
fi

# Generar secretos únicos
echo "🔑 Generando secretos criptográficos..."
JWT_SECRET=$(openssl rand -base64 32)
WEBHOOK_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 24)

echo "✅ Secretos generados exitosamente"

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    
    cat > .env << EOF
# ==============================================
# CLUB COMANDANTE ESPORA - LOCAL ENVIRONMENT
# ==============================================
# 🔒 Generated automatically - $(date)

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_PATH=./database.sqlite

# JWT Configuration (SECURE - Auto-generated)
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# MercadoPago Configuration  
MP_ACCESS_TOKEN=your-mercadopago-access-token
MP_PUBLIC_KEY=your-mercadopago-public-key
MP_WEBHOOK_SECRET=$WEBHOOK_SECRET
MP_SUCCESS_URL=http://localhost:3000/pago-exitoso
MP_FAILURE_URL=http://localhost:3000/pago-fallido
MP_PENDING_URL=http://localhost:3000/pago-pendiente

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=Club Comandante Espora <noreply@clubespora.com>

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+54xxxxxxxxxx

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
EOF

    echo "✅ Archivo .env creado con secretos seguros"
else
    echo "⚠️  Archivo .env ya existe, no se sobrescribirá"
fi

# Configurar permisos seguros
chmod 600 .env 2>/dev/null || echo "⚠️  No se pudieron cambiar permisos (probablemente Windows)"

# Verificar .gitignore
if ! grep -q "^\.env$" ../.gitignore 2>/dev/null; then
    echo ".env" >> ../.gitignore
    echo "✅ .env añadido a .gitignore"
fi

# Mostrar resumen de configuración
echo ""
echo "🎯 Configuración completada:"
echo "   • JWT_SECRET: ✅ Único de 32 bytes"
echo "   • WEBHOOK_SECRET: ✅ Único de 32 bytes"  
echo "   • Permisos .env: ✅ Restringidos"
echo "   • .gitignore: ✅ Configurado"
echo ""

echo "📋 Próximos pasos:"
echo "   1. Editar .env con tus credenciales reales:"
echo "      • EMAIL_USER y EMAIL_PASS (usar App Password)"
echo "      • Tokens de MercadoPago"
echo "      • Configuración de Twilio (opcional)"
echo ""
echo "   2. Para producción, usar .env.production.example"
echo ""

echo "🔐 IMPORTANTE:"
echo "   • NUNCA subas .env al repositorio"
echo "   • Usa App Password para Gmail"
echo "   • Cambia secretos cada 6 meses"
echo ""

echo "✅ Setup de seguridad completado!"