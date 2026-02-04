# Dockerfile para compilar VoeseSystem APK
FROM node:20-slim

# Instalar dependencias de sistema
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Configurar variables de entorno de Java
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# Instalar Android SDK
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools

RUN mkdir -p $ANDROID_SDK_ROOT && \
    cd $ANDROID_SDK_ROOT && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip -q commandlinetools-linux-9477386_latest.zip && \
    rm commandlinetools-linux-9477386_latest.zip && \
    mkdir -p cmdline-tools/latest && \
    mv cmdline-tools/bin cmdline-tools/latest/ && \
    mv cmdline-tools/lib cmdline-tools/latest/

# Aceptar licencias de Android
RUN yes | sdkmanager --licenses

# Instalar plataformas y build tools
RUN sdkmanager "platforms;android-33" "build-tools;33.0.0" "platform-tools"

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Construir app web
RUN npm run build

# Instalar Capacitor Android
RUN npm install @capacitor/android

# Sincronizar Capacitor
RUN npx cap sync android

# Compilar APK Debug
RUN cd android && ./gradlew assembleDebug

# Compilar APK Release (sin firmar)
RUN cd android && ./gradlew assembleRelease

# Copiar APKs a directorio de salida
RUN mkdir -p /output && \
    cp android/app/build/outputs/apk/debug/app-debug.apk /output/ && \
    cp android/app/build/outputs/apk/release/app-release-unsigned.apk /output/

# Comando por defecto
CMD ["cp", "-r", "/output", "/output-host"]
