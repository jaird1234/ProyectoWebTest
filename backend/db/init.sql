IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TiendaAbarrotes')
BEGIN
    CREATE DATABASE TiendaAbarrotes;
END
GO

USE TiendaAbarrotes;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categorias')
CREATE TABLE Categorias(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL
);
GO

INSERT INTO Categorias (Nombre) VALUES
('Abarrotes'),('Bebidas'),('Lácteos'),('Botanas'),('Limpieza');
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Articulo')
CREATE TABLE Articulo(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    CategoriaId INT,
    FechaRegistro DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id)
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuarios')
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
VALUES ('admin','admin123','Administrador General','Administrador');
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Clientes')
CREATE TABLE Clientes(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Telefono NVARCHAR(20),
    Direccion NVARCHAR(200),
    FechaRegistro DATETIME DEFAULT GETDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Ventas')
CREATE TABLE Ventas(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClienteId INT NULL,
    UsuarioId INT NOT NULL,
    Fecha DATETIME DEFAULT GETDATE(),
    Subtotal DECIMAL(10,2) NOT NULL,
    IVA DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (ClienteId) REFERENCES Clientes(Id),
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id)
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DetalleVentas')
CREATE TABLE DetalleVentas(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    VentaId INT NOT NULL,
    ProductoId INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (VentaId) REFERENCES Ventas(Id),
    FOREIGN KEY (ProductoId) REFERENCES Articulo(Id)
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Compras')
CREATE TABLE Compras(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Fecha DATETIME DEFAULT GETDATE(),
    Total DECIMAL(10,2) NOT NULL
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DetalleCompras')
CREATE TABLE DetalleCompras(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CompraId INT NOT NULL,
    ProductoId INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioCompra DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (CompraId) REFERENCES Compras(Id),
    FOREIGN KEY (ProductoId) REFERENCES Articulo(Id)
);
GO

INSERT INTO Articulo (Nombre, Precio, Stock, CategoriaId) VALUES
('Arroz',25.00,50,1),
('Frijoles',30.00,40,1),
('Aceite',45.00,20,1),
('Coca Cola 600ml',22.00,100,2),
('Leche Entera',28.00,35,3);
GO