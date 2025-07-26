-- =============================================
-- Datos Sintéticos: Bolsa de Empleo UNPHU
-- =============================================

USE BolsaEmpleoUnphu;
GO

-- =============================================
-- INSERTAR CARRERAS
-- =============================================

INSERT INTO Carreras (NombreCarrera, Facultad) VALUES 
('Ingeniería en Sistemas', 'Facultad de Ingeniería'),
('Ingeniería Civil', 'Facultad de Ingeniería'),
('Medicina', 'Facultad de Ciencias de la Salud'),
('Enfermería', 'Facultad de Ciencias de la Salud'),
('Administración de Empresas', 'Facultad de Ciencias Económicas'),
('Contabilidad', 'Facultad de Ciencias Económicas'),
('Derecho', 'Facultad de Ciencias Jurídicas'),
('Psicología', 'Facultad de Humanidades'),
('Comunicación Social', 'Facultad de Humanidades'),
('Arquitectura', 'Facultad de Ingeniería');

-- =============================================
-- INSERTAR USUARIOS
-- =============================================

-- Estudiantes
INSERT INTO Usuarios (NombreCompleto, Correo, Contraseña, Telefono, RolID, Estado) VALUES 
('María González Pérez', 'maria.gonzalez@estudiante.unphu.edu.do', 'hash123', '809-555-0101', 1, 1),
('Carlos Rodríguez López', 'carlos.rodriguez@estudiante.unphu.edu.do', 'hash123', '809-555-0102', 1, 1),
('Ana Martínez Santos', 'ana.martinez@estudiante.unphu.edu.do', 'hash123', '809-555-0103', 1, 1),
('Luis Fernández García', 'luis.fernandez@estudiante.unphu.edu.do', 'hash123', '809-555-0104', 1, 1),
('Carmen Jiménez Ruiz', 'carmen.jimenez@estudiante.unphu.edu.do', 'hash123', '809-555-0105', 1, 1);

-- Egresados
INSERT INTO Usuarios (NombreCompleto, Correo, Contraseña, Telefono, RolID, Estado) VALUES 
('Roberto Castillo Morales', 'roberto.castillo@gmail.com', 'hash123', '809-555-0201', 2, 1),
('Patricia Herrera Díaz', 'patricia.herrera@hotmail.com', 'hash123', '809-555-0202', 2, 1),
('Miguel Vargas Torres', 'miguel.vargas@yahoo.com', 'hash123', '809-555-0203', 2, 1),
('Sofía Mendoza Cruz', 'sofia.mendoza@gmail.com', 'hash123', '809-555-0204', 2, 1),
('Diego Ramírez Flores', 'diego.ramirez@outlook.com', 'hash123', '809-555-0205', 2, 1);

-- Empresas
INSERT INTO Usuarios (NombreCompleto, Correo, Contraseña, Telefono, RolID, Estado) VALUES 
('TechSolutions RD', 'rrhh@techsolutions.com.do', 'hash123', '809-555-0301', 3, 1),
('Banco Popular Dominicano', 'empleos@bpd.com.do', 'hash123', '809-555-0302', 3, 1),
('Clínica Abreu', 'recursos@clinicaabreu.com', 'hash123', '809-555-0303', 3, 1),
('Constructora Estrella', 'rrhh@constructoraestrella.com', 'hash123', '809-555-0304', 3, 1),
('Agencia Digital Caribe', 'contacto@digitalcaribe.com', 'hash123', '809-555-0305', 3, 1);

-- Administradores
INSERT INTO Usuarios (NombreCompleto, Correo, Contraseña, Telefono, RolID, Estado) VALUES 
('Admin Sistema', 'admin@unphu.edu.do', 'hash123', '809-555-0401', 4, 1),
('Soporte Técnico', 'soporte@unphu.edu.do', 'hash123', '809-555-0402', 5, 1);

-- =============================================
-- INSERTAR PERFILES DE ESTUDIANTES
-- =============================================

