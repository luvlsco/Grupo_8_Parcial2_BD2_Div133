// Inicializar MongoClient
const { MongoClient } = require("mongodb");

/*
  Configuración de la base de datos local
  
  uri: Identificador Uniforme de Recursos (Uniform Resource Identifier) que especifica la ubicación de la base de datos MongoDB a la que se desea conectar. En este caso, se está utilizando una base de datos local en el puerto predeterminado 27017.

  dbName: Nombre de la base de datos a la que se desea conectar. En este caso, se está utilizando una base de datos llamada "ecommerce".
*/
const uri = "mongodb://localhost:27017";
const dbName = "ecommerce";

// Singleton (gestionar una única instancia del cliente): reutiliza la misma conexión
let client;

/*
  Función para conectar a la base de datos

  Si no existe una instancia del cliente, se crea una nueva instancia de MongoClient con la URI especificada y se establece la conexión a la base de datos. Luego, se devuelve la instancia de la base de datos correspondiente al nombre especificado (dbName).	
*/
async function connect() {
	if (!client) {
		client = new MongoClient(uri);
		await client.connect();
		console.log("Conectado a MongoDB");
	}
	return client.db(dbName);
}

/*
  Función para desconectar de la base de datos

  Si ya existe una instancia del cliente, se cierra la conexión y se establece la variable client en null. Esto asegura que la conexión se cierre correctamente y que no queden conexiones abiertas innecesarias.
*/
async function disconnect() {
	if (client) {
		await client.close();
		client = null;
		console.log("Desconectado de MongoDB");
	}
}

// Exportar las funciones connect y disconnect para que puedan ser utilizadas en otros archivos del proyecto.
module.exports = { connect, disconnect };
