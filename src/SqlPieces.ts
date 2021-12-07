import { ParameterToken } from './ParameterToken'
import { CustomSqlPiece } from './CustomSqlPiece'

export class SqlPieces extends CustomSqlPiece {

  pieces?: (string|CustomSqlPiece)[]
  separator: string

  constructor(separator: string = ' ') {
    super()
    this.separator = separator
  }

  push(...pieces: (string|CustomSqlPiece)[]): SqlPieces {
    if (this.pieces == undefined) {
      this.pieces = []
    }

    this.pieces.push(...pieces)
    return this
  }

  isEmpty(): boolean {
    return ! this.pieces || this.pieces && this.pieces.length == 0
  }

  sql(db: string, parameterToken?: ParameterToken): string {
    if (this.pieces == undefined) {
      return ''
    }

    let sqlStrings: string[] = []

    for (let piece of this.pieces) {
      if (typeof piece == 'string') {
        sqlStrings.push(piece)
      }
      else if (piece !== null) {
        sqlStrings.push(piece.sql(db, parameterToken))
      }
    }

    return sqlStrings.join(this.separator)
  }

  values(): any[] {
    let values: any[] = []

    if (this.pieces == undefined) {
      return values
    }

    for (let piece of this.pieces) {
      if (typeof piece == 'object' && piece !== null) {
        values.push(...piece.values())
      }
    }

    return values
  }
}