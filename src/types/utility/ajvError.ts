import { ValidateFunction } from "ajv";

export class AjvError {
  constructor(description: string, ajvVerification: ValidateFunction) {
    this.description = description;

    if (!ajvVerification.errors) {
      throw new Error("Invalid AJV Verification Function given to constructor");
    }

    for (const error of ajvVerification.errors) {
      if (error.message) {
        this.errors.push(error.message);
      }
    }

    ajvVerification.errors = [];
  }

  description: string;
  errors: string[] = [];
}
