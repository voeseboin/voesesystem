# VoeseSystem APK

Sistema de gestión de negocio completo para Android. Controla ventas, stock, gastos y genera reportes PDF.

## Características

- **Modo Oscuro**: Interfaz optimizada con tema oscuro por defecto
- **Gestión de Productos**: Control de stock con alertas
- **Registro de Ventas**: Mayorista y minorista con descuentos
- **Control de Gastos**: Separación entre gastos de fábrica y personales
- **Gráficos**: Visualización de costos y producción vs ventas
- **PDF**: Generación de reportes mensuales y anuales
- **Notificaciones**: Toast notifications que aparecen y desaparecen automáticamente
- **Selector de Fecha**: Al registrar gastos puedes elegir la fecha
- **Eliminar Registros**: Puedes eliminar ventas, gastos y productos
- **Offline**: Funciona sin conexión a internet

## Estructura del Proyecto

```
voesesystem/
├── .github/
│   └── workflows/
│       └── build-apk.yml      # Workflow de GitHub Actions
├── android/                    # Proyecto Android (generado por Capacitor)
├── public/
│   ├── manifest.json          # PWA Manifest
│   ├── sw.js                  # Service Worker
│   └── icon-*.svg             # Iconos de la app
├── src/
│   ├── components/
│   │   ├── Header.tsx         # Header con selector de mes y PDF
│   │   ├── Dashboard.tsx      # Dashboard con gráficos
│   │   ├── Ventas.tsx         # Gestión de ventas
│   │   ├── Productos.tsx      # Gestión de productos y producción
│   │   ├── Gastos.tsx         # Registro de gastos con fecha
│   │   └── BottomNav.tsx      # Navegación inferior
│   ├── hooks/
│   │   ├── useLocalStorage.ts # Persistencia de datos
│   │   ├── useTheme.ts        # Modo oscuro/claro
│   │   └── useDate.ts         # Utilidades de fecha
│   ├── lib/
│   │   ├── utils.ts           # Utilidades generales
│   │   ├── pdfGenerator.ts    # Generación de PDFs
│   │   └── notifications.ts   # Sistema de notificaciones
│   ├── types/
│   │   └── index.ts           # Tipos TypeScript
│   ├── App.tsx                # Componente principal
│   └── index.css              # Estilos globales
├── capacitor.config.json      # Configuración de Capacitor
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Guía Paso a Paso para Compilar la APK

### Opción 1: Compilar con GitHub Actions (Recomendado)

Esta es la forma más fácil y automatizada. Cada vez que hagas push a la rama main, se compilará automáticamente.

#### Paso 1: Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio
2. Nombre sugerido: `voesesystem`
3. No inicialices con README (ya lo tenemos)

#### Paso 2: Subir el código

```bash
# En tu computadora local, dentro de la carpeta del proyecto
git init
git add .
git commit -m "Initial commit - VoeseSystem APK"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/voesesystem.git
git push -u origin main
```

#### Paso 3: Configurar GitHub Actions

El workflow ya está creado en `.github/workflows/build-apk.yml`. Solo necesitas:

1. Ve a tu repositorio en GitHub
2. Click en **Actions**
3. Verás el workflow "Build Android APK"
4. Click en **Run workflow** para ejecutarlo manualmente

#### Paso 4: Descargar la APK

1. Espera a que el workflow termine (aproximadamente 5-10 minutos)
2. Ve a la pestaña **Actions** y selecciona el workflow completado
3. En la sección **Artifacts**, descarga:
   - `app-debug.apk` - Para pruebas
   - `app-release-unsigned.apk` - Para producción (sin firmar)

#### Paso 5: Firmar la APK (Opcional pero recomendado)

Para distribuir la app, necesitas firmarla:

```bash
# Generar keystore (haz esto una sola vez)
keytool -genkey -v -keystore voesesystem.keystore -alias voesesystem -keyalg RSA -keysize 2048 -validity 10000

# Firmar la APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore voesesystem.keystore app-release-unsigned.apk voesesystem

# Optimizar la APK
zipalign -v 4 app-release-unsigned.apk VoeseSystem-signed.apk
```

### Opción 2: Compilar Localmente

Si prefieres compilar en tu computadora:

#### Requisitos

- Node.js 20+
- Java 17 (JDK)
- Android Studio
- Android SDK

#### Paso 1: Instalar dependencias

```bash
npm install
```

#### Paso 2: Construir la app web

```bash
npm run build
```

#### Paso 3: Agregar plataforma Android

```bash
npx cap add android
```

#### Paso 4: Sincronizar cambios

```bash
npx cap sync android
```

#### Paso 5: Abrir en Android Studio

```bash
npx cap open android
```

#### Paso 6: Compilar APK

En Android Studio:
1. Selecciona **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. O para release: **Build** > **Generate Signed Bundle / APK**

La APK se guardará en:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### Opción 3: Compilar con Docker

Si tienes Docker instalado:

```bash
# Construir imagen
docker build -t voesesystem-build .

