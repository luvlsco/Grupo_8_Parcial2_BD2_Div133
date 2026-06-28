// Importar funciones de conexión a la base de datos
const { connect, disconnect } = require("./db");

/*
  Pipeline 1: Ranking de productos por total vendido

  Etapas:
  1. $match   - excluye órdenes con estado "pendiente" (solo ventas concretadas)
  2. $unwind  - descompone el array "items" en documentos individuales (uno por ítem)
  3. $group   - agrupa por productId, suma quantity × price y cuenta unidades
  4. $sort    - ordena de mayor a menor total vendido
  5. $lookup  - une con la colección "products" para obtener nombre y categoría
  6. $unwind  - desenvuelve el array del lookup (siempre devuelve array)
  7. $project - selecciona y renombra los campos de salida
*/
async function totalVendidoPorProducto(db) {
	console.log("\n=== 1. Total vendido por producto (ranking) ===");
	const result = await db
		.collection("orders")
		.aggregate([
			{ $match: { status: { $ne: "pendiente" } } },
			{ $unwind: "$items" },
			{
				$group: {
					_id: "$items.productId",
					totalVendido: {
						$sum: {
							$multiply: ["$items.quantity", "$items.price"],
						},
					},
					unidades: { $sum: "$items.quantity" },
				},
			},
			{ $sort: { totalVendido: -1 } },
			{
				$lookup: {
					from: "products",
					localField: "_id",
					foreignField: "_id",
					as: "product",
				},
			},
			{ $unwind: "$product" },
			{
				$project: {
					_id: 0,
					producto: "$product.name",
					categoria: "$product.category",
					unidades: 1,
					totalVendido: 1,
				},
			},
		])
		.toArray();
	console.table(result);
}

/*
  Pipeline 2: Órdenes con datos de usuario e items con subtotales

  Etapas:
  1. $lookup  - une "orders.userId" con "users._id" para traer nombre y email del comprador
  2. $unwind  - desenvuelve el array "user" (lookup devuelve array aunque sea un solo match)
  3. $project - transforma los items con $map (calcula subtotal sin perder la estructura) y formatea la fecha
  4. $sort    - ordena por fecha descendente

  Nota: los items NO necesitan lookup porque sus datos ya están embebidos en "orders.items"
*/
async function ordenesConUsuarioYProductos(db) {
	console.log("\n=== 2. Órdenes con datos de usuario y productos ===");
	const result = await db
		.collection("orders")
		.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{
				$project: {
					_id: 0,
					ordenId: { $toString: "$_id" },
					usuario: "$user.name",
					email: "$user.email",
					items: {
						$map: {
							input: "$items",
							as: "item",
							in: {
								producto: "$$item.name",
								cantidad: "$$item.quantity",
								subtotal: {
									$multiply: [
										"$$item.quantity",
										"$$item.price",
									],
								},
							},
						},
					},
					total: 1,
					estado: "$status",
					fecha: {
						$dateToString: { format: "%d/%m/%Y", date: "$date" },
					},
				},
			},
			{ $sort: { fecha: -1 } },
		])
		.toArray();
	console.table(result);
}

/*
  Pipeline 3: Top 5 usuarios por gasto total

  Etapas:
  1. $group   - agrupa por userId, suma el total de todas sus órdenes y cuenta cuántas son
  2. $sort    - ordena por gastoTotal de mayor a menor
  3. $limit   - trunca a los primeros 5 resultados
  4. $lookup  - une con "users" para obtener nombre y email
  5. $unwind  - desenvuelve el array del lookup
  6. $project - selecciona los campos de salida
*/
async function topUsuariosPorGasto(db) {
	console.log("\n=== 3. Top 5 usuarios por gasto total ===");
	const result = await db
		.collection("orders")
		.aggregate([
			{
				$group: {
					_id: "$userId",
					gastoTotal: { $sum: "$total" },
					ordenes: { $sum: 1 },
				},
			},
			{ $sort: { gastoTotal: -1 } },
			{ $limit: 5 },
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{
				$project: {
					_id: 0,
					usuario: "$user.name",
					email: "$user.email",
					gastoTotal: 1,
					ordenes: 1,
				},
			},
		])
		.toArray();
	console.table(result);
}

/*
  Función principal: conecta a la base de datos, ejecuta los 3 pipelines
  en secuencia y cierra la conexión al finalizar (éxito o error).
*/
async function main() {
	const db = await connect();

	try {
		await totalVendidoPorProducto(db);
		await ordenesConUsuarioYProductos(db);
		await topUsuariosPorGasto(db);
	} catch (err) {
		console.error("Error:", err.message);
	} finally {
		await disconnect();
	}
}

main();
