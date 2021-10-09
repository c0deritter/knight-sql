import { ParameterTokens } from './ParameterTokens'
import { Condition } from './Condition'
import { SqlPiece } from './SqlPiece'

export class Brackets extends SqlPiece {

  condition = new Condition

  constructor(...pieces: any[]) {
    super()
    this.condition.pieces = pieces
  }

  sql(db: string, parameterTokens: ParameterTokens = new ParameterTokens): string {
    if (this.condition && this.condition.pieces && this.condition.pieces.length > 0) {
      return '(' + this.condition.sql(db, parameterTokens) + ')'
    }

    return ''
  }

  values(): any[] {
    return this.condition ? this.condition.values() : []
  }
}

export function brackets(...pieces: any[]): Brackets {
  return new Brackets(...pieces)
}