USE TiendaAbarrotes;
GO

SELECT * FROM Usuarios;
GO
SELECT * FROM Articulo;

ALTER TABLE Articulo
ADD Destacado BIT DEFAULT 0;
GO

ALTER TABLE Articulo
ADD Descuento INT DEFAULT 0;
GO