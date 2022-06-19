import { ValidateFunction } from "ajv";

export class AjvError<T> {
  constructor(description: string, ajvVerification: ValidateFunction<T>) {
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
