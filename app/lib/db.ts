import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

// Prefer a single DATABASE_URL; fall back to individual POSTGRES_* env vars
const connectionString = process.env.DATABASE_URL ?? undefined;

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : undefined,
        // Connection pool configuration
        max: parseInt(process.env.DB_POOL_MAX || "20", 10), // Maximum connections
        min: parseInt(process.env.DB_POOL_MIN || "2", 10), // Minimum connections
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10), // 30 seconds
        connectionTimeoutMillis: parseInt(
          process.env.DB_CONNECTION_TIMEOUT || "5000",
          10
        ), // 5 seconds
      }
    : {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT
          ? parseInt(process.env.POSTGRES_PORT, 10)
          : 5432,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : undefined,
        // Connection pool configuration
        max: parseInt(process.env.DB_POOL_MAX || "20", 10), // Maximum connections
        min: parseInt(process.env.DB_POOL_MIN || "2", 10), // Minimum connections
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10), // 30 seconds
        connectionTimeoutMillis: parseInt(
          process.env.DB_CONNECTION_TIMEOUT || "5000",
          10
        ), // 5 seconds
      }
);

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  try {
    const start = Date.now();
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries (over 1 second)
    if (duration > 1000) {
      console.warn(`Slow query detected (${duration}ms):`, text);
    }

    return result;
  } catch (error) {
    console.error("Database query error:", {
      query: text,
      params: params ? "[REDACTED]" : undefined,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * @param queries Array of queries to execute
 * @returns Array of results
 */
export async function transaction<T extends QueryResultRow = QueryResultRow>(
  queries: Array<{ text: string; params?: any[] }>
): Promise<QueryResult<T>[]> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const results: QueryResult<T>[] = [];

    for (const { text, params } of queries) {
      const result = await client.query<T>(text, params);
      results.push(result);
    }

    await client.query("COMMIT");
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a callback function within a transaction
 * @param callback Function that receives a client and returns a promise
 * @returns The result of the callback
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get database pool statistics
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query("SELECT 1 as health");
    return result.rows[0]?.health === 1;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Pool event listeners for monitoring
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

pool.on("connect", () => {
  console.log("New database connection established");
});

pool.on("acquire", () => {
  console.log("Connection acquired from pool");
});

pool.on("remove", () => {
  console.log("Connection removed from pool");
});

export default pool;
