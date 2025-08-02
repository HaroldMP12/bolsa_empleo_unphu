USE BolsaEmpleoUnphu;
GO

-- Agregar tabla para tokens de recuperación de contraseña
CREATE TABLE PasswordResetTokens (
    TokenID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    Token VARCHAR(255) NOT NULL,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    FechaExpiracion DATETIME NOT NULL,
    Usado BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_PasswordResetTokens_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- Índice para optimizar búsquedas por token
CREATE INDEX IX_PasswordResetTokens_Token ON PasswordResetTokens(Token);
CREATE INDEX IX_PasswordResetTokens_UsuarioID ON PasswordResetTokens(UsuarioID);

PRINT 'Tabla PasswordResetTokens creada exitosamente';