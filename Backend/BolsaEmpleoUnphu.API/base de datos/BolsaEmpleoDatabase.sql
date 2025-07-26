-- =============================================
-- Base de Datos: Bolsa de Empleo UNPHU
-- =============================================

CREATE DATABASE BolsaEmpleoUnphu;
GO

USE BolsaEmpleoUnphu;
GO

-- =============================================
-- TABLAS PRINCIPALES
-- =============================================

-- Tabla: Roles
CREATE TABLE Roles (
    RolID INT IDENTITY(1,1) PRIMARY KEY,
    NombreRol VARCHAR(50) NOT NULL
);

-- Tabla: Carreras
CREATE TABLE Carreras (
    CarreraID INT IDENTITY(1,1) PRIMARY KEY,
    NombreCarrera VARCHAR(100) NOT NULL,
    Facultad VARCHAR(100) NOT NULL
);

-- Tabla: Categorias (con auto-relación jerárquica)
CREATE TABLE Categorias (
    CategoriaID INT IDENTITY(1,1) PRIMARY KEY,
    NombreCategoria VARCHAR(100) NOT NULL,
    CategoriaPadreID INT NULL,
    CONSTRAINT FK_Categorias_CategoriaPadre FOREIGN KEY (CategoriaPadreID) REFERENCES Categorias(CategoriaID)
);

-- Tabla: Usuarios
CREATE TABLE Usuarios (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto VARCHAR(150) NOT NULL,
    Correo VARCHAR(100) NOT NULL UNIQUE,
    Contraseña VARCHAR(255) NOT NULL,
    Telefono VARCHAR(20) NULL,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE(),
    Estado BIT NOT NULL DEFAULT 1,
    RolID INT NOT NULL,
    FechaCambioUltimaContraseña DATETIME NULL,
    FechaUltimaActualización DATETIME NULL,
    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (RolID) REFERENCES Roles(RolID)
);

-- Tabla: Perfiles
CREATE TABLE Perfiles (
    PerfilID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    TipoPerfil VARCHAR(20) NOT NULL CHECK (TipoPerfil IN ('Estudiante', 'Egresado', 'Ambos')),
    Matricula VARCHAR(20) NULL,
    CarreraID INT NOT NULL,
    Semestre INT NULL,
    FechaIngreso DATE NULL,
    TituloObtenido VARCHAR(100) NULL,
    FechaEgreso DATE NULL,
    AñoGraduacion INT NULL,
    UrlImagen VARCHAR(300) NULL,
    Resumen NVARCHAR(MAX) NULL,
    RedesSociales NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Perfiles_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    CONSTRAINT FK_Perfiles_Carreras FOREIGN KEY (CarreraID) REFERENCES Carreras(CarreraID)
);

-- Tabla: Empresas
CREATE TABLE Empresas (
    EmpresaID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    NombreEmpresa VARCHAR(100) NOT NULL,
    RNC VARCHAR(20) NOT NULL UNIQUE,
    Sector VARCHAR(50) NULL,
    TelefonoEmpresa VARCHAR(20) NULL,
    Direccion VARCHAR(255) NULL,
    SitioWeb VARCHAR(150) NULL,
    Descripcion NVARCHAR(MAX) NULL,
    Observaciones NVARCHAR(MAX) NULL,
    ImagenLogo VARCHAR(300) NULL,
    ImagenPortada VARCHAR(300) NULL,
    CantidadEmpleados VARCHAR(100) NULL,
    CONSTRAINT FK_Empresas_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- Tabla: Vacantes
CREATE TABLE Vacantes (
    VacanteID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    TituloVacante VARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(MAX) NOT NULL,
    Requisitos NVARCHAR(MAX) NOT NULL,
    FechaPublicacion DATETIME NOT NULL DEFAULT GETDATE(),
    FechaCierre DATETIME NOT NULL,
    FechaModificacion DATETIME NULL,
    Ubicacion VARCHAR(100) NULL,
    TipoContrato VARCHAR(50) NULL,
    Jornada VARCHAR(30) NULL,
    Modalidad VARCHAR(30) NULL,
    Salario DECIMAL(10, 2) NULL,
    CantidadVacantes INT NOT NULL DEFAULT 1,
    CategoriaID INT NOT NULL,
    CONSTRAINT FK_Vacantes_Empresas FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID),
    CONSTRAINT FK_Vacantes_Categorias FOREIGN KEY (CategoriaID) REFERENCES Categorias(CategoriaID)
);