INSERT INTO Perfiles (UsuarioID, TipoPerfil, Matricula, CarreraID, Semestre, FechaIngreso, Resumen) VALUES 
(1, 'Estudiante', '2021-0001', 1, 8, '2021-08-15', 'Estudiante de Ingeniería en Sistemas con enfoque en desarrollo web y móvil.'),
(2, 'Estudiante', '2020-0002', 2, 10, '2020-08-15', 'Estudiante de Ingeniería Civil interesado en proyectos de infraestructura.'),
(3, 'Estudiante', '2022-0003', 4, 6, '2022-01-15', 'Estudiante de Enfermería con vocación de servicio y cuidado de pacientes.'),
(4, 'Estudiante', '2021-0004', 5, 7, '2021-08-15', 'Estudiante de Administración con interés en gestión empresarial.'),
(5, 'Estudiante', '2023-0005', 9, 3, '2023-01-15', 'Estudiante de Comunicación Social apasionada por el periodismo digital.');

-- =============================================
-- INSERTAR PERFILES DE EGRESADOS
-- =============================================

INSERT INTO Perfiles (UsuarioID, TipoPerfil, CarreraID, TituloObtenido, FechaEgreso, AñoGraduacion, Resumen) VALUES 
(6, 'Egresado', 1, 'Ingeniero en Sistemas', '2019-12-15', 2019, 'Desarrollador Full Stack con 4 años de experiencia en tecnologías web.'),
(7, 'Egresado', 3, 'Doctora en Medicina', '2018-12-15', 2018, 'Médica general con especialización en medicina interna.'),
(8, 'Egresado', 5, 'Licenciado en Administración', '2020-12-15', 2020, 'Administrador con experiencia en gestión de proyectos y recursos humanos.'),
(9, 'Egresado', 6, 'Licenciada en Contabilidad', '2017-12-15', 2017, 'Contadora pública con experiencia en auditoría y finanzas corporativas.'),
(10, 'Egresado', 10, 'Arquitecto', '2016-12-15', 2016, 'Arquitecto especializado en diseño residencial y comercial.');

-- =============================================
-- INSERTAR EMPRESAS
-- =============================================

INSERT INTO Empresas (UsuarioID, NombreEmpresa, RNC, Sector, TelefonoEmpresa, Direccion, SitioWeb, Descripcion, CantidadEmpleados) VALUES 
(11, 'TechSolutions RD', '131-12345-6', 'Tecnología', '809-555-0301', 'Av. Winston Churchill, Santo Domingo', 'www.techsolutions.com.do', 'Empresa líder en desarrollo de software y soluciones tecnológicas.', '51-100'),
(12, 'Banco Popular Dominicano', '101-00001-2', 'Finanzas', '809-555-0302', 'Av. John F. Kennedy, Santo Domingo', 'www.bpd.com.do', 'Institución financiera líder en República Dominicana.', 'Más de 1000'),
(13, 'Clínica Abreu', '101-00002-3', 'Salud', '809-555-0303', 'Av. Independencia, Santo Domingo', 'www.clinicaabreu.com', 'Centro médico de alta complejidad con servicios especializados.', '201-500'),
(14, 'Constructora Estrella', '131-54321-7', 'Construcción', '809-555-0304', 'Zona Industrial Herrera, Santo Domingo', 'www.constructoraestrella.com', 'Empresa constructora especializada en proyectos residenciales y comerciales.', '101-200'),
(15, 'Agencia Digital Caribe', '131-98765-8', 'Marketing Digital', '809-555-0305', 'Piantini, Santo Domingo', 'www.digitalcaribe.com', 'Agencia de marketing digital y publicidad creativa.', '11-50');

-- =============================================
-- INSERTAR VACANTES
-- =============================================

