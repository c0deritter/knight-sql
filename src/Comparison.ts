import { CustomSqlPiece } from './CustomSqlPiece'
import { ParameterTokens } from './ParameterTokens'

export class Comparison extends CustomSqlPiece {

  column: string
  operator: string
  value: any

  constructor(column: string, value: any)
  constructor(column: string, operator: string, value: any)

  constructor(...args: any[]) {
    super()

    if (args.length == 2) {
      this.column = args[0]
      this.operator = '='
      this.value = args[1]
    }
    else {
      this.column = args[0]
      this.operator = args[1]
      this.value = args[2]
    }
  }

  sql(db: string, parameterTokens: ParameterTokens = new ParameterTokens): string {
    let operator = this.operator.toUpperCase()

    if (this.value === null) {
      if (operator == '=') {
        return this.column + ' IS NULL'
      }
      else if (operator == '!=' || operator == '<>') {
        return this.column + ' IS NOT NULL'
      }
    }

    if (this.value instanceof Array) {
      if (operator == '=') {
        operator = 'IN'
      }

      if (operator == '!=' || operator == '<>') {
        operator = 'NOT IN'
      }

      if (this.value.length == 0) {
        if (operator == 'IN') {
          return '1 = 2'
        }

        if (operator == 'NOT IN') {
          return '1 = 1'
        }
      }

      let parameters: string[] = []

      for (let arrayValue of this.value) {
        if (arrayValue !== undefined && arrayValue !== null) {
          parameters.push(parameterTokens.create(db))
        }
      }

      return this.column + ' ' + operator + ' (' + parameters.join(', ') + ')'
    }

    if (this.value === undefined || this.value === null) {
      if (operator == 'IN') {
        return '1 = 2'
      }

      if (operator == 'NOT IN') {
        return '1 = 1'
      }
    }

    return this.column + ' ' + operator + ' ' + parameterTokens.create(db)
  }

  values(): any[] {
    if (this.value instanceof Array) {
      let values = []

      for (let arrayValue of this.value) {
        if (arrayValue !== undefined && arrayValue !== null) {
          values.push(arrayValue)
        }
      }

      return values
    }

    if (this.value === null) {
      return []
    }

    return this.value !== undefined ? [ this.value ] : []
  }
}

export function comparison(column: string, value: any): Comparison
export function comparison(column: string, operator: string, value: any): Comparison

export function comparison(...args: any[]): Comparison {
  if (args.length == 2) {
    return new Comparison(args[0] as any, args[1] as any)
  }

  return new Comparison(args[0] as any, args[1] as any, args[2] as any)
}