-- Tabla: Postulaciones
CREATE TABLE Postulaciones (
    PostulacionID INT IDENTITY(1,1) PRIMARY KEY,
    VacanteID INT NOT NULL,
    UsuarioID INT NOT NULL,
    FechaPostulacion DATETIME NOT NULL DEFAULT GETDATE(),
    Estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
    Observaciones NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Postulaciones_Vacantes FOREIGN KEY (VacanteID) REFERENCES Vacantes(VacanteID),
    CONSTRAINT FK_Postulaciones_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- Tabla: PreguntasVacantes
CREATE TABLE PreguntasVacantes (
    PreguntaID INT IDENTITY(1,1) PRIMARY KEY,
    VacanteID INT NOT NULL,
    Pregunta NVARCHAR(255) NOT NULL,
    CONSTRAINT FK_PreguntasVacantes_Vacantes FOREIGN KEY (VacanteID) REFERENCES Vacantes(VacanteID)
);

-- Tabla: RespuestasPostulaciones
CREATE TABLE RespuestasPostulaciones (
    RespuestaID INT IDENTITY(1,1) PRIMARY KEY,
    PostulacionID INT NOT NULL,
    PreguntaID INT NOT NULL,
    Respuesta NVARCHAR(MAX) NOT NULL,
    CONSTRAINT FK_RespuestasPostulaciones_Postulaciones FOREIGN KEY (PostulacionID) REFERENCES Postulaciones(PostulacionID),
    CONSTRAINT FK_RespuestasPostulaciones_Preguntas FOREIGN KEY (PreguntaID) REFERENCES PreguntasVacantes(PreguntaID)
);

-- Tabla: Notificaciones
CREATE TABLE Notificaciones (
    NotificacionID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    Mensaje NVARCHAR(MAX) NOT NULL,
    FechaEnvio DATETIME NOT NULL DEFAULT GETDATE(),
    Estado BIT NOT NULL DEFAULT 0,
    ReferenciaTipo VARCHAR(50) NULL,
    CONSTRAINT FK_Notificaciones_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- Tabla: BitacoraAcciones
CREATE TABLE BitacoraAcciones (
    RegistroID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    TipoAccion VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(150) NOT NULL,
    FechaAccion DATETIME NOT NULL DEFAULT GETDATE(),
    EntidadAfectada VARCHAR(50) NOT NULL,
    CONSTRAINT FK_BitacoraAcciones_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- Tabla: InformacionesAcademicas
CREATE TABLE InformacionesAcademicas (
    InfoAcademicaID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    TituloObtenido VARCHAR(100) NOT NULL,
    Institucion VARCHAR(100) NOT NULL,
    FechaInicio DATE NOT NULL,
    FechaFin DATE NOT NULL,
    NivelDeFormacion VARCHAR(50) NOT NULL,
    CONSTRAINT FK_InformacionesAcademicas_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- Tabla: InformacionesLaborales
CREATE TABLE InformacionesLaborales (
    InfoLaboralID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    Empresa VARCHAR(100) NOT NULL,
    Cargo VARCHAR(100) NOT NULL,
    FechaInicio DATE NOT NULL,
    FechaFin DATE NULL,
    ActualmenteTrabajando BIT NOT NULL DEFAULT 0,
    Descripcion VARCHAR(150) NULL,
    CONSTRAINT FK_InformacionesLaborales_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices en Usuarios
CREATE INDEX IX_Usuarios_Correo ON Usuarios(Correo);
CREATE INDEX IX_Usuarios_RolID ON Usuarios(RolID);
CREATE INDEX IX_Usuarios_Estado ON Usuarios(Estado);

-- Índices en Vacantes
CREATE INDEX IX_Vacantes_EmpresaID ON Vacantes(EmpresaID);
CREATE INDEX IX_Vacantes_CategoriaID ON Vacantes(CategoriaID);
CREATE INDEX IX_Vacantes_FechaPublicacion ON Vacantes(FechaPublicacion);
CREATE INDEX IX_Vacantes_FechaCierre ON Vacantes(FechaCierre);

-- Índices en Postulaciones
CREATE INDEX IX_Postulaciones_VacanteID ON Postulaciones(VacanteID);
CREATE INDEX IX_Postulaciones_UsuarioID ON Postulaciones(UsuarioID);
CREATE INDEX IX_Postulaciones_Estado ON Postulaciones(Estado);
CREATE INDEX IX_Postulaciones_FechaPostulacion ON Postulaciones(FechaPostulacion);

-- Índices en Notificaciones
CREATE INDEX IX_Notificaciones_UsuarioID ON Notificaciones(UsuarioID);
CREATE INDEX IX_Notificaciones_Estado ON Notificaciones(Estado);
CREATE INDEX IX_Notificaciones_FechaEnvio ON Notificaciones(FechaEnvio);

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar Roles básicos
INSERT INTO Roles (NombreRol) VALUES 
('Estudiante'),
('Egresado'),
('Empresa'),
('Admin'),
('Soporte');

-- Insertar Categorías básicas
INSERT INTO Categorias (NombreCategoria, CategoriaPadreID) VALUES 
('Tecnología', NULL),
('Salud', NULL),
('Educación', NULL),
('Finanzas', NULL),
('Marketing', NULL),
('Desarrollo de Software', 1),
('Soporte Técnico', 1),
('Enfermería', 2),
('Medicina', 2);

GO

PRINT 'Base de datos BolsaEmpleoUnphu creada exitosamente';