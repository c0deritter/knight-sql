import { CustomSqlPiece } from './CustomSqlPiece'

export class ParameterTokens extends CustomSqlPiece {
  
  index: number

  constructor(index: number = 1) {
    super()
    this.index = index
  }

  sql(db: string): string {
    if (db == 'postgres') {
      return '$' + this.index++
    }

    return '?'
  }
  
  values(): any[] {
    return []
  }
}