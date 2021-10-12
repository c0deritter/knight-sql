import { CustomSqlPiece } from './CustomSqlPiece'
import { ParameterTokens } from './ParameterTokens'

export class Join extends CustomSqlPiece {

  type?: string
  table: string
  alias?: string
  on?: string

  constructor(type: string, table: string, on: string)
  constructor(type: string, table: string, alias: string, on: string)
  constructor(table: string, on: string)
  constructor(table: string, alias: string, on: string)

  constructor(typeOrTable: string, tableOrOnOrAlias: string, onOrAlias?: string, on?: string) {
    super()

    let upperCase = typeOrTable.toUpperCase()

    if (upperCase.startsWith('INNER') || upperCase.startsWith('LEFT') || 
        upperCase.startsWith('RIGHT') || upperCase.startsWith('FULL')) {
      this.type = upperCase
      this.table = tableOrOnOrAlias

      if (onOrAlias != undefined && on == undefined) {
        this.on = onOrAlias
      }
      else if (onOrAlias != undefined && on != undefined) {
        this.alias = onOrAlias
        this.on = on
      }
    }
    else {
      this.table = typeOrTable

      if (onOrAlias == undefined) {
        this.on = tableOrOnOrAlias
      }
      else {
        this.alias = tableOrOnOrAlias
        this.on = onOrAlias
      }
    }
  }

  sql(db?: string, parameterTokens?: ParameterTokens): string {
    let sql = ''

    if (this.type != undefined && this.type.length > 0) {
      sql += this.type + ' '
    }

    sql += 'JOIN ' + this.table

    if (this.alias != undefined && this.alias.length > 0) {
      sql += ' ' + this.alias
    }

    sql += ' ON ' + this.on

    return sql
  }

  values(): any[] {
    return []
  }
}
