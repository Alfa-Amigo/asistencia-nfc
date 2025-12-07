# 🎫 Sistema NFC Asistencias

Sistema profesional de control de asistencias con NFC y Google Sheets.

## 🚀 Características

- ✅ Registro rápido con tarjetas NFC
- ✅ Sincronización automática con Google Sheets
- ✅ Gestión completa de estudiantes
- ✅ Reportes y estadísticas
- ✅ Modo offline
- ✅ Dashboard en tiempo real

## 🌐 Despliegue en Render

1. **Conecta tu repositorio** de GitHub a Render
2. **Selecciona:** Python Web Service
3. **Configuración automática:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn server:app`
4. **¡Listo!** Tu app estará en: `https://asistencia-nfc.onrender.com`

## 📱 Uso

**URL:** `https://asistencia-nfc.onrender.com`

**Credenciales demo:**
- Usuario: `admin`
- Contraseña: `admin123`

## 🔧 Configuración

1. **Google Sheets:**
   - Ve a Configuración → Google Sheets
   - Pega el ID de tu hoja de cálculo
   - Haz clic en "Probar Conexión"

2. **Estudiantes:**
   - Importa desde CSV/Excel
   - O agrega manualmente

3. **NFC:**
   - Usa Chrome en Android
   - Programa tarjetas con formato JSON

## 📞 Soporte

- **Issues:** Reporta problemas aquí
- **Email:** [tu-email@ejemplo.com]

## 📄 Licencia

MIT
