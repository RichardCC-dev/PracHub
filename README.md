# PracHub

PracHub es una plataforma web en arquitectura Cliente-Servidor que combine herramientas de preparación profesional y una bolsa de prácticas, con el fin de aumentar la tasa de éxito en la obtención de prácticas preprofesionales de estudiantes


## Requisitos Previos
- Node.js (v18.x o superior)
- MySQL

## Configuraci�n del Entorno
1. Clona el repositorio.
2. Crea un archivo `.env` en la carpeta `/server` con tus credenciales de base de datos y JWT.
3. Crea un archivo `.env` en la carpeta `/client` si requieres variables publicas.

## Instrucciones para Servidor de Desarrollo

### 1. Backend (Servidor Node/Express)
```bash
cd server
npm install
npm run dev
```
*(El servidor se ejecutara en el puerto configurado en tu archivo .env, usualmente http://localhost:3000)*

### 2. Frontend (Cliente React/Vite)
Abre otra terminal:
```bash
cd client
npm install
npm run dev
```
*(React se encargara de levantar la interfaz grafica)*
