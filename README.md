# 🛒 Tienda de Abarrotes - Sistema de Gestión y Pedidos

![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![SQL Server](https://img.shields.io/badge/SQL_Server-Database-red?style=for-the-badge&logo=microsoft-sql-server)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)

Sistema integral (Full-Stack) de comercio electrónico y gestión interna para una tienda de abarrotes. Este proyecto permite la administración completa del ciclo de negocio: desde el control de inventario y la recepción de mercancía por proveedores, hasta la venta al cliente final y la logística de entrega a domicilio mediante repartidores.

## ✨ Características Principales

El sistema está dividido en múltiples módulos accesibles según el **Rol de Usuario**:

### 👑 Administrador General
- Acceso a todas las métricas de ventas y resúmenes de ganancias.
- **Control de Personal:** Alta, edición y baja de empleados (Administradores, Almacenistas, Repartidores).
- Gestión total de pedidos, inventario, categorías y proveedores.

### 📦 Almacenista
- **Gestión de Inventario:** CRUD de artículos, categorías, control de stock, descuentos y productos destacados.
- **Proveedores:** Registro de proveedores, programación de entregas y recepción de mercancía (Cuentas por pagar).

### 🛵 Repartidor
- Panel exclusivo para visualizar las rutas de entrega asignadas.
- Actualización en tiempo real del estado del pedido (`En Camino` -> `Entregado`).
- Detalles exactos de entrega (Dirección, Colonia, Municipio y Código Postal).

### 🛍️ Cliente (Tienda Web)
- Exploración del catálogo de productos con filtros por categoría.
- Visualización de productos destacados y ofertas especiales.
- Carrito de compras interactivo.
- Pasarela de "Checkout" con selección de horario de entrega y desglose de totales (Subtotal, IVA, Total).
- Seguimiento de estado de sus pedidos.

---

## 🛠️ Tecnologías y Arquitectura

- **Frontend:** React 19, React Router DOM, Axios, CSS Grid/Flexbox (Diseño Responsivo).
- **Backend:** Node.js, Express, Bcrypt (Hasheo de contraseñas), dotenv.
- **Base de Datos:** SQL Server 2022 (Transact-SQL).
- **Infraestructura:** Docker & Docker Compose (Contenedores separados para Frontend, Backend y BD).

---

## 🚀 Instalación y Despliegue Local (Docker)

La forma más sencilla de ejecutar este proyecto es mediante Docker, ya que orquesta automáticamente la base de datos, el servidor Node.js y la aplicación de React.

### Requisitos previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
- Git.

### Pasos de ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/jaird1234/proyectowebtest.git](https://github.com/jaird1234/proyectowebtest.git)
   cd proyectowebtest

🔑 Usuarios por Defecto (Testing)
Rol,Usuario,Contraseña
Administrador,admin,admin123
Almacenista,almacen,almacen123
Repartidor,repartidor1,repartidor123

📂 Estructura del Proyecto
📦 ProyectoWebTest
 ┣ 📂 backend
 ┃ ┣ 📂 db
 ┃ ┃ ┗ 📜 init.sql         # Script de creación de BD, Tablas e Inserts iniciales
 ┃ ┣ 📜 server.js          # Entrypoint de Express, endpoints y lógica de negocio
 ┃ ┣ 📜 db.js              # Configuración del pool de conexión a SQL Server
 ┃ ┣ 📜 init-db.js         # Ejecutor del script SQL durante el arranque
 ┃ ┣ 📜 Dockerfile         # Receta del contenedor Node.js
 ┃ ┗ 📜 package.json       # Dependencias del backend (express, mssql, bcrypt, etc.)
 ┣ 📂 frontend
 ┃ ┣ 📂 public
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components       # Componentes de React (DashboardAdmin, Tienda, Articulos, etc.)
 ┃ ┃ ┣ 📜 App.js           # Enrutamiento principal
 ┃ ┃ ┗ 📜 index.css        # Estilos globales y variables CSS
 ┃ ┣ 📜 Dockerfile         # Receta del contenedor React
 ┃ ┗ 📜 package.json       # Dependencias del frontend
 ┗ 📜 docker-compose.yml   # Orquestador de servicios (db, backend, frontend)

 