INSERT INTO Vacantes (EmpresaID, TituloVacante, Descripcion, Requisitos, FechaCierre, Ubicacion, TipoContrato, Jornada, Modalidad, Salario, CantidadVacantes, CategoriaID) VALUES 
(1, 'Desarrollador Junior .NET', 'Buscamos desarrollador junior para unirse a nuestro equipo de desarrollo de aplicaciones web.', 'Recién graduado en Ingeniería en Sistemas, conocimientos en C#, ASP.NET, SQL Server', '2024-03-15', 'Santo Domingo', 'Fijo', 'Tiempo completo', 'Híbrido', 45000.00, 2, 6),
(1, 'Analista de Soporte Técnico', 'Posición para brindar soporte técnico a clientes y mantener sistemas internos.', 'Estudiante avanzado o egresado en Sistemas, experiencia en soporte técnico', '2024-03-20', 'Santo Domingo', 'Fijo', 'Tiempo completo', 'Presencial', 35000.00, 1, 7),
(2, 'Trainee Banca Digital', 'Programa de entrenamiento para recién graduados en el área de banca digital.', 'Egresado en Administración, Economía o carreras afines, inglés intermedio', '2024-04-01', 'Santo Domingo', 'Fijo', 'Tiempo completo', 'Presencial', 40000.00, 3, 4),
(3, 'Enfermera de Emergencias', 'Enfermera para área de emergencias con turnos rotativos.', 'Licenciada en Enfermería, experiencia mínima 1 año, disponibilidad de turnos', '2024-03-25', 'Santo Domingo', 'Fijo', 'Tiempo completo', 'Presencial', 38000.00, 2, 8),
(4, 'Ingeniero Civil Junior', 'Ingeniero civil para supervisión de obras y elaboración de planos.', 'Recién graduado en Ingeniería Civil, conocimientos en AutoCAD, disponibilidad de viaje', '2024-04-10', 'Santo Domingo', 'Fijo', 'Tiempo completo', 'Presencial', 50000.00, 1, 1),
(5, 'Community Manager', 'Gestión de redes sociales y creación de contenido digital para clientes.', 'Estudiante avanzado en Comunicación Social o Marketing, manejo de redes sociales', '2024-03-30', 'Santo Domingo', 'Temporal', 'Medio tiempo', 'Remoto', 25000.00, 1, 5),
(1, 'Pasante de Desarrollo Web', 'Pasantía para estudiantes de sistemas en desarrollo de aplicaciones web.', 'Estudiante de Ingeniería en Sistemas (6to semestre en adelante)', '2024-04-15', 'Santo Domingo', 'Pasantía', 'Medio tiempo', 'Híbrido', 15000.00, 2, 6);

-- =============================================
-- INSERTAR PREGUNTAS PERSONALIZADAS
-- =============================================

INSERT INTO PreguntasVacantes (VacanteID, Pregunta) VALUES 
(1, '¿Tienes experiencia previa con el framework .NET?'),
(1, '¿Cuál es tu nivel de conocimiento en bases de datos SQL Server?'),
(2, '¿Has trabajado anteriormente en soporte técnico?'),
(3, '¿Por qué te interesa trabajar en el sector bancario?'),
(4, '¿Tienes experiencia en el área de emergencias médicas?'),
(5, '¿Estás disponible para viajar a obras fuera de Santo Domingo?'),
(6, '¿Qué herramientas de diseño gráfico manejas?');

-- =============================================
-- INSERTAR POSTULACIONES
-- =============================================

INSERT INTO Postulaciones (VacanteID, UsuarioID, Estado, Observaciones) VALUES 
(1, 1, 'Pendiente', 'Muy interesado en la posición, tengo proyectos personales en .NET'),
(1, 6, 'Visto', 'Egresado con experiencia práctica en desarrollo'),
(2, 2, 'Pendiente', 'Tengo experiencia en soporte técnico durante mis prácticas'),
(3, 8, 'Aceptado', 'Perfil ideal para el programa trainee'),
(4, 3, 'Pendiente', 'Estudiante de enfermería con vocación de servicio'),
(5, 4, 'Rechazado', 'No cumple con el requisito de experiencia'),
(6, 5, 'Pendiente', 'Manejo redes sociales de varios proyectos estudiantiles'),
(7, 1, 'Pendiente', 'Interesado en ganar experiencia práctica');

-- =============================================
-- INSERTAR RESPUESTAS A PREGUNTAS
-- =============================================

INSERT INTO RespuestasPostulaciones (PostulacionID, PreguntaID, Respuesta) VALUES 
(1, 1, 'Sí, he desarrollado algunos proyectos personales usando ASP.NET Core'),
(1, 2, 'Nivel intermedio, he trabajado con consultas básicas y procedimientos almacenados'),
(2, 3, 'Sí, trabajé 6 meses como soporte técnico en una empresa local durante mis prácticas'),
(3, 4, 'Me atrae la estabilidad del sector y las oportunidades de crecimiento profesional'),
(4, 5, 'No tengo experiencia directa, pero he realizado prácticas en el área de emergencias'),
(5, 6, 'Sí, no tengo problema en viajar por trabajo'),
(6, 7, 'Manejo Photoshop, Illustrator y Canva para creación de contenido visual');

-- =============================================
-- INSERTAR INFORMACIÓN ACADÉMICA
-- =============================================

