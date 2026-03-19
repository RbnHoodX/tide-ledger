/**
 * CLI command definitions for the tide pool monitoring
 * system. Provides a registry of available commands with
 * argument parsing and help text generation for the
 * command-line interface.
 */

export type ArgType = "string" | "number" | "boolean" | "flag";

export interface CommandArg {
  readonly name: string;
  readonly type: ArgType;
  readonly required: boolean;
  readonly description: string;
  readonly defaultValue?: string | number | boolean;
}

export interface Command {
  readonly name: string;
  readonly description: string;
  readonly args: CommandArg[];
  readonly aliases: string[];
}

export interface ParsedArgs {
  readonly command: string;
  readonly positional: string[];
  readonly flags: Map<string, string | boolean>;
}

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private aliasMap: Map<string, string> = new Map();

  register(command: Command): void {
    this.commands.set(command.name, command);
    for (const alias of command.aliases) {
      this.aliasMap.set(alias, command.name);
    }
  }

  resolve(nameOrAlias: string): Command | undefined {
    const resolved = this.aliasMap.get(nameOrAlias) || nameOrAlias;
    return this.commands.get(resolved);
  }

  list(): Command[] {
    return Array.from(this.commands.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  has(nameOrAlias: string): boolean {
    return this.resolve(nameOrAlias) !== undefined;
  }

  helpText(commandName: string): string {
    const cmd = this.resolve(commandName);
    if (!cmd) return `Unknown command: ${commandName}`;
    const lines: string[] = [];
    lines.push(`${cmd.name} - ${cmd.description}`);
    if (cmd.aliases.length > 0) {
      lines.push(`  Aliases: ${cmd.aliases.join(", ")}`);
    }
    lines.push("  Arguments:");
    for (const arg of cmd.args) {
      const req = arg.required ? "(required)" : "(optional)";
      const def = arg.defaultValue !== undefined ? ` [default: ${arg.defaultValue}]` : "";
      lines.push(`    --${arg.name} <${arg.type}> ${req}${def}`);
      lines.push(`      ${arg.description}`);
    }
    return lines.join("\n");
  }

  globalHelp(): string {
    const lines: string[] = ["Available commands:", ""];
    for (const cmd of this.list()) {
      const aliases = cmd.aliases.length > 0 ? ` (${cmd.aliases.join(", ")})` : "";
      lines.push(`  ${cmd.name}${aliases} - ${cmd.description}`);
    }
    return lines.join("\n");
  }
}

export function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0] || "";
  const positional: string[] = [];
  const flags = new Map<string, string | boolean>();

  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        flags.set(key, argv[i + 1]);
        i++;
      } else {
        flags.set(key, true);
      }
    } else if (arg.startsWith("-")) {
      flags.set(arg.slice(1), true);
    } else {
      positional.push(arg);
    }
  }

  return { command, positional, flags };
}

export function createDefaultRegistry(): CommandRegistry {
  const registry = new CommandRegistry();
  registry.register({
    name: "survey",
    description: "Record a new tide pool survey",
    args: [
      { name: "pool", type: "string", required: true, description: "Pool identifier" },
      { name: "depth", type: "number", required: false, description: "Water depth in meters", defaultValue: 0 },
    ],
    aliases: ["sv"],
  });
  registry.register({
    name: "status",
    description: "Show current monitoring station status",
    args: [
      { name: "station", type: "string", required: false, description: "Station ID filter" },
    ],
    aliases: ["st", "stat"],
  });
  registry.register({
    name: "export",
    description: "Export survey data to file",
    args: [
      { name: "format", type: "string", required: false, description: "Output format", defaultValue: "csv" },
      { name: "output", type: "string", required: true, description: "Output file path" },
    ],
    aliases: ["exp"],
  });
  return registry;
}
