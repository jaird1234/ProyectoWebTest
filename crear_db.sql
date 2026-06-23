CREATE DATABASE TiendaAbarrotes;
GO

USE TiendaAbarrotes;
GO

CREATE TABLE Usuarios(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Usuario NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    NombreCompleto NVARCHAR(100),
    Rol NVARCHAR(20) NOT NULL,
    FechaRegistro DATETIME DEFAULT GETDATE()
);
GO

INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol)
VALUES ('admin', 'admin123', 'Administrador General', 'Administrador');
GO

SELECT * FROM Usuarios;
GO