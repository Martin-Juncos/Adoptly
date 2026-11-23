/**
 * Configura la conexión de Sequelize con PostgreSQL.
 * Este módulo no crea tablas: solo prepara y comprueba la conexión a la base.
 */

// Importa Sequelize para administrar la conexión y las consultas a PostgreSQL.
import { Sequelize } from 'sequelize';

// Convierte una variable obligatoria en texto y falla temprano si no está configurada.
function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta configurar la variable de entorno ${name}.`);
  }

  return value;
}

// Lee el puerto de PostgreSQL y valida que sea un número válido.
function getDatabasePort(): number {
  const port = Number(process.env.DB_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('La variable DB_PORT debe ser un número entre 1 y 65535.');
  }

  return port;
}

// Crea la instancia reutilizable usando exclusivamente la configuración del entorno.
export const sequelize = new Sequelize(
  requiredEnvironmentVariable('DB_NAME'),
  requiredEnvironmentVariable('DB_USER'),
  requiredEnvironmentVariable('DB_PASSWORD'),
  {
    host: requiredEnvironmentVariable('DB_HOST'),
    port: getDatabasePort(),
    dialect: 'postgres',
    logging: false,
  },
);

// Comprueba que PostgreSQL acepte la conexión; no crea ni modifica tablas.
export async function testDatabaseConnection(): Promise<void> {
  await sequelize.authenticate();
}
