import type { DatabaseConnection } from './types';

/**
 * In-memory реализация подключения к БД для разработки и тестирования.
 * В продакшене можно заменить на реальное подключение к PostgreSQL, MongoDB и т.д.
 */
export class InMemoryDatabaseConnection implements DatabaseConnection {
  private static instance: InMemoryDatabaseConnection | null = null;
  private _isConnected = false;

  private constructor() {}

  static getInstance(): InMemoryDatabaseConnection {
    if (!InMemoryDatabaseConnection.instance) {
      InMemoryDatabaseConnection.instance = new InMemoryDatabaseConnection();
    }
    return InMemoryDatabaseConnection.instance;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<void> {
    // Симуляция подключения
    await new Promise((resolve) => setTimeout(resolve, 10));
    this._isConnected = true;
    console.log('[InMemoryDB] Connected');
  }

  async disconnect(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    this._isConnected = false;
    console.log('[InMemoryDB] Disconnected');
  }
}

// Экспортируем singleton инстанс
export const db = InMemoryDatabaseConnection.getInstance();
