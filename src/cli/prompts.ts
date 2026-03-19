/**
 * Interactive prompt helpers for the tide pool monitoring CLI.
 * Provides structured question/answer flows for survey data
 * entry and configuration wizards used during field sessions.
 */

export type PromptType = "text" | "number" | "select" | "confirm" | "multiselect";

export interface PromptOption {
  readonly label: string;
  readonly value: string;
}

export interface PromptDefinition {
  readonly id: string;
  readonly type: PromptType;
  readonly message: string;
  readonly required: boolean;
  readonly options?: PromptOption[];
  readonly defaultValue?: string;
  readonly validation?: (input: string) => string | null;
}

export interface PromptResponse {
  readonly promptId: string;
  readonly value: string;
  readonly timestamp: Date;
}

export class PromptFlow {
  readonly name: string;
  private prompts: PromptDefinition[] = [];
  private responses: PromptResponse[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addPrompt(prompt: PromptDefinition): void {
    this.prompts.push(prompt);
  }

  getPrompts(): PromptDefinition[] {
    return [...this.prompts];
  }

  recordResponse(promptId: string, value: string): PromptResponse {
    const prompt = this.prompts.find((p) => p.id === promptId);
    if (!prompt) {
      throw new Error(`Unknown prompt: ${promptId}`);
    }
    if (prompt.required && value.trim().length === 0) {
      throw new Error(`Response required for: ${prompt.message}`);
    }
    if (prompt.validation) {
      const error = prompt.validation(value);
      if (error) throw new Error(error);
    }
    const response: PromptResponse = {
      promptId,
      value,
      timestamp: new Date(),
    };
    this.responses.push(response);
    return response;
  }

  getResponses(): PromptResponse[] {
    return [...this.responses];
  }

  isComplete(): boolean {
    const requiredIds = this.prompts
      .filter((p) => p.required)
      .map((p) => p.id);
    const answeredIds = new Set(this.responses.map((r) => r.promptId));
    return requiredIds.every((id) => answeredIds.has(id));
  }

  nextUnanswered(): PromptDefinition | null {
    const answeredIds = new Set(this.responses.map((r) => r.promptId));
    return this.prompts.find((p) => !answeredIds.has(p.id)) || null;
  }

  reset(): void {
    this.responses = [];
  }

  summary(): string {
    const lines = [`Prompt Flow: ${this.name}`];
    for (const prompt of this.prompts) {
      const response = this.responses.find((r) => r.promptId === prompt.id);
      const val = response ? response.value : "(unanswered)";
      lines.push(`  ${prompt.message}: ${val}`);
    }
    return lines.join("\n");
  }
}

export function createSurveyFlow(): PromptFlow {
  const flow = new PromptFlow("New Survey");
  flow.addPrompt({
    id: "pool_id",
    type: "text",
    message: "Enter pool identifier",
    required: true,
  });
  flow.addPrompt({
    id: "water_depth",
    type: "number",
    message: "Water depth (meters)",
    required: true,
    validation: (input) => {
      const n = parseFloat(input);
      if (isNaN(n) || n < 0) return "Depth must be a non-negative number";
      return null;
    },
  });
  flow.addPrompt({
    id: "temperature",
    type: "number",
    message: "Water temperature (C)",
    required: false,
    defaultValue: "15",
  });
  flow.addPrompt({
    id: "notes",
    type: "text",
    message: "Survey notes",
    required: false,
  });
  return flow;
}
