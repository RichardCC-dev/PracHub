# PracHub

PracHub es una plataforma web en arquitectura Cliente-Servidor que combina herramientas de preparaciÃ³n profesional y una bolsa de prÃ¡cticas, con el fin de aumentar la tasa de Ã©xito en la obtenciÃ³n de prÃ¡cticas preprofesionales de estudiantes.


## Requisitos Previos
- Node.js (v18.x o superior)
- MySQL

## Configuración del Entorno
1. Clona el repositorio.
2. Copia `server/.env.example` a `server/.env` y completa tus credenciales de base de datos, JWT y demás variables.
3. Copia `client/.env.example` a `client/.env` si requieres variables públicas.

> **Importante:** nunca subas archivos `.env` al repositorio. Ya están ignorados en `.gitignore`.

## Instrucciones para Servidor de Desarrollo

### 1. Backend (Servidor Node/Express)
```bash
cd server
npm install
npm run dev
```
*(El servidor se ejecutará en el puerto configurado en tu archivo .env, usualmente http://localhost:4000)*

### 2. Frontend (Cliente React/Vite)
Abre otra terminal:
```bash
cd client
npm install
npm run dev
```
*(React se encargará de levantar la interfaz gráfica)*