INSERT INTO InformacionesAcademicas (UsuarioID, TituloObtenido, Institucion, FechaInicio, FechaFin, NivelDeFormacion) VALUES 
(6, 'Bachiller en Ciencias', 'Colegio San Patricio', '2011-08-15', '2015-06-15', 'Secundaria'),
(6, 'Ingeniero en Sistemas', 'Universidad Nacional Pedro Henríquez Ureña', '2015-08-15', '2019-12-15', 'Grado'),
(7, 'Bachiller en Ciencias', 'Colegio Loyola', '2010-08-15', '2014-06-15', 'Secundaria'),
(7, 'Doctora en Medicina', 'Universidad Nacional Pedro Henríquez Ureña', '2014-08-15', '2018-12-15', 'Grado'),
(8, 'Bachiller en Ciencias Sociales', 'Colegio Calasanz', '2012-08-15', '2016-06-15', 'Secundaria'),
(8, 'Licenciado en Administración', 'Universidad Nacional Pedro Henríquez Ureña', '2016-08-15', '2020-12-15', 'Grado');

-- =============================================
-- INSERTAR INFORMACIÓN LABORAL
-- =============================================

INSERT INTO InformacionesLaborales (UsuarioID, Empresa, Cargo, FechaInicio, FechaFin, ActualmenteTrabajando, Descripcion) VALUES 
(6, 'Freelance', 'Desarrollador Web', '2020-01-15', NULL, 1, 'Desarrollo de sitios web y aplicaciones para pequeñas empresas'),
(7, 'Hospital General Plaza', 'Médica Residente', '2019-01-15', '2021-12-31', 0, 'Residencia en medicina interna, atención de pacientes hospitalizados'),
(7, 'Clínica San Rafael', 'Médica General', '2022-01-15', NULL, 1, 'Consulta externa y atención de emergencias menores'),
(8, 'Empresa Consultora ABC', 'Asistente Administrativo', '2021-01-15', '2022-06-30', 0, 'Apoyo en gestión de proyectos y recursos humanos'),
(8, 'Corporación XYZ', 'Analista de Recursos Humanos', '2022-07-01', NULL, 1, 'Reclutamiento, selección y gestión de personal'),
(9, 'Despacho Contable Rodríguez', 'Auxiliar Contable', '2018-01-15', '2020-12-31', 0, 'Elaboración de estados financieros y declaraciones fiscales');

-- =============================================
-- INSERTAR NOTIFICACIONES
-- =============================================

INSERT INTO Notificaciones (UsuarioID, Mensaje, Estado, ReferenciaTipo) VALUES 
(1, 'Tu postulación a Desarrollador Junior .NET ha sido recibida', 0, 'postulacion'),
(6, 'Tu postulación a Desarrollador Junior .NET ha sido vista por la empresa', 1, 'postulacion'),
(8, '¡Felicidades! Has sido aceptado para el puesto de Trainee Banca Digital', 0, 'postulacion'),
(11, 'Tienes 3 nuevas postulaciones para revisar', 0, 'vacante'),
(1, 'Nueva vacante disponible: Pasante de Desarrollo Web', 0, 'vacante');

-- =============================================
-- INSERTAR BITÁCORA DE ACCIONES
-- =============================================

INSERT INTO BitacoraAcciones (UsuarioID, TipoAccion, Descripcion, EntidadAfectada) VALUES 
(16, 'Creación', 'Usuario administrador creó nueva empresa TechSolutions RD', 'Empresa'),
(16, 'Aprobación', 'Vacante Desarrollador Junior .NET aprobada para publicación', 'Vacante'),
(17, 'Moderación', 'Revisión de postulación con contenido inapropiado', 'Postulacion'),
(16, 'Activación', 'Usuario María González activado después de verificación', 'Usuario'),
(16, 'Creación', 'Nueva categoría Desarrollo de Software creada', 'Categoria');

GO

PRINT 'Datos sintéticos insertados exitosamente';
PRINT 'Total de registros creados:';
PRINT '- Carreras: 10';
PRINT '- Usuarios: 17 (5 estudiantes, 5 egresados, 5 empresas, 2 admin)';
PRINT '- Perfiles: 10';
PRINT '- Empresas: 5';
PRINT '- Vacantes: 7';
PRINT '- Postulaciones: 8';
PRINT '- Notificaciones: 5';
PRINT '- Información académica: 6 registros';
PRINT '- Información laboral: 6 registros';