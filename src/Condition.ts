import { CustomSqlPiece } from './CustomSqlPiece'
import { ParameterTokens } from './ParameterTokens'
import { Query } from './Query'
import { Value } from './Value'

export class Condition extends CustomSqlPiece {

  pieces?: any[]
  removeOuterLogicalOperators: boolean = false
  surroundWithBrackets: boolean = false

  constructor(...pieces: any[]) {
    super()
    this.pieces = pieces
  }

  push(...pieces: any[]): Condition {
    if (this.pieces == undefined) {
      this.pieces = []
    }

    this.pieces.push(...pieces)
    return this
  }

  isEmpty(): boolean {
    return ! this.pieces || this.pieces && this.pieces.length == 0
  }

  and(...pieces: any[]): Condition {
    if (this.pieces == undefined) {
      this.pieces = []
    }

    this.pieces.push('AND', ...pieces)
    return this
  }

  or(...pieces: any[]): Condition {
    if (this.pieces == undefined) {
      this.pieces = []
    }

    this.pieces.push('OR', ...pieces)
    return this
  }

  xor(...pieces: any[]): Condition {
    if (this.pieces == undefined) {
      this.pieces = []
    }

    this.pieces.push('XOR', ...pieces)
    return this
  }

  sql(db: string, parameterTokens: ParameterTokens = new ParameterTokens): string {
    if (this.pieces == undefined) {
      return ''
    }

    let sql = ''
    let space = ''
    let withoutSpaceIndex = 0
    let openingBracketAdded = false

    for (let i = 0; i < this.pieces.length; i++) {
      let piece = this.pieces[i]

      if (piece === undefined || piece === '') {
        continue
      }

      if (i == 0 && this.removeOuterLogicalOperators && typeof piece == 'string' && piece.length >= 2 && piece.length <= 3) {
        let upperCase = piece.toUpperCase()

        if (upperCase == 'AND' || upperCase == 'OR' || upperCase == 'XOR') {
          continue
        }
      }

      if (i == this.pieces.length - 1 && this.removeOuterLogicalOperators && typeof piece == 'string' && piece.length >= 2 && piece.length <= 3) {
        let upperCase = piece.toUpperCase()

        if (upperCase == 'AND' || upperCase == 'OR' || upperCase == 'XOR') {
          continue
        }
      }

      if (this.surroundWithBrackets && ! openingBracketAdded) {
        sql += '('
        openingBracketAdded = true
      }

      if (typeof piece == 'string') {
        if (piece.length > 0 && piece[piece.length - 1] == '.') {
          withoutSpaceIndex = i + 1
        }

        if (withoutSpaceIndex == i) {
          sql += piece
        }
        else {
          sql += space + piece
        }
      }
      else if (typeof piece == 'number') {
        sql += space + piece
      }
      else if (piece === null) {
        sql += space + 'NULL'
      }
      else if (piece instanceof Array) {
        sql += space + '(' + piece.join(', ') + ')'
      }
      else if (piece instanceof Value) {
        if (piece.value instanceof Array) {
          let parameters: string[] = []

          for (let i = 0; i < piece.value.length; i++) {
            parameters.push(parameterTokens.create(db))
          }

          sql += space + '(' + parameters.join(', ') + ')'
        }
        else if (piece.value === null) {
          sql += space + 'NULL'
        }
        else {
          sql += space + parameterTokens.create(db)
        }
      }
      else if (piece instanceof Query) {
        sql += space + '(' + piece.sql(db, parameterTokens) + ')'
      }
      else if (piece instanceof CustomSqlPiece) {
        sql += space + piece.sql(db, parameterTokens)
      }
      else {
        sql += space + parameterTokens.create(db)
      }

      if (space.length == 0) {
        space = ' '
      }
    }

    if (openingBracketAdded) {
      sql += ')'
    }

    return sql
  }

  values(): any[] {
    let values: any[] = []

    if (this.pieces == undefined) {
      return values
    }

    for (let piece of this.pieces) {
      if (piece instanceof Value) {
        if (piece.value instanceof Array) {
          values.push(...piece.value)
        }
        else if (piece.value === null) {
        }
        else {
          values.push(piece.value)
        }
      }
      else if (piece instanceof CustomSqlPiece) {
        values.push(...piece.values())
      }
      else if (piece instanceof Query) {
        values.push(...piece.values())
      }
      else if (piece === undefined || piece === '') {
      }
      else if (typeof piece == 'string') {
      }
      else if (typeof piece == 'number') {
      }
      else if (piece === null) {
      }
      else if (piece instanceof Array) {
      }
      else {
        values.push(piece)
      }
    }

    return values
  }
}

export function condition(...pieces: any[]): Condition {
  return new Condition(...pieces)
}
