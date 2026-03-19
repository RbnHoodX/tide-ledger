/**
 * Schema migration tracking for tide pool survey databases.
 * Maintains a versioned history of data format changes
 * and provides utilities for upgrading stored records
 * to the latest schema version.
 */

export type MigrationStatus = "pending" | "applied" | "failed" | "rolled_back";

export interface Migration {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly description: string;
  readonly appliedAt: Date | null;
  status: MigrationStatus;
}

export interface MigrationResult {
  readonly migrationId: string;
  readonly success: boolean;
  readonly duration: number;
  readonly error: string | null;
}

export class MigrationRegistry {
  private migrations: Migration[] = [];
  private currentVersion: number = 0;

  addMigration(version: number, name: string, description: string): Migration {
    if (this.migrations.some((m) => m.version === version)) {
      throw new Error(`Migration version ${version} already exists`);
    }
    const migration: Migration = {
      id: `mig_${version}_${name.toLowerCase().replace(/\s+/g, "_")}`,
      version,
      name,
      description,
      appliedAt: null,
      status: "pending",
    };
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
    return migration;
  }

  applyMigration(version: number): MigrationResult {
    const start = Date.now();
    const migration = this.migrations.find((m) => m.version === version);
    if (!migration) {
      return {
        migrationId: `unknown_${version}`,
        success: false,
        duration: Date.now() - start,
        error: `Migration version ${version} not found`,
      };
    }
    if (migration.status === "applied") {
      return {
        migrationId: migration.id,
        success: false,
        duration: Date.now() - start,
        error: "Migration already applied",
      };
    }
    migration.status = "applied";
    (migration as any).appliedAt = new Date();
    this.currentVersion = Math.max(this.currentVersion, version);
    return {
      migrationId: migration.id,
      success: true,
      duration: Date.now() - start,
      error: null,
    };
  }

  rollbackMigration(version: number): MigrationResult {
    const start = Date.now();
    const migration = this.migrations.find((m) => m.version === version);
    if (!migration) {
      return {
        migrationId: `unknown_${version}`,
        success: false,
        duration: Date.now() - start,
        error: `Migration version ${version} not found`,
      };
    }
    migration.status = "rolled_back";
    const applied = this.migrations
      .filter((m) => m.status === "applied")
      .map((m) => m.version);
    this.currentVersion = applied.length > 0 ? Math.max(...applied) : 0;
    return {
      migrationId: migration.id,
      success: true,
      duration: Date.now() - start,
      error: null,
    };
  }

  getPending(): Migration[] {
    return this.migrations.filter((m) => m.status === "pending");
  }

  getApplied(): Migration[] {
    return this.migrations.filter((m) => m.status === "applied");
  }

  getCurrentVersion(): number {
    return this.currentVersion;
  }

  getMigrations(): Migration[] {
    return [...this.migrations];
  }
}

export function createMigrationRegistry(): MigrationRegistry {
  return new MigrationRegistry();
}
