import { Query } from '.'
import { getParameterToken } from './tools'
import { Value } from './Value'

export class Condition {
  
  pieces: any[] = []

  constructor(...pieces: any[]) {
    this.pieces = pieces
  }

  sql(db: string, parameterIndex: number = 1): { sql: string, parameterIndex: number } {
    let sql = ''
    let space = ''
    let nextStringPieceWithoutSpace = 0

    for (let i = 0; i < this.pieces.length; i++) {
      let piece = this.pieces[i]

      if (typeof piece == 'string') {
        let nextPiece = this.pieces.length > i+1 ? this.pieces[i+1] : undefined

        if (piece.length > 0 && piece[piece.length - 1] == '.') {
          nextStringPieceWithoutSpace = i+1
        }
        else if (piece == '=' && (nextPiece === null || nextPiece.value === null)) {
          piece = 'IS'
        }
        else if ((piece == '!=' || piece == '<>') && (nextPiece === null || nextPiece.value === null)) {
          piece = 'IS NOT'
        }
        else if (piece == '=' && (nextPiece instanceof Array || nextPiece instanceof Value && nextPiece.value instanceof Array)) {
          piece = 'IN'
        }
        else if ((piece == '!=' || piece == '<>') && (nextPiece instanceof Array || nextPiece.value instanceof Array)) {
          piece = 'NOT IN'
        }

        if (nextStringPieceWithoutSpace == i) {
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
        sql += space + '('

        for (let i = 0; i < piece.length; i++) {
          if (i > 0) {
            sql += ', '
          }

          sql += piece[i]
        }
    
        sql += ')'
      }
      else if (piece instanceof Value) {
        if (piece.value instanceof Array) {
          sql += space + '('

          for (let i = 0; i < piece.value.length; i++) {
            if (i > 0) {
              sql += ', '
            }
    
            sql += getParameterToken(db, parameterIndex)
            
            if (parameterIndex) {
              parameterIndex++
            }
          }
      
          sql += ')'
        }
        else {
          sql += space + getParameterToken(db, parameterIndex)

          if (parameterIndex) {
            parameterIndex++
          }
        }
      }
      else if (piece instanceof Condition) {
        let result = piece.sql(db, parameterIndex)
        sql += space + result.sql
        parameterIndex = result.parameterIndex
      }
      else if (piece instanceof Query) {
        let result = piece.sql(db, parameterIndex)
        sql += space + '(' + result.sql + ')'
        parameterIndex = result.parameterIndex
      }
      else {
        sql += space + getParameterToken(db, parameterIndex)
        parameterIndex++
      }

      if (i == 0) {
        space = ' '
      }
    }

    return {
      sql: sql,
      parameterIndex: parameterIndex
    }
  }

  mysql(): string {
    return this.sql('mysql').sql
  }

  postgres(): string {
    return this.sql('postgres').sql
  }

  values(): any[] {
    let values: any[] = []

    for (let piece of this.pieces) {
      if (piece instanceof Value) {
        if (piece.value instanceof Array) {
          values.push(...piece.value)
        }
        else {
          values.push(piece.value)
        }
      }
      else if (piece instanceof Condition) {
        values.push(...piece.values())
      }
      else if (piece instanceof Query) {
        values.push(...piece.values())
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
