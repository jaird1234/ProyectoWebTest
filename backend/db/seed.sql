-- ============================================================
--  SEED COMPLETO - TiendaAbarrotes
--  Ejecutar en SQL Server Management Studio o desde el
--  contenedor: docker exec -it <sql_container> /opt/mssql-tools/bin/sqlcmd
--              -S localhost -U sa -P <password> -d TiendaAbarrotes -i seed.sql
-- ============================================================

USE TiendaAbarrotes;
GO

-- ────────────────────────────────────────────────────────────
-- 1. CATEGORÍAS (10 categorías de abarrotes reales)
-- ────────────────────────────────────────────────────────────
-- Para reiniciar datos (quitar comentarios con cuidado):
-- DELETE FROM DetallePedidos; DELETE FROM Pedidos; DELETE FROM Articulo;
-- DELETE FROM Categorias; DBCC CHECKIDENT ('Categorias', RESEED, 0);

IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Abarrotes')
    INSERT INTO Categorias (Nombre) VALUES ('Abarrotes');
IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Bebidas')
    INSERT INTO Categorias (Nombre) VALUES ('Bebidas');
IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Lácteos')
    INSERT INTO Categorias (Nombre) VALUES ('Lácteos');
IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Botanas')
    INSERT INTO Categorias (Nombre) VALUES ('Botanas');
IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Limpieza')
    INSERT INTO Categorias (Nombre) VALUES ('Limpieza');
IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Carnes y Embutidos')
    INSERT INTO Categorias (Nombre) VALUES ('Carnes y Embutidos');
IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Frutas y Verduras')
    INSERT INTO Categorias (Nombre) VALUES ('Frutas y Verduras');
IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Panadería')
    INSERT INTO Categorias (Nombre) VALUES ('Panadería');
IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Congelados')
    INSERT INTO Categorias (Nombre) VALUES ('Congelados');
IF NOT EXISTS (SELECT 1 FROM Categorias WHERE Nombre = 'Higiene Personal')
    INSERT INTO Categorias (Nombre) VALUES ('Higiene Personal');
GO

-- ────────────────────────────────────────────────────────────
-- 2. USUARIOS: Trabajadores (Admin, Almacenistas, Repartidores)
-- ────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'admin')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Telefono)
    VALUES ('admin', 'admin123', 'Administrador General', 'Administrador', '55 1000 0001');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'almacen')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Telefono)
    VALUES ('almacen', 'almacen123', 'Roberto Juárez Torres', 'Almacenista', '55 1000 0002');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'almacen2')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Telefono)
    VALUES ('almacen2', 'almacen456', 'Patricia Sánchez Leal', 'Almacenista', '55 1000 0003');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'repartidor1')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Telefono)
    VALUES ('repartidor1', 'repartidor123', 'Carlos Mendoza Ruiz', 'Repartidor', '55 2000 0001');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'repartidor2')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Telefono)
    VALUES ('repartidor2', 'repartidor456', 'Miguel Ángel López Vega', 'Repartidor', '55 2000 0002');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'repartidor3')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Telefono)
    VALUES ('repartidor3', 'repartidor789', 'Eduardo Flores Díaz', 'Repartidor', '55 2000 0003');
GO

