# Plataforma Bibliográfica Masónica — TODO

## Base de datos y backend
- [x] Esquema: tabla `documents` (título, autor, categoría, descripción, fileKey, status, userId)
- [x] Esquema: tabla `notifications` (userId, tipo, mensaje, leída)
- [x] Esquema: tabla `announcements` (título, contenido, adminId, fecha)
- [x] Migración SQL aplicada vía webdev_execute_sql
- [x] Procedimiento tRPC: subir documento (upload + storagePut)
- [x] Procedimiento tRPC: listar mis documentos
- [x] Procedimiento tRPC: listar documentos aprobados (biblioteca)
- [x] Procedimiento tRPC: buscar/filtrar documentos por categoría
- [x] Procedimiento tRPC: aprobar/rechazar/eliminar documento (admin)
- [x] Procedimiento tRPC: listar todos los documentos (admin)
- [x] Procedimiento tRPC: listar usuarios (admin)
- [x] Procedimiento tRPC: cambiar rol de usuario (admin)
- [x] Procedimiento tRPC: crear comunicado (admin)
- [x] Procedimiento tRPC: listar comunicados
- [x] Procedimiento tRPC: listar notificaciones del usuario
- [x] Procedimiento tRPC: marcar notificación como leída
- [x] Notificación al admin cuando se sube un nuevo documento
- [x] Notificación al usuario cuando su documento es aprobado/rechazado

## Frontend — Identidad visual
- [x] Paleta masónica en index.css: negro, azul oscuro, dorado, blanco
- [x] Tipografía serif elegante (Google Fonts)
- [x] Tema oscuro por defecto
- [x] Simbolismo geométrico sutil en la página de inicio

## Frontend — Página de inicio pública
- [x] Hero con nombre de la plataforma y botón de acceso
- [x] Diseño con elementos masónicos (compás, escuadra, geometría)
- [x] Pie de página con "Derechos reservados"
- [x] Responsive en móvil y escritorio

## Frontend — Autenticación
- [x] Página de login con diseño masónico
- [x] Redirección post-login según rol (user → /dashboard, admin → /admin)
- [x] Protección de rutas privadas

## Frontend — Panel de usuario
- [x] Dashboard personal con tarjetas de acceso rápido
- [x] Página: Subir documento (formulario + upload de archivo)
- [x] Página: Mis trabajos enviados (listado con estado)
- [x] Página: Biblioteca (documentos aprobados + búsqueda + filtros)
- [x] Página: Notificaciones del usuario
- [x] Página: Comunicados internos

## Frontend — Panel de administrador
- [x] Dashboard admin con estadísticas
- [x] Página: Gestión de trabajos (aprobar/rechazar/eliminar)
- [x] Página: Gestión de usuarios (lista + cambiar rol)
- [x] Página: Publicar comunicados
- [x] Página: Notificaciones del admin

## Navegación responsive
- [x] Sidebar lateral en escritorio
- [x] Menú hamburguesa en móvil/tablet
- [x] Navegación inferior opcional en móvil

## Seguridad
- [x] Rutas protegidas por autenticación
- [x] Rutas de admin protegidas por rol
- [x] URLs de S3 con acceso restringido (no públicas)
- [x] Validación de tipo y tamaño de archivo en backend

## Tests
- [x] Test: subir documento
- [x] Test: aprobar/rechazar documento
- [x] Test: notificaciones

## Correcciones y mejoras
- [x] Corregir callback OAuth para redirigir según rol (admin → /admin, miembro → /dashboard)
- [x] Agregar dos botones separados en página de inicio: Acceso Miembros y Acceso Administrador
- [x] Integrar logo masónico oficial (Ordo Ab Chao) en toda la plataforma
- [x] Implementar sistema de códigos de invitación para control de acceso
- [x] Crear tablas invitations e invitationUses en base de datos
- [x] Agregar procedimientos tRPC para generar, validar y canjear códigos
- [x] Página de canjear código (RedeemInvitation.tsx)
- [x] Panel de administrador para gestionar códigos (AdminInvitations.tsx)
- [x] Agregar opción de Invitaciones al sidebar del admin

## Sistema de Autenticación por Correo (Nueva implementación)
- [ ] Actualizar esquema: tabla de solicitudes de acceso, campos en usuarios
- [ ] Implementar hashing de contraseñas (bcrypt)
- [ ] Crear procedimientos tRPC para solicitar acceso, login, logout
- [ ] Crear procedimientos tRPC para admin: listar solicitudes, aprobar, rechazar
- [ ] Página de solicitud de acceso (reemplazar OAuth)
- [ ] Panel de admin para gestionar solicitudes
- [ ] Sistema de notificaciones por correo (aprobación/rechazo)
- [ ] Eliminar OAuth de la página de inicio
- [ ] Proteger rutas con autenticación por correo
