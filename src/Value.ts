export class Value {
  value: any

  constructor(value: any) {
    this.value = value
  }
}

export function value(value: any): Value {
  return new Value(value)
}