-- ────────────────────────────────────────────────────────────
-- 3. USUARIOS: Clientes (15 clientes con dirección completa)
-- ────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente1')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente1','cliente123','Ana Martínez García','Cliente','Av. Hidalgo','12','El Chamizal','López Mateos','52940','55 3001 0001');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente2')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente2','cliente123','Juan Pablo Ramírez','Cliente','Calle Juárez','45','Las Haciendas','López Mateos','52945','55 3001 0002');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente3')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente3','cliente123','Sofía Hernández Cruz','Cliente','Blvd. Toluca','200','La Cañada','Atizapán','52980','55 3001 0003');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente4')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente4','cliente123','Luis Fernando Torres','Cliente','Calle Morelos','8','Centro','López Mateos','52940','55 3001 0004');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente5')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente5','cliente123','Valeria Romo Ibáñez','Cliente','Privada Rosal','3','Jardines del Sol','López Mateos','52944','55 3001 0005');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente6')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente6','cliente123','Daniela Ortega Peña','Cliente','Calle Pino','56','Bosques del Lago','Cuautitlán','54860','55 3001 0006');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente7')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente7','cliente123','Ricardo Guzmán Ávila','Cliente','Av. Insurgentes','134','Lomas Verdes','Naucalpan','53120','55 3001 0007');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente8')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente8','cliente123','Gabriela Fuentes Luna','Cliente','Calle Olmo','22','El Laurel','López Mateos','52943','55 3001 0008');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente9')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente9','cliente123','Fernando Castillo Mora','Cliente','Calle Cedro','77','Arboledas','Atizapán','52975','55 3001 0009');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente10')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente10','cliente123','Mariana Vargas Soto','Cliente','Blvd. Manuel Ávila','310','Ciudad López Mateos','López Mateos','52940','55 3001 0010');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente11')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente11','cliente123','Andrés Núñez Bravo','Cliente','Av. Las Torres','19','Los Olivos','López Mateos','52946','55 3001 0011');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente12')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente12','cliente123','Isabella Romero Rueda','Cliente','Calle Magnolia','4','Jardín Azpeitia','Atizapán','52978','55 3001 0012');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente13')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente13','cliente123','Héctor Medina Calvo','Cliente','Calle Fresno','91','El Bosque','López Mateos','52941','55 3001 0013');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente14')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente14','cliente123','Camila Espinoza Rivas','Cliente','Av. Primero de Mayo','67','Industrial','Tlalnepantla','54030','55 3001 0014');

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'cliente15')
    INSERT INTO Usuarios (Usuario, Password, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono)
    VALUES ('cliente15','cliente123','Sebastián Acosta Vidal','Cliente','Calle Álamo','15','Fraccionamiento Real','López Mateos','52948','55 3001 0015');
GO

-- ────────────────────────────────────────────────────────────
-- 4. PROVEEDORES (8 proveedores)
-- ────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE Nombre = 'Distribuidora Central')
    INSERT INTO Proveedores (Nombre, Contacto, Telefono)
    VALUES ('Distribuidora Central', 'Juan Pérez Montes', '55 4000 0001');

IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE Nombre = 'Bebidas del Valle')
    INSERT INTO Proveedores (Nombre, Contacto, Telefono)
    VALUES ('Bebidas del Valle', 'Ana Gómez Ríos', '55 4000 0002');

IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE Nombre = 'Lácteos San Marcos')
    INSERT INTO Proveedores (Nombre, Contacto, Telefono)
    VALUES ('Lácteos San Marcos', 'Pedro Villanueva', '55 4000 0003');

IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE Nombre = 'Botanas y Snacks MX')
    INSERT INTO Proveedores (Nombre, Contacto, Telefono)
    VALUES ('Botanas y Snacks MX', 'Laura Sandoval', '55 4000 0004');

IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE Nombre = 'Productos de Limpieza LIRA')
    INSERT INTO Proveedores (Nombre, Contacto, Telefono)
    VALUES ('Productos de Limpieza LIRA', 'Mario Trejo', '55 4000 0005');

IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE Nombre = 'Carnes Frías del Norte')
    INSERT INTO Proveedores (Nombre, Contacto, Telefono)
    VALUES ('Carnes Frías del Norte', 'Rosa Elena Paz', '55 4000 0006');

IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE Nombre = 'Frutas y Verduras Frescas')
    INSERT INTO Proveedores (Nombre, Contacto, Telefono)
    VALUES ('Frutas y Verduras Frescas', 'Ernesto Campos', '55 4000 0007');

IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE Nombre = 'Panadería El Trigo Dorado')
    INSERT INTO Proveedores (Nombre, Contacto, Telefono)
    VALUES ('Panadería El Trigo Dorado', 'Silvia Moreno', '55 4000 0008');
