IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TiendaAbarrotes')
BEGIN
    CREATE DATABASE TiendaAbarrotes;
END
GO

USE TiendaAbarrotes;
GO

-- 1. CATEGORÍAS
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categorias')
CREATE TABLE Categorias(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL
);
GO

-- 2. ARTÍCULOS
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Articulo')
CREATE TABLE Articulo(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    CategoriaId INT,

    Destacado BIT DEFAULT 0,
    Descuento INT DEFAULT 0,

    Imagen NVARCHAR(MAX) DEFAULT 'https://via.placeholder.com/200?text=Sin+Imagen',

    FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id)
);
GO


-- 3. USUARIOS Y ROLES (Desglose de dirección completo)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuarios')
CREATE TABLE Usuarios(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Usuario NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    NombreCompleto NVARCHAR(100) NOT NULL,
    Rol NVARCHAR(30) NOT NULL, -- 'Administrador', 'Almacenista', 'Repartidor', 'Cliente'
    Calle NVARCHAR(100) NULL,
    Numero NVARCHAR(20) NULL,
    Colonia NVARCHAR(100) NULL,
    Municipio NVARCHAR(100) NULL,
    CodigoPostal NVARCHAR(10) NULL,
    Telefono NVARCHAR(20) NULL
);
GO

-- 4. PROVEEDORES
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Proveedores')
CREATE TABLE Proveedores(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Contacto NVARCHAR(100),
    Telefono NVARCHAR(20)
);
GO

-- 5. ENTREGAS/RECEPCIONES DE PROVEEDORES (Almacén)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EntregasProveedores')
CREATE TABLE EntregasProveedores(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProveedorId INT NOT NULL,
    FechaProgramada DATETIME NOT NULL,
    MontoAPagar DECIMAL(10,2) NOT NULL,
    Estado NVARCHAR(20) DEFAULT 'Programada', -- 'Programada', 'Recibida'
    FOREIGN KEY (ProveedorId) REFERENCES Proveedores(Id)
);
GO

-- 6. PEDIDOS A DOMICILIO (Sustituye Ventas tradicionales)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Pedidos')
CREATE TABLE Pedidos(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClienteId INT NOT NULL,
    RepartidorId INT NULL,
    Fecha DATETIME DEFAULT GETDATE(),
    HorarioEntrega NVARCHAR(50) NOT NULL, -- Rango: '11:00 AM - 12:00 PM', etc.
    Calle NVARCHAR(100) NOT NULL,
    Numero NVARCHAR(20) NOT NULL,
    Colonia NVARCHAR(100) NOT NULL,
    Municipio NVARCHAR(100) NOT NULL,
    CodigoPostal NVARCHAR(10) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    IVA DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    Estado NVARCHAR(30) DEFAULT 'Pendiente', -- 'Pendiente', 'Preparado', 'En Camino', 'Entregado'
    FOREIGN KEY (ClienteId) REFERENCES Usuarios(Id),
    FOREIGN KEY (RepartidorId) REFERENCES Usuarios(Id)
);
GO

-- 7. DETALLE DEL PEDIDO
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DetallePedidos')
CREATE TABLE DetallePedidos(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PedidoId INT NOT NULL,
    ProductoId INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (PedidoId) REFERENCES Pedidos(Id),
    FOREIGN KEY (ProductoId) REFERENCES Articulo(Id)
);
GO

-- INSERTS DE CONFIGURACIÓN INICIAL
IF NOT EXISTS (SELECT * FROM Categorias)
INSERT INTO Categorias (Nombre) VALUES ('Abarrotes'),('Bebidas'),('Lácteos'),('Botanas'),('Limpieza');

-- REEMPLAZA los 3 inserts de usuarios en init.sql:

IF NOT EXISTS (SELECT * FROM Usuarios WHERE Usuario='admin')
INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol) VALUES 
('admin',
 '$2b$10$/JLvES9D2sFn2iDwe0MgEeXBCoiUBZqlmhd6gapDCkmrLWX9WVG1q',
 'Administrador General','Administrador');

IF NOT EXISTS (SELECT * FROM Usuarios WHERE Usuario='almacen')
INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol) VALUES 
('almacen',
 '$2b$10$F.wIZcVOXdGQAaRfbTpp/u4A2GBL.ODjP1FJTJ2WKRqR5.7g.VyWG',
 'Jefe de Almacén','Almacenista');

IF NOT EXISTS (SELECT * FROM Usuarios WHERE Usuario='repartidor1')
INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol) VALUES 
('repartidor1',
 '$2b$10$ns2/OuE8pxD.zsB3Tijqru8U69Y9IyFHDHYZOipPhOIuaT3Uev99i',
 'Carlos Mendoza (Repartidor)','Repartidor');

IF NOT EXISTS (SELECT * FROM Proveedores)
INSERT INTO Proveedores (Nombre, Contacto, Telefono) VALUES ('Distribuidora Central','Juan Pérez','555-1234'),('Bebidas del Valle','Ana Gómez','555-5678');

IF NOT EXISTS (SELECT * FROM Articulo)
INSERT INTO Articulo (Nombre, Precio, Stock, CategoriaId,Destacado, Descuento, Imagen) VALUES
('Arroz Integral 1kg', 25.00, 45, 1, 0, 0, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&auto=format&fit=crop'),
('Frijoles Negros 1kg', 30.00, 30, 1, 0, 15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBljEJ7mUZIuVAgwlow48GB3iyDUHKNszALA&s'),
('Azúcar 1kg', 28.00, 60, 1, 0, 0, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZvgJj-WM7QG3Pqwah7sBpI1BNBcqn83ZR_Q&s'),
('Harina de Trigo 1kg', 22.00, 40, 1, 0, 10, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjXf0MBzBlSC2Q3DfrO4R9Wqz1mhFQ4VtfDA&s'),
('Refresco de Cola 600ml', 22.00, 120, 2, 1, 20, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop'),
('Agua Embotellada 1L', 15.00, 100, 2, 0, 0, 'https://imgsnotigram.s3.amazonaws.com/uploads/2024/06/mexico-exporta-monto-record-de-agua-embotellada-a-eu.jpg'),
('Jugo de Naranja 1L', 35.00, 50, 2, 1, 10, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=400&auto=format&fit=crop'),
('Leche Entera 1L', 28.00, 35, 3, 1, 10, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop'),
('Queso Oaxaca 500g', 75.00, 20, 3, 0, 0, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=400&auto=format&fit=crop'),
('Yogurt Natural 1L', 45.00, 25, 3, 0, 15, 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?q=80&w=400&auto=format&fit=crop'),
('Papas Fritas 170g', 40.00, 60, 4, 0, 0, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=400&auto=format&fit=crop'),
('Galletas de Chocolate', 32.00, 80, 4, 1, 20, 'https://www.mexicolate.mx/wp-content/uploads/2019/03/Mexicolate-Chocolater%C3%ADa-Cacao-Nativo-Sayulita-San-Pancho-6-barra-de-chocolate-b.jpg'),
('Chocolate en Barra', 25.00, 70, 4, 0, 0, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=400&auto=format&fit=crop'),
('Detergente Líquido 1L', 85.00, 25, 5, 0, 10, 'https://images.unsplash.com/photo-1583947582886-f40ec95dd752?q=80&w=400&auto=format&fit=crop'),
('Cloro 1L', 22.00, 50, 5, 0, 0, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIhksWQYjwuBqXddFD-54QCIpBiL98lKvscg&s'),
('Jabón para Trastes', 30.00, 45, 5, 0, 0, 'https://cdn7.craftologia.com/ss_secreto/2662/640x640/2662.jpg.webp');
GO