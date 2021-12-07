import { CustomSqlPiece } from './CustomSqlPiece'
import { ParameterToken } from './ParameterToken'

export class Parameter extends CustomSqlPiece {
  value: any

  constructor(value: any) {
    super()
    this.value = value
  }

  sql(db: string, parameterToken: ParameterToken = new ParameterToken): string {
    if (this.value instanceof Array) {
      let parameters: string[] = []

      for (let i = 0; i < this.value.length; i++) {
        parameters.push(parameterToken.sql(db))
      }

      return '(' + parameters.join(', ') + ')'
    }
    else if (this.value === null) {
      return 'NULL'
    }

    return parameterToken.sql(db)
  }

  values(): any[] {
    if (this.value instanceof Array) {
      return this.value
    }
    else if (this.value === null) {
      return []
    }
    else {
      return [ this.value ]
    }
  }
}

export function parameter(value: any): Parameter {
  return new Parameter(value)
}