GO

-- ────────────────────────────────────────────────────────────
-- 5. ARTÍCULOS (60 productos organizados por categoría)
-- ────────────────────────────────────────────────────────────
DECLARE @Abarrotes  INT = (SELECT Id FROM Categorias WHERE Nombre = 'Abarrotes');
DECLARE @Bebidas    INT = (SELECT Id FROM Categorias WHERE Nombre = 'Bebidas');
DECLARE @Lacteos    INT = (SELECT Id FROM Categorias WHERE Nombre = 'Lácteos');
DECLARE @Botanas    INT = (SELECT Id FROM Categorias WHERE Nombre = 'Botanas');
DECLARE @Limpieza   INT = (SELECT Id FROM Categorias WHERE Nombre = 'Limpieza');
DECLARE @Carnes     INT = (SELECT Id FROM Categorias WHERE Nombre = 'Carnes y Embutidos');
DECLARE @FrutasVerd INT = (SELECT Id FROM Categorias WHERE Nombre = 'Frutas y Verduras');
DECLARE @Panaderia  INT = (SELECT Id FROM Categorias WHERE Nombre = 'Panadería');
DECLARE @Congelados INT = (SELECT Id FROM Categorias WHERE Nombre = 'Congelados');
DECLARE @Higiene    INT = (SELECT Id FROM Categorias WHERE Nombre = 'Higiene Personal');

-- ABARROTES (10)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Arroz Integral 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Arroz Integral 1kg',25.00,120,@Abarrotes,0,0,'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Frijoles Negros 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Frijoles Negros 1kg',30.00,90,@Abarrotes,0,15,'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Azúcar Estándar 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Azúcar Estándar 1kg',28.00,150,@Abarrotes,0,0,'https://images.unsplash.com/photo-1612257999756-0b9e8e3e7e8b?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Harina de Trigo 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Harina de Trigo 1kg',22.00,80,@Abarrotes,0,10,'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Aceite Vegetal 1L')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Aceite Vegetal 1L',48.00,70,@Abarrotes,1,0,'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Sal de Mesa 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Sal de Mesa 1kg',12.00,200,@Abarrotes,0,0,'https://images.unsplash.com/photo-1584304547851-6fe1b42e7e5a?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Atún en Lata 140g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Atún en Lata 140g',22.00,180,@Abarrotes,1,5,'https://images.unsplash.com/photo-1611171711791-7b01c7e6a3e7?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Pasta Espagueti 500g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Pasta Espagueti 500g',18.00,110,@Abarrotes,0,0,'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Lentejas 500g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Lentejas 500g',20.00,60,@Abarrotes,0,0,'https://images.unsplash.com/photo-1623428187969-f5b37a57e7f4?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Café Molido 250g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Café Molido 250g',65.00,45,@Abarrotes,1,0,'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop');

-- BEBIDAS (7)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Refresco Cola 600ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Refresco Cola 600ml',22.00,200,@Bebidas,1,20,'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Agua Natural 1.5L')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Agua Natural 1.5L',15.00,300,@Bebidas,0,0,'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Jugo de Naranja 1L')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Jugo de Naranja 1L',35.00,80,@Bebidas,1,10,'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Cerveza Clara 355ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Cerveza Clara 355ml',22.00,150,@Bebidas,0,0,'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Agua Mineral 600ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Agua Mineral 600ml',14.00,120,@Bebidas,0,0,'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Té Frío Limón 500ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Té Frío Limón 500ml',18.00,90,@Bebidas,0,0,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Bebida Energética 473ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Bebida Energética 473ml',35.00,60,@Bebidas,1,0,'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&auto=format&fit=crop');

