export interface Logger {
  (message?: any, ...optionalParams: any[]): void;
}

export interface Map<ValueType> {
  [key: string]: ValueType | undefined;
}

export type Maybe<T> = T | undefined;
