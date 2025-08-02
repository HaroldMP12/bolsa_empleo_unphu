USE BolsaEmpleoUnphu;
GO

-- Agregar campo EstadoAprobacion a la tabla Usuarios
ALTER TABLE Usuarios 
ADD EstadoAprobacion VARCHAR(20) NOT NULL DEFAULT 'Aprobado';

-- Actualizar empresas existentes para que requieran aprobación
UPDATE Usuarios 
SET EstadoAprobacion = 'Pendiente', Estado = 0 
WHERE RolID = 3;

PRINT 'Campo EstadoAprobacion agregado exitosamente';