-- LÁCTEOS (6)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Leche Entera 1L')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Leche Entera 1L',28.00,100,@Lacteos,1,10,'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Queso Oaxaca 500g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Queso Oaxaca 500g',75.00,35,@Lacteos,1,0,'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Yogurt Natural 900g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Yogurt Natural 900g',45.00,55,@Lacteos,0,15,'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Mantequilla 90g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Mantequilla 90g',32.00,70,@Lacteos,0,0,'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Crema Ácida 200g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Crema Ácida 200g',28.00,45,@Lacteos,0,0,'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Queso Manchego 400g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Queso Manchego 400g',82.00,25,@Lacteos,1,5,'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&auto=format&fit=crop');

-- BOTANAS (5)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Papas Fritas 170g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Papas Fritas 170g',40.00,100,@Botanas,0,0,'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Galletas de Chocolate 100g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Galletas de Chocolate 100g',32.00,120,@Botanas,1,20,'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Palomitas de Maíz 60g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Palomitas de Maíz 60g',18.00,80,@Botanas,0,0,'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Cacahuates Enchilados 200g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Cacahuates Enchilados 200g',25.00,70,@Botanas,0,0,'https://images.unsplash.com/photo-1567206563114-c179706a56c4?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Gomitas Surtidas 150g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Gomitas Surtidas 150g',20.00,90,@Botanas,0,0,'https://images.unsplash.com/photo-1614065578416-5cd6b21b2cf3?w=400&auto=format&fit=crop');

-- LIMPIEZA (6)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Detergente Líquido 1L')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Detergente Líquido 1L',85.00,50,@Limpieza,0,10,'https://images.unsplash.com/photo-1583947582886-f40ec95dd752?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Cloro Blanqueador 1L')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Cloro Blanqueador 1L',22.00,80,@Limpieza,0,0,'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Jabón Trastes 500ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Jabón Trastes 500ml',30.00,65,@Limpieza,0,0,'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Suavizante de Ropa 1L')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Suavizante de Ropa 1L',55.00,40,@Limpieza,1,5,'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Limpiador Multiusos 750ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Limpiador Multiusos 750ml',38.00,55,@Limpieza,0,0,'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Bolsas de Basura x10')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Bolsas de Basura x10',28.00,100,@Limpieza,0,0,'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&auto=format&fit=crop');

-- CARNES Y EMBUTIDOS (5)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Jamón de Pavo 200g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Jamón de Pavo 200g',52.00,30,@Carnes,1,0,'https://images.unsplash.com/photo-1613987245117-83f5e2740e2b?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Salchicha Frankfurt x8')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Salchicha Frankfurt x8',45.00,40,@Carnes,0,0,'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Chorizo Rojo 300g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Chorizo Rojo 300g',58.00,25,@Carnes,0,0,'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Tocino Ahumado 200g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Tocino Ahumado 200g',72.00,20,@Carnes,1,10,'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Milanesa de Res 500g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Milanesa de Res 500g',120.00,15,@Carnes,1,0,'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&auto=format&fit=crop');

-- FRUTAS Y VERDURAS (6)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Manzana Roja 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Manzana Roja 1kg',45.00,60,@FrutasVerd,1,0,'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Plátano Tabasco 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Plátano Tabasco 1kg',28.00,80,@FrutasVerd,0,0,'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Tomate Bola 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Tomate Bola 1kg',32.00,70,@FrutasVerd,0,0,'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Cebolla Blanca 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Cebolla Blanca 1kg',22.00,90,@FrutasVerd,0,0,'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Chile Serrano 250g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Chile Serrano 250g',18.00,50,@FrutasVerd,0,0,'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Aguacate Hass pza')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Aguacate Hass pza',22.00,100,@FrutasVerd,1,0,'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=400&auto=format&fit=crop');

-- PANADERÍA (4)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Pan Blanco de Caja 680g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Pan Blanco de Caja 680g',42.00,50,@Panaderia,1,0,'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Tortillas de Maíz 1kg')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Tortillas de Maíz 1kg',18.00,200,@Panaderia,1,0,'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Pan Dulce Concha x6')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Pan Dulce Concha x6',35.00,40,@Panaderia,1,0,'https://images.unsplash.com/photo-1617306735628-bd2f5a3c5ea2?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Galleta María 400g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Galleta María 400g',22.00,75,@Panaderia,0,0,'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop');