# Ejecutar compilación
docker run -v $(pwd)/output:/output voesesystem-build
```

## Configuración de GitHub Actions con Firma Automática

Para que GitHub Actions firme automáticamente las APKs:

### Paso 1: Generar Keystore Base64

```bash
# Generar keystore
keytool -genkey -v -keystore voesesystem.keystore -alias voesesystem -keyalg RSA -keysize 2048 -validity 10000

# Convertir a base64
base64 -i voesesystem.keystore -o keystore.base64
```

### Paso 2: Agregar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** > **Secrets and variables** > **Actions**
3. Click en **New repository secret**
4. Agrega estos secrets:
   - `KEYSTORE_BASE64`: Contenido del archivo keystore.base64
   - `KEYSTORE_PASSWORD`: La contraseña del keystore
   - `KEY_ALIAS`: El alias (ej: voesesystem)
   - `KEY_PASSWORD`: La contraseña de la clave

### Paso 3: Ejecutar Workflow Firmado

1. Ve a **Actions** > **Build Android APK**
2. Click en **Run workflow**
3. Selecciona **Build Signed Release APK**
4. Ingresa la versión (ej: 1.0.0)
5. Click en **Run workflow**

La APK firmada se creará automáticamente y se subirá como Release.

## Instalación en Android

### Habilitar instalación de fuentes desconocidas

1. En tu teléfono Android, ve a **Configuración**
2. Busca **Seguridad** o **Privacidad**
3. Habilita **Instalar aplicaciones de fuentes desconocidas**
4. Selecciona el navegador o gestor de archivos que usarás

### Instalar la APK

1. Transfiere la APK a tu teléfono (USB, Bluetooth, correo, etc.)
2. Abre la APK desde el gestor de archivos
3. Click en **Instalar**
4. ¡Listo!

## Uso de la Aplicación

### Primera vez

1. Abre VoeseSystem
2. Crea tu primer producto en la pestaña **Stock**
3. Registra producción para agregar stock
4. Comienza a registrar ventas y gastos

### Generar PDF

1. Ve a cualquier pantalla
2. Click en el icono de **PDF** en el header
3. Selecciona **Reporte del Mes** o **Resumen Anual**
4. El PDF se descargará automáticamente

### Cambiar tema

1. Click en el icono de **sol/luna** en el header
2. Alterna entre modo oscuro y claro

### Eliminar registros

- **Ventas**: En la pestaña Ventas, click en el icono de papelera junto a cada venta
- **Gastos**: En la pestaña Gastos, click en el icono de papelera junto a cada gasto
- **Productos**: En la pestaña Stock, click en el icono de papelera junto a cada producto

## Solución de Problemas

### Error: "No se puede instalar la aplicación"

- Asegúrate de habilitar "Fuentes desconocidas"
- Desinstala versiones anteriores antes de instalar
- Verifica que la APK no esté corrupta

### Error en GitHub Actions

- Verifica que todos los archivos estén subidos correctamente
- Revisa los logs del workflow para ver el error específico
- Asegúrate de que `capacitor.config.json` esté configurado correctamente

### Datos no se guardan

- La app usa localStorage, los datos se guardan en el dispositivo
- Si borras datos de la app, perderás la información
- Exporta PDFs regularmente como respaldo

## Personalización

### Cambiar colores

Edita `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#3b82f6',
        dark: '#1e40af',
      },
    },
  },
}
```

### Cambiar nombre de la app

Edita `capacitor.config.json`:

```json
{
  "appName": "Tu Nombre",
  "appId": "com.tuempresa.tuapp"
}
```

### Cambiar icono

Reemplaza los archivos en `public/icon-*.svg` con tus propios iconos.

## Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Capacitor** - Wrapper para Android
- **Chart.js** - Gráficos
- **jsPDF** - Generación de PDFs
- **date-fns** - Manejo de fechas

## Licencia

MIT License - Libre para usar y modificar.

## Soporte

Si tienes problemas o preguntas:

1. Revisa esta guía completamente
2. Verifica los logs de error
3. Crea un issue en GitHub

---

**¡VoeseSystem - Gestión de negocio simplificada!**
