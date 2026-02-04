# 🚀 Guía Rápida - VoeseSystem APK

## 📱 Tu Aplicación está Lista

He creado una aplicación Android completa con todas las funcionalidades que solicitaste:

### ✅ Características Implementadas

1. **Modo Oscuro** - Interfaz elegante con tema oscuro por defecto
2. **Gráficos Optimizados** - Charts responsivos para móvil con Chart.js
3. **Selector de Fecha** - Al agregar gastos puedes elegir la fecha
4. **Generación de PDF** - Reportes mensuales y anuales completos
5. **Notificaciones Toast** - Aparecen arriba y desaparecen automáticamente (3 segundos)
6. **Eliminar Registros** - Puedes eliminar ventas, gastos y productos
7. **PWA + APK** - Funciona como app web y puede convertirse a APK

## 📁 Estructura del Proyecto

```
app/
├── src/
│   ├── components/     # Componentes React (Dashboard, Ventas, Productos, Gastos)
│   ├── hooks/          # Hooks personalizados (tema, fechas, localStorage)
│   ├── lib/            # Utilidades (PDF, notificaciones)
│   ├── types/          # Tipos TypeScript
│   └── App.tsx         # Aplicación principal
├── public/             # Archivos públicos (manifest, service worker, iconos)
├── .github/workflows/  # GitHub Actions para compilar APK automáticamente
├── capacitor.config.json
├── Dockerfile          # Para compilar con Docker
└── README.md           # Guía completa
```

## 🛠️ Cómo Compilar la APK

### Opción 1: GitHub Actions (Recomendado - Automático)

1. **Crea un repositorio en GitHub**
   - Ve a https://github.com/new
   - Nombre: `voesesystem`

2. **Sube el código**
   ```bash
   cd app
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/voesesystem.git
   git push -u origin main
   ```

3. **Ejecuta el workflow**
   - Ve a tu repositorio en GitHub
   - Click en **Actions** → **Build Android APK**
   - Click en **Run workflow**
   - Espera 5-10 minutos

4. **Descarga la APK**
   - Ve a la pestaña **Actions** y selecciona el workflow completado
   - En **Artifacts** descarga `app-debug.apk`

### Opción 2: Local con Android Studio

1. **Requisitos:**
   - Node.js 20+
   - Java 17 (JDK)
   - Android Studio

2. **Instala dependencias:**
   ```bash
   cd app
   npm install
   npm install @capacitor/android
   ```

3. **Compila:**
   ```bash
   npm run build
   npx cap add android
   npx cap sync android
   npx cap open android
   ```

4. **En Android Studio:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

### Opción 3: Docker

```bash
cd app
docker build -t voesesystem .
docker run -v $(pwd)/output:/output voesesystem
```

## 📲 Instalación en Android

1. **Habilitar fuentes desconocidas:**
   - Configuración → Seguridad → Fuentes desconocidas → Habilitar

2. **Transferir APK:**
   - Envía el archivo APK a tu teléfono (USB, Bluetooth, correo)

3. **Instalar:**
   - Abre la APK desde el gestor de archivos
   - Click en "Instalar"

## 🎯 Cómo Usar la App

### Primera vez:
1. Abre VoeseSystem
2. Ve a **Stock** y crea tu primer producto
3. Registra producción para agregar stock
4. Comienza a registrar ventas y gastos

### Generar PDF:
1. Click en el icono **PDF** en el header
2. Selecciona "Reporte del Mes" o "Resumen Anual"
3. El PDF se descarga automáticamente

### Cambiar Tema:
1. Click en el icono **sol/luna** en el header

### Eliminar Registros:
- Cada venta, gasto y producto tiene un icono de 🗑️ para eliminar

## 🔐 Firmar la APK (Para distribución)

Para distribuir la app necesitas firmarla:

```bash
# Generar keystore (una sola vez)
keytool -genkey -v -keystore voesesystem.keystore -alias voesesystem -keyalg RSA -keysize 2048 -validity 10000

# Firmar APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore voesesystem.keystore app-release-unsigned.apk voesesystem

# Optimizar
zipalign -v 4 app-release-unsigned.apk VoeseSystem-signed.apk
```

## 📋 Checklist de Funcionalidades

| Funcionalidad | Estado |
|---------------|--------|
| Modo oscuro | ✅ |
| Gráficos optimizados móvil | ✅ |
| Selector de fecha gastos | ✅ |
| Generar PDF mensual | ✅ |
| Generar PDF anual | ✅ |
| Notificaciones toast | ✅ |
| Eliminar ventas | ✅ |
| Eliminar gastos | ✅ |
| Eliminar productos | ✅ |
| Persistencia datos (localStorage) | ✅ |
| Funciona offline (PWA) | ✅ |

## 🆘 Solución de Problemas

### "No se puede instalar"
- Habilita "Fuentes desconocidas" en Configuración
- Desinstala versiones anteriores

### Error en GitHub Actions
- Revisa que todos los archivos estén subidos
- Verifica los logs del workflow

### Datos no se guardan
- Los datos se guardan en el dispositivo (localStorage)
- Exporta PDFs regularmente como respaldo

## 📞 Soporte

Si tienes problemas:
1. Revisa el README.md completo en la carpeta `app/`
2. Verifica los logs de error
3. Consulta la documentación de Capacitor: https://capacitorjs.com

---

**¡Tu app está lista para usar! 🎉**
