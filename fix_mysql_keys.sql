-- Script para limpiar índices de la tabla Users
-- Ejecutar en phpMyAdmin: http://localhost/phpmyadmin
-- 1. Seleccionar base de datos 'prachub'
-- 2. Ir a pestaña SQL
-- 3. Pegar y ejecutar este script

-- Primero, vemos qué índices existen
-- SHOW INDEX FROM Users;

-- Eliminar índices duplicados o innecesarios (conservar PRIMARY)
-- Nota: Ajusta los nombres según lo que veas en SHOW INDEX

-- Eliminar índices extra de email (dejar solo uno UNIQUE)
DROP INDEX IF EXISTS email ON Users;
DROP INDEX IF EXISTS email_2 ON Users;
DROP INDEX IF EXISTS email_3 ON Users;
DROP INDEX IF EXISTS email_4 ON Users;
DROP INDEX IF EXISTS email_5 ON Users;
DROP INDEX IF EXISTS email_6 ON Users;
DROP INDEX IF EXISTS email_7 ON Users;
DROP INDEX IF EXISTS email_8 ON Users;
DROP INDEX IF EXISTS email_9 ON Users;
DROP INDEX IF EXISTS email_10 ON Users;

-- Volver a crear índice único correctamente
ALTER TABLE Users ADD UNIQUE INDEX idx_email (email);

-- Verificar resultado
SHOW INDEX FROM Users;