-- CONGELADOS (3)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Pizza Congelada Mediana')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Pizza Congelada Mediana',95.00,20,@Congelados,1,0,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Helado Vainilla 1L')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Helado Vainilla 1L',75.00,15,@Congelados,1,0,'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Nuggets de Pollo 400g')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Nuggets de Pollo 400g',68.00,18,@Congelados,0,10,'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&auto=format&fit=crop');

-- HIGIENE PERSONAL (5)
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Shampoo Anticaspa 400ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Shampoo Anticaspa 400ml',72.00,40,@Higiene,0,0,'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Pasta de Dientes 75ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Pasta de Dientes 75ml',35.00,60,@Higiene,0,0,'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Jabón de Baño x3')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Jabón de Baño x3',38.00,55,@Higiene,0,0,'https://images.unsplash.com/photo-1616048056617-93b94a339009?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Desodorante Roll-On 65ml')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Desodorante Roll-On 65ml',52.00,45,@Higiene,1,0,'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&auto=format&fit=crop');
IF NOT EXISTS (SELECT 1 FROM Articulo WHERE Nombre = 'Papel Higiénico x4')
    INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Destacado,Descuento,Imagen) VALUES
    ('Papel Higiénico x4',48.00,80,@Higiene,1,0,'https://images.unsplash.com/photo-1583947216259-dcb0c41069e4?w=400&auto=format&fit=crop');
GO

-- ────────────────────────────────────────────────────────────
-- 6. ENTREGAS DE PROVEEDORES
-- ────────────────────────────────────────────────────────────
DECLARE @ProvCentral  INT = (SELECT TOP 1 Id FROM Proveedores WHERE Nombre = 'Distribuidora Central');
DECLARE @ProvBebidas  INT = (SELECT TOP 1 Id FROM Proveedores WHERE Nombre = 'Bebidas del Valle');
DECLARE @ProvLacteos  INT = (SELECT TOP 1 Id FROM Proveedores WHERE Nombre = 'Lácteos San Marcos');
DECLARE @ProvBotanas  INT = (SELECT TOP 1 Id FROM Proveedores WHERE Nombre = 'Botanas y Snacks MX');
DECLARE @ProvLimpieza INT = (SELECT TOP 1 Id FROM Proveedores WHERE Nombre = 'Productos de Limpieza LIRA');

IF NOT EXISTS (SELECT 1 FROM EntregasProveedores WHERE ProveedorId = @ProvCentral AND MontoAPagar = 3500.00)
    INSERT INTO EntregasProveedores (ProveedorId, FechaProgramada, MontoAPagar, Estado) VALUES
    (@ProvCentral,  DATEADD(DAY,  2, GETDATE()), 3500.00, 'Programada'),
    (@ProvBebidas,  DATEADD(DAY,  1, GETDATE()), 1800.00, 'Programada'),
    (@ProvLacteos,  DATEADD(DAY, -2, GETDATE()), 2200.00, 'Recibida'),
    (@ProvBotanas,  DATEADD(DAY,  5, GETDATE()), 1200.00, 'Programada'),
    (@ProvLimpieza, DATEADD(DAY, -5, GETDATE()),  900.00, 'Recibida');
GO

-- ────────────────────────────────────────────────────────────
-- 7. PEDIDOS DE EJEMPLO (7 pedidos con distintos estados)
-- ────────────────────────────────────────────────────────────
DECLARE @C1   INT = (SELECT Id FROM Usuarios WHERE Usuario = 'cliente1');
DECLARE @C2   INT = (SELECT Id FROM Usuarios WHERE Usuario = 'cliente2');
DECLARE @C3   INT = (SELECT Id FROM Usuarios WHERE Usuario = 'cliente3');
DECLARE @C4   INT = (SELECT Id FROM Usuarios WHERE Usuario = 'cliente4');
DECLARE @C5   INT = (SELECT Id FROM Usuarios WHERE Usuario = 'cliente5');
DECLARE @C6   INT = (SELECT Id FROM Usuarios WHERE Usuario = 'cliente6');
DECLARE @C7   INT = (SELECT Id FROM Usuarios WHERE Usuario = 'cliente7');
DECLARE @Rep1 INT = (SELECT Id FROM Usuarios WHERE Usuario = 'repartidor1');
DECLARE @Rep2 INT = (SELECT Id FROM Usuarios WHERE Usuario = 'repartidor2');

