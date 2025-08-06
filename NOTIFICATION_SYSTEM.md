# Sistema de Notificaciones en Tiempo Real

## Descripción
Sistema de notificaciones implementado con SignalR que permite enviar notificaciones en tiempo real a usuarios, estudiantes, egresados y empresas.

## Características Implementadas

### 🔔 Icono de Campanita
- Ubicado en la esquina superior derecha del header
- Muestra un contador rojo con el número de notificaciones no leídas
- Al hacer clic, despliega un dropdown con las notificaciones

### 📱 Tipos de Notificaciones

1. **Nueva Postulación (Para Empresas)**
   - Se envía cuando un estudiante/egresado se postula a una vacante
   - Mensaje: "Nueva postulación de [Nombre] para la vacante: [Título]"

2. **Cambio de Estado de Postulación (Para Usuarios)**
   - Se envía cuando una empresa cambia el estado de una postulación
   - Mensaje: "Tu postulación para '[Vacante]' ha cambiado a: [Estado]"

3. **Aprobación de Empresa (Para Empresas)**
   - Se envía cuando el admin aprueba o rechaza una cuenta de empresa
   - Mensaje de aprobación: "¡Felicidades! Tu empresa '[Nombre]' ha sido aprobada..."
   - Mensaje de rechazo: "Tu empresa '[Nombre]' no ha sido aprobada..."

### 🛠️ Funcionalidades

- **Tiempo Real**: Las notificaciones llegan instantáneamente via SignalR
- **Contador**: Muestra el número de notificaciones no leídas
- **Marcar como Leída**: Click en una notificación la marca como leída
- **Marcar Todas**: Botón para marcar todas las notificaciones como leídas
- **Formato de Tiempo**: Muestra tiempo relativo (ej: "5m", "2h", "1d")

## Estructura Técnica

### Backend (C# .NET)
- **NotificacionesHub.cs**: Hub de SignalR para conexiones en tiempo real
- **NotificacionService.cs**: Servicio para enviar notificaciones
- **NotificacionesController.cs**: API endpoints para gestionar notificaciones
- **NotificacionesModel.cs**: Modelo de base de datos

### Frontend (Angular)
- **notification.service.ts**: Servicio para manejar SignalR y API calls
- **notification-bell.component.ts**: Componente de la campanita con dropdown
- **header.component.ts**: Header actualizado con la campanita

## Endpoints API

- `GET /api/notificaciones` - Obtener todas las notificaciones del usuario
- `GET /api/notificaciones/no-leidas` - Obtener notificaciones no leídas
- `GET /api/notificaciones/contador` - Obtener contador de no leídas
- `PUT /api/notificaciones/{id}/marcar-leida` - Marcar notificación como leída
- `PUT /api/notificaciones/marcar-todas-leidas` - Marcar todas como leídas
- `POST /api/notificaciones/test` - Endpoint de prueba (solo Admin)

## Configuración

### SignalR Hub URL
- Desarrollo: `https://localhost:7236/notificacionesHub`
- El hub está configurado con autenticación JWT

### Base de Datos
La tabla `Notificaciones` ya existe con los campos:
- NotificacionID (PK)
- UsuarioID (FK)
- Mensaje
- FechaEnvio
- Estado (leída/no leída)
- ReferenciaTipo

## Uso

1. **Para Desarrolladores**: El sistema se inicializa automáticamente cuando el usuario hace login
2. **Para Usuarios**: Simplemente observar la campanita en el header para nuevas notificaciones
3. **Para Testing**: Los admins pueden usar el endpoint `/api/notificaciones/test` para probar

## Próximas Mejoras Sugeridas

- [ ] Notificaciones push del navegador
- [ ] Sonido de notificación
- [ ] Filtros por tipo de notificación
- [ ] Historial completo de notificaciones
- [ ] Configuración de preferencias de notificación