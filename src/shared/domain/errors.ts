export type DomainIssue = {
  path: string;
  message: string;
};

export class DomainError extends Error {
  readonly type = "domain";
  readonly issues?: DomainIssue[];

  constructor(message: string, issues?: DomainIssue[]) {
    super(message);
    this.name = "DomainError";
    this.issues = issues;
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      issues: this.issues,
    };
  }
}
