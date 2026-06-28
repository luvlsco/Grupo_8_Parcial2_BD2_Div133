# Ecommerce MVP - Base de Datos II

Sistema mínimo viable que se conecta a MongoDB y ejecuta consultas de agregación sobre un modelo de datos de ecommerce con usuarios, productos y órdenes.

## Cómo ejecutarlo

### Requisitos

- Node.js 18+
- MongoDB corriendo localmente en `mongodb://localhost:27017`

### Instalación

```bash
npm install
```

> No requiere archivo `.env`, la conexión usa valores por defecto definidos en `src/db.js`.

### Cargar datos de ejemplo

```bash
npm run seed
```

### Ejecutar consultas

```bash
npm run queries
```

## Descripción de las colecciones

### `users`

Cada usuario tiene un **id** único y sus datos de contacto. La dirección **address** está embebida dentro del documento del usuario, ya que siempre se consulta junto con el perfil.

```json
{
    "_id": "ObjectId",
    "name": "Ana García",
    "email": "ana.garcia@email.com",
    "address": {
      "street": "Av. Mitre 100",
      "city": "Avellaneda",
      "zip": "1870"
    }
}
```

### `products`

Productos del catálogo, con su precio y stock disponible. Cada producto tiene un **id** único.

```json
{
    "_id": "ObjectId",
    "name": "Notebook Acer",
    "category": "Computadoras",
    "price": 450000,
    "stock": 12
}
```

### `orders`

Ordenes de compra realizadas por los usuarios. Cada orden tiene un **id** único, referencia al usuario que la realizó (`userId`), y un array de ítems embebidos (`items`) que contiene el producto comprado, la cantidad y el precio al momento de la compra. La fecha y el estado de la orden también se registran.

```json
// "userId": "ObjectId"    - referencia a users._id
// "productId": "ObjectId" - referencia a products._id
{
    "_id": "ObjectId",
    "userId": "ObjectId",
    "items": [
      {
        "productId": "ObjectId",
        "name": "Notebook Acer",
        "quantity": 1,
        "price": 450000
      }
    ],
    "total": 520000,
    "date": "2026-04-10",
    "status": "entregado"
}
```

## Justificación de decisiones de diseño

### Embedding: `items` dentro de `orders`

Los ítems de una orden **siempre se leen junto con la orden**: al consultar una orden, se necesita saber qué productos contiene, en qué cantidad y a qué precio. Los items no tienen vida independiente (nadie consulta "todas las líneas de ítem del producto X"), se acceden siempre a través de la orden que los contiene. Embeberlos evita una colección extra y un `$lookup` innecesario en cada consulta de órdenes.

### Referencing: `userId` a `users` y `items.productId` a `products`

- **Usuarios**: son una entidad independiente con un número de identificación único. Pueden tener muchas órdenes, y sus datos cambian sin afectar órdenes pasadas. Si se embebieran, cada orden arrastraría datos de usuario redundantes y desactualizables.
- **Productos**: el catálogo de productos se gestiona por separado (altas, bajas, modificación de precios). Una orden debe guardar una copia inmutable del precio al momento de la compra (`items.price`), pero el stock y el resto de campos los mantiene `products`.

### Qué se ganaría o perdería con modelo relacional (SQL)

**Se perdería:** la flexibilidad de embeber `items` en `orders`. En SQL esto sería una tabla intermedia `order_items` con JOINs obligatorios para leer una orden. La consulta "órdenes con usuario + productos" requeriría 3 JOINs y múltiples queries para recomponer los ítems. (Agrega complejidad y reduce rendimiento.)

**Se ganaría:** integridad referencial nativa (Foreign Key (FK) constraints) y transacciones ACID multi-tabla. En MongoDB esto se cubre con validación en la aplicación y el driver.