IF NOT EXISTS (SELECT 1 FROM Pedidos WHERE ClienteId = @C1)
BEGIN
    -- Pedido 1: Pendiente (hoy 10-11am)
    INSERT INTO Pedidos (ClienteId,RepartidorId,HorarioEntrega,Calle,Numero,Colonia,Municipio,CodigoPostal,Subtotal,IVA,Total,Estado)
    VALUES (@C1, NULL,
        CONVERT(NVARCHAR,CAST(GETDATE() AS DATE),23)+' | 10:00 AM - 11:00 AM',
        'Av. Hidalgo','12','El Chamizal','López Mateos','52940',95.60,15.30,110.90,'Pendiente');
    DECLARE @P1 INT = SCOPE_IDENTITY();
    DECLARE @ArtArroz   INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Arroz Integral 1kg');
    DECLARE @ArtAceite  INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Aceite Vegetal 1L');
    INSERT INTO DetallePedidos (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal) VALUES
    (@P1,@ArtArroz,2,25.00,50.00), (@P1,@ArtAceite,1,48.00,48.00);

    -- Pedido 2: Preparado (hoy 12-1pm)
    INSERT INTO Pedidos (ClienteId,RepartidorId,HorarioEntrega,Calle,Numero,Colonia,Municipio,CodigoPostal,Subtotal,IVA,Total,Estado)
    VALUES (@C2, NULL,
        CONVERT(NVARCHAR,CAST(GETDATE() AS DATE),23)+' | 12:00 PM - 01:00 PM',
        'Calle Juárez','45','Las Haciendas','López Mateos','52945',120.00,19.20,139.20,'Preparado');
    DECLARE @P2 INT = SCOPE_IDENTITY();
    DECLARE @ArtLeche   INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Leche Entera 1L');
    DECLARE @ArtQueso   INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Queso Oaxaca 500g');
    INSERT INTO DetallePedidos (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal) VALUES
    (@P2,@ArtLeche,2,28.00,56.00), (@P2,@ArtQueso,1,75.00,75.00);

    -- Pedido 3: En Camino (hoy 2-3pm, asignado a repartidor1)
    INSERT INTO Pedidos (ClienteId,RepartidorId,HorarioEntrega,Calle,Numero,Colonia,Municipio,CodigoPostal,Subtotal,IVA,Total,Estado)
    VALUES (@C3, @Rep1,
        CONVERT(NVARCHAR,CAST(GETDATE() AS DATE),23)+' | 02:00 PM - 03:00 PM',
        'Blvd. Toluca','200','La Cañada','Atizapán','52980',76.00,12.16,88.16,'En Camino');
    DECLARE @P3 INT = SCOPE_IDENTITY();
    DECLARE @ArtPasta   INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Pasta Espagueti 500g');
    DECLARE @ArtFrijol  INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Frijoles Negros 1kg');
    INSERT INTO DetallePedidos (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal) VALUES
    (@P3,@ArtPasta,2,18.00,36.00), (@P3,@ArtFrijol,1,30.00,30.00);

    -- Pedido 4: Entregado (ayer 9-10am)
    INSERT INTO Pedidos (ClienteId,RepartidorId,HorarioEntrega,Calle,Numero,Colonia,Municipio,CodigoPostal,Subtotal,IVA,Total,Estado)
    VALUES (@C4, @Rep2,
        CONVERT(NVARCHAR,CAST(DATEADD(DAY,-1,GETDATE()) AS DATE),23)+' | 09:00 AM - 10:00 AM',
        'Calle Morelos','8','Centro','López Mateos','52940',200.00,32.00,232.00,'Entregado');
    DECLARE @P4 INT = SCOPE_IDENTITY();
    DECLARE @ArtPizza     INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Pizza Congelada Mediana');
    DECLARE @ArtRefresco  INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Refresco Cola 600ml');
    INSERT INTO DetallePedidos (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal) VALUES
    (@P4,@ArtPizza,2,95.00,190.00), (@P4,@ArtRefresco,2,22.00,44.00);

    -- Pedido 5: Entregado (ayer 4-5pm)
    INSERT INTO Pedidos (ClienteId,RepartidorId,HorarioEntrega,Calle,Numero,Colonia,Municipio,CodigoPostal,Subtotal,IVA,Total,Estado)
    VALUES (@C5, @Rep1,
        CONVERT(NVARCHAR,CAST(DATEADD(DAY,-1,GETDATE()) AS DATE),23)+' | 04:00 PM - 05:00 PM',
        'Privada Rosal','3','Jardines del Sol','López Mateos','52944',145.00,23.20,168.20,'Entregado');
    DECLARE @P5 INT = SCOPE_IDENTITY();
    DECLARE @ArtJamon INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Jamón de Pavo 200g');
    DECLARE @ArtPan   INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Pan Blanco de Caja 680g');
    INSERT INTO DetallePedidos (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal) VALUES
    (@P5,@ArtJamon,2,52.00,104.00), (@P5,@ArtPan,1,42.00,42.00);

    -- Pedido 6: Pendiente (mañana 8-9am)
    INSERT INTO Pedidos (ClienteId,RepartidorId,HorarioEntrega,Calle,Numero,Colonia,Municipio,CodigoPostal,Subtotal,IVA,Total,Estado)
    VALUES (@C6, NULL,
        CONVERT(NVARCHAR,CAST(DATEADD(DAY,1,GETDATE()) AS DATE),23)+' | 08:00 AM - 09:00 AM',
        'Calle Pino','56','Bosques del Lago','Cuautitlán','54860',88.00,14.08,102.08,'Pendiente');
    DECLARE @P6 INT = SCOPE_IDENTITY();
    DECLARE @ArtAgua  INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Agua Natural 1.5L');
    DECLARE @ArtCafe  INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Café Molido 250g');
    INSERT INTO DetallePedidos (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal) VALUES
    (@P6,@ArtAgua,2,15.00,30.00), (@P6,@ArtCafe,1,65.00,65.00);

    -- Pedido 7: Pendiente (hoy 7-8pm)
    INSERT INTO Pedidos (ClienteId,RepartidorId,HorarioEntrega,Calle,Numero,Colonia,Municipio,CodigoPostal,Subtotal,IVA,Total,Estado)
    VALUES (@C7, NULL,
        CONVERT(NVARCHAR,CAST(GETDATE() AS DATE),23)+' | 07:00 PM - 08:00 PM',
        'Av. Insurgentes','134','Lomas Verdes','Naucalpan','53120',310.00,49.60,359.60,'Pendiente');
    DECLARE @P7 INT = SCOPE_IDENTITY();
    DECLARE @ArtTocino    INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Tocino Ahumado 200g');
    DECLARE @ArtMilanesa  INT = (SELECT TOP 1 Id FROM Articulo WHERE Nombre = 'Milanesa de Res 500g');
    INSERT INTO DetallePedidos (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal) VALUES
    (@P7,@ArtTocino,2,72.00,144.00), (@P7,@ArtMilanesa,1,120.00,120.00);
END
GO

PRINT '=======================================================';
PRINT ' SEED completado exitosamente';
PRINT ' Categorias : 10';
PRINT ' Articulos  : 60';
PRINT ' Empleados  :  6 (1 admin, 2 almacenistas, 3 repartidores)';
PRINT ' Clientes   : 15';
PRINT ' Proveedores:  8';
PRINT ' Pedidos    :  7 (Pendiente/Preparado/En Camino/Entregado)';
PRINT '=======================================================';
GO
