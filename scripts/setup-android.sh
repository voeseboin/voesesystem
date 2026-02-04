#!/bin/bash

# Script para configurar Android localmente

echo "🚀 Configurando VoeseSystem para Android..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Verificar Java
if ! command -v java &> /dev/null; then
    echo "❌ Java no está instalado. Por favor instala JDK 17."
    exit 1
fi

echo "✅ Java version: $(java -version 2>&1 | head -n 1)"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Instalar Capacitor Android
echo "📱 Instalando Capacitor Android..."
npm install @capacitor/android

# Construir app web
echo "🔨 Construyendo app web..."
npm run build

# Agregar plataforma Android
echo "➕ Agregando plataforma Android..."
npx cap add android

# Sincronizar
echo "🔄 Sincronizando..."
npx cap sync android

echo "✅ Configuración completa!"
echo ""
echo "Para abrir en Android Studio:"
echo "  npx cap open android"
echo ""
echo "Para compilar APK de debug:"
echo "  cd android && ./gradlew assembleDebug"
echo ""
echo "La APK se guardará en:"
echo "  android/app/build/outputs/apk/debug/app-debug.apk"
