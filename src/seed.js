// Importar ObjectId para generar IDs manualmente y las funciones de conexión
const { ObjectId } = require("mongodb");
const { connect, disconnect } = require("./db");

/*
  Función seed: poblar la base de datos con datos de ejemplo

  Crea 3 colecciones con datos de prueba para un ecommerce:
  - users:    5 clientes con dirección embebida
  - products: 6 productos del catálogo
  - orders:   8 órdenes que combinan usuarios y productos

  Las órdenes mezclan embedding (items dentro de la orden) y
  referencing (userId → users, items.productId → products).
*/
async function seed() {
	const db = await connect();

	// Limpiar colecciones antes de insertar datos
	await db.collection("users").deleteMany({});
	await db.collection("products").deleteMany({});
	await db.collection("orders").deleteMany({});

	/*
	  Colección 1: users
	  Relación 1:1 con address → embedding (se lee siempre junto al perfil)
	*/
	const users = [
		{
			_id: new ObjectId(),
			name: "Ana García",
			email: "ana.garcia@email.com",
			address: {
				street: "Av. Mitre 100",
				city: "Avellaneda",
				zip: "1870",
			},
		},
		{
			_id: new ObjectId(),
			name: "Carlos López",
			email: "carlos.lopez@email.com",
			address: {
				street: "Belgrano 200",
				city: "Lanús",
				zip: "1824",
			},
		},
		{
			_id: new ObjectId(),
			name: "María Fernández",
			email: "maria.fernandez@email.com",
			address: {
				street: "San Martín 300",
				city: "Avellaneda",
				zip: "1870",
			},
		},
		{
			_id: new ObjectId(),
			name: "Diego Torres",
			email: "diego.torres@email.com",
			address: {
				street: "Rivadavia 400",
				city: "Lomas de Zamora",
				zip: "1832",
			},
		},
		{
			_id: new ObjectId(),
			name: "Lucía Romero",
			email: "lucia.romero@email.com",
			address: {
				street: "Yrigoyen 500",
				city: "Avellaneda",
				zip: "1870",
			},
		},
	];

	/*
	  Colección 2: products
	  Catálogo independiente, se consulta por separado (stock, precios, categorías)
	*/
	const products = [
		{
			_id: new ObjectId(),
			name: "Notebook Acer",
			category: "Computadoras",
			price: 450000,
			stock: 12,
		},
		{
			_id: new ObjectId(),
			name: 'Monitor LG 24"',
			category: "Monitores",
			price: 180000,
			stock: 8,
		},
		{
			_id: new ObjectId(),
			name: "Teclado Mecánico",
			category: "Periféricos",
			price: 35000,
			stock: 25,
		},
		{
			_id: new ObjectId(),
			name: "Mouse Inalámbrico",
			category: "Periféricos",
			price: 15000,
			stock: 40,
		},
		{
			_id: new ObjectId(),
			name: "Auriculares Bluetooth",
			category: "Audio",
			price: 28000,
			stock: 20,
		},
		{
			_id: new ObjectId(),
			name: "Webcam HD",
			category: "Periféricos",
			price: 22000,
			stock: 15,
		},
	];

	/*
	  Colección 3: orders
	  - userId referencia users (un usuario puede tener muchas órdenes)
	  - items embebidos (siempre se leen junto con la orden)
	  - items.productId referencia products (catálogo independiente)
	  - items.price es copia inmutable del precio al momento de la compra
	*/
	const orders = [
		{
			_id: new ObjectId(),
			userId: users[0]._id,
			items: [
				{
					productId: products[0]._id,
					name: products[0].name,
					quantity: 1,
					price: products[0].price,
				},
				{
					productId: products[2]._id,
					name: products[2].name,
					quantity: 2,
					price: products[2].price,
				},
			],
			total: 450000 * 1 + 35000 * 2,
			date: new Date("2026-04-10"),
			status: "entregado",
		},
		{
			_id: new ObjectId(),
			userId: users[1]._id,
			items: [
				{
					productId: products[1]._id,
					name: products[1].name,
					quantity: 1,
					price: products[1].price,
				},
				{
					productId: products[4]._id,
					name: products[4].name,
					quantity: 1,
					price: products[4].price,
				},
			],
			total: 180000 * 1 + 28000 * 1,
			date: new Date("2026-04-15"),
			status: "entregado",
		},
		{
			_id: new ObjectId(),
			userId: users[2]._id,
			items: [
				{
					productId: products[0]._id,
					name: products[0].name,
					quantity: 1,
					price: products[0].price,
				},
				{
					productId: products[3]._id,
					name: products[3].name,
					quantity: 3,
					price: products[3].price,
				},
				{
					productId: products[5]._id,
					name: products[5].name,
					quantity: 1,
					price: products[5].price,
				},
			],
			total: 450000 * 1 + 15000 * 3 + 22000 * 1,
			date: new Date("2026-04-20"),
			status: "enviado",
		},
		{
			_id: new ObjectId(),
			userId: users[0]._id,
			items: [
				{
					productId: products[4]._id,
					name: products[4].name,
					quantity: 2,
					price: products[4].price,
				},
			],
			total: 28000 * 2,
			date: new Date("2026-05-01"),
			status: "entregado",
		},
		{
			_id: new ObjectId(),
			userId: users[3]._id,
			items: [
				{
					productId: products[1]._id,
					name: products[1].name,
					quantity: 1,
					price: products[1].price,
				},
				{
					productId: products[2]._id,
					name: products[2].name,
					quantity: 1,
					price: products[2].price,
				},
				{
					productId: products[3]._id,
					name: products[3].name,
					quantity: 1,
					price: products[3].price,
				},
			],
			total: 180000 * 1 + 35000 * 1 + 15000 * 1,
			date: new Date("2026-05-10"),
			status: "pendiente",
		},
		{
			_id: new ObjectId(),
			userId: users[4]._id,
			items: [
				{
					productId: products[0]._id,
					name: products[0].name,
					quantity: 1,
					price: products[0].price,
				},
				{
					productId: products[1]._id,
					name: products[1].name,
					quantity: 1,
					price: products[1].price,
				},
				{
					productId: products[5]._id,
					name: products[5].name,
					quantity: 1,
					price: products[5].price,
				},
			],
			total: 450000 * 1 + 180000 * 1 + 22000 * 1,
			date: new Date("2026-05-15"),
			status: "enviado",
		},
		{
			_id: new ObjectId(),
			userId: users[1]._id,
			items: [
				{
					productId: products[3]._id,
					name: products[3].name,
					quantity: 5,
					price: products[3].price,
				},
				{
					productId: products[5]._id,
					name: products[5].name,
					quantity: 2,
					price: products[5].price,
				},
			],
			total: 15000 * 5 + 22000 * 2,
			date: new Date("2026-05-20"),
			status: "entregado",
		},
		{
			_id: new ObjectId(),
			userId: users[2]._id,
			items: [
				{
					productId: products[2]._id,
					name: products[2].name,
					quantity: 1,
					price: products[2].price,
				},
				{
					productId: products[4]._id,
					name: products[4].name,
					quantity: 1,
					price: products[4].price,
				},
			],
			total: 35000 * 1 + 28000 * 1,
			date: new Date("2026-06-01"),
			status: "pendiente",
		},
	];

	// Insertar todas las colecciones en paralelo (no dependen entre sí al insertar)
	await db.collection("users").insertMany(users);
	await db.collection("products").insertMany(products);
	await db.collection("orders").insertMany(orders);

	console.log(
		`Seed completado: ${users.length} usuarios, ${products.length} productos, ${orders.length} órdenes`,
	);

	await disconnect();
}

// Ejecutar el seed y capturar errores
seed().catch(console.error);
