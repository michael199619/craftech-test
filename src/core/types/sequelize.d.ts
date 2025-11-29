import 'sequelize';

// For history
declare module 'sequelize' {
  interface CreateOptions {
    userId?: string;
  }

  interface UpdateOptions {
    userId?: string;
    individualHooks?: boolean;
  }

  interface DestroyOptions {
    userId?: string;
    individualHooks?: boolean;
  }

  interface InstanceDestroyOptions {
    userId?: string;
  }
  interface BulkDestroyOptions {
    userId?: string;
  }
}
