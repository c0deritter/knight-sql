import { ParameterToken } from './ParameterToken'
import { CustomSqlPiece } from './CustomSqlPiece'

export class From extends CustomSqlPiece {

  table: string
  alias: string

  constructor(table: string, alias: string)

  constructor(expressionOrTable: string, alias: string) {
    super()

    this.table = expressionOrTable
    this.alias = alias
  }

  sql(db: string, parameterToken?: ParameterToken): string {
    return this.table + (this.alias != undefined && this.alias.length > 0 ? ' ' + this.alias : '')
  }

  values(): any[] {
    return []
  }
}
