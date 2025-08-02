-- Verificar si la tabla existe
USE BolsaEmpleoUnphu;
GO

SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'PasswordResetTokens';

-- Si no existe, crearla:
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PasswordResetTokens')
BEGIN
    CREATE TABLE PasswordResetTokens (
        TokenID INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioID INT NOT NULL,
        Token VARCHAR(255) NOT NULL,
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        FechaExpiracion DATETIME NOT NULL,
        Usado BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_PasswordResetTokens_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
    );
    
    CREATE INDEX IX_PasswordResetTokens_Token ON PasswordResetTokens(Token);
    CREATE INDEX IX_PasswordResetTokens_UsuarioID ON PasswordResetTokens(UsuarioID);
    
    PRINT 'Tabla PasswordResetTokens creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla PasswordResetTokens ya existe';
END