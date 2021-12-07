import { CustomSqlPiece } from './CustomSqlPiece'

export class ParameterToken extends CustomSqlPiece {
  
  index: number

  constructor(index: number = 1) {
    super()
    this.index = index
  }

  sql(db: string, parameterToken?: ParameterToken): string {
    if (db == 'postgres') {
      return '$' + this.index++
    }

    return '?'
  }
  
  values(): any[] {
    return []
  }
}
