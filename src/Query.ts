import { ParameterTokens } from '.'
import { Condition } from './Condition'
import { From } from './From'
import { Join } from './Join'
import { SqlPiece } from './SqlPiece'

export class Query extends SqlPiece {

  _select: string[] = []
  _insertInto?: string
  _valuesToSet: [string, any][] = []
  _update?: string
  _delete?: string
  _from: From[] = []
  _join: Join[] = []
  _using: string[] = []
  _where: Condition = new Condition
  _groupBy: string[] = []
  _having: Condition = new Condition
  _orderBy: string[] = []
  _limit?: number
  _offset?: number
  _returning: string[] = []

  constructor() {
    super()

    this._where.removeOuterLogicalOperators = true
    this._having.removeOuterLogicalOperators = true
  }

  select(...selects: string[]): Query {
    this._select.push(...selects)
    return this
  }

  insertInto(insertInto?: string): Query {
    this._insertInto = insertInto
    return this
  }

  update(update: string): Query {
    this._update = update
    return this
  }

  delete_(delete_?: string): Query {
    this._delete = delete_ == undefined ? '' : delete_
    return this
  }

  deleteFrom(expressionOrTable: string, alias?: string): Query {
    this._delete = ''
    this._from.push(new From(expressionOrTable, alias))
    return this
  }

  from(expression: string): Query
  from(table: string, alias?: string): Query

  from(expressionOrTable: string, alias?: string): Query {
    this._from.push(new From(expressionOrTable, alias))
    return this
  }

  join(type: string, table: string, on: string): Query
  join(type: string, table: string, alias: string, on: string): Query
  join(table: string, on: string): Query
  join(table: string, alias: string, on: string): Query

  join(typeOrTable: string, tableOrOnOrAlias: string, onOrAlias?: string, on?: string): Query {
    let newJoin = new Join(typeOrTable, tableOrOnOrAlias, onOrAlias as any, on as any)
    let joinAlreadyExists = false

    for (let join of this._join) {
      if (join.type === newJoin.type &&
          join.table === newJoin.table &&
          join.alias === newJoin.alias &&
          join.on === newJoin.on) {
        joinAlreadyExists = true
        break
      }
    }

    if (! joinAlreadyExists) {
      this._join.push(newJoin)
    }

    return this
  }

  /**
   * A USING statement like this: DELETE FROM A USING B, C
    * Supported in PostgreSQL 9.1+ (https://stackoverflow.com/questions/11753904/postgresql-delete-with-inner-join)
   */
  using(...usings: string[]): Query {
    this._using.push(...usings)
    return this
  }

  value(column: string, value: any): Query {
    this._valuesToSet.push([column, value])
    return this
  }

  set(column: string, value: any): Query {
    this._valuesToSet.push([column, value])
    return this
  }

  where(...conditions: any[]): Query {
    this._where.pieces.push(...conditions)
    return this
  }

  and(...conditions: any[]): Query {
    this._where.pieces.push('AND', ...conditions)
    return this
  }

  or(...conditions: any[]): Query {
    this._where.pieces.push('OR', ...conditions)
    return this
  }

  xor(...conditions: any[]): Query {
    this._where.pieces.push('XOR', ...conditions)
    return this
  }

  groupBy(...columns: string[]): Query {
    this._groupBy.push(...columns)
    return this
  }

  having(...conditions: any[]): Query {
    this._having.pieces.push(...conditions)
    return this
  }

  andHaving(...conditions: any[]): Query {
    this._having.pieces.push('AND', ...conditions)
    return this
  }

  orHaving(...conditions: any[]): Query {
    this._having.pieces.push('OR', ...conditions)
    return this
  }

  xorHaving(...conditions: any[]): Query {
    this._having.pieces.push('XOR', ...conditions)
    return this
  }

  orderBy(...orderBys: string[]): Query {
    this._orderBy.push(...orderBys)
    return this
  }

  limit(limit: number): Query {
    this._limit = limit
    return this
  }

  offset(offset: number): Query {
    this._offset = offset
    return this
  }

  returning(returning: string): Query {
    this._returning.push(returning)
    return this
  }

  sql(db: string, parameterTokens: ParameterTokens = new ParameterTokens): string {
    let sql = ''

    if (this._select.length > 0) {
      sql += 'SELECT ' + this._select.join(', ')
    }

    if (this._insertInto != undefined) {
      sql += 'INSERT INTO ' + this._insertInto
    }

    if (this._update != undefined) {
      sql += 'UPDATE ' + this._update
    }

    if (this._delete != undefined) {
      sql += 'DELETE' + (this._delete.length > 0 ? ' ' + this._delete : '')
    }

    if (this._from.length > 0) {
      sql += ' FROM '
      let firstFrom = true

      for (let from of this._from) {
        if (!firstFrom) {
          sql += ', '
        }

        sql += from.sql()
        firstFrom = false
      }
    }

    if (this._using.length > 0) {
      sql += ' USING ' + this._using.join(', ')
    }

    for (let join of this._join) {
      sql += ' ' + join.sql()
    }

    if (this._insertInto != undefined && this._valuesToSet.length > 0) {
      sql += ' ('
      let firstValue = true

      for (let value of this._valuesToSet) {
        if (!firstValue) {
          sql += ', '
        }

        sql += value[0]
        firstValue = false
      }

      sql += ') VALUES ('

      firstValue = true
      for (let value of this._valuesToSet) {
        if (!firstValue) {
          sql += ', '
        }

        sql += parameterTokens.create(db)
        firstValue = false
      }

      sql += ')'
    }
    else if (this._insertInto != undefined) {
      sql += ' DEFAULT VALUES'
    }

    if (this._update != undefined && this._valuesToSet.length > 0) {
      sql += ' SET '
      let firstValue = true

      for (let value of this._valuesToSet) {
        if (!firstValue) {
          sql += ', '
        }

        sql += value[0] + ' = ' + parameterTokens.create(db)
        firstValue = false
      }
    }

    if (this._where.pieces.length > 0) {
      sql += ' WHERE ' + this._where.sql(db, parameterTokens)
    }

    if (this._groupBy.length > 0) {
      let groupBys = this._groupBy.join(', ')
      sql += ' GROUP BY ' + groupBys
    }

    if (this._having.pieces.length > 0) {
      sql += ' HAVING ' + this._having.sql(db, parameterTokens)
    }

    if (this._orderBy.length > 0) {
      sql += ' ORDER BY ' + this._orderBy.join(', ')
    }

    if (this._limit != undefined) {
      sql += ' LIMIT ' + parameterTokens.create(db)
    }

    if (this._offset != undefined) {
      sql += ' OFFSET ' + parameterTokens.create(db)
    }

    if (this._returning.length > 0) {
      sql += ' RETURNING '
      let firstReturning = true

      for (let returning of this._returning) {
        if (!firstReturning) {
          sql += ', '
        }

        sql += returning
        firstReturning = false
      }
    }

    return sql
  }

  values(): any[] {
    let values: any[] = []

    for (let value of this._valuesToSet) {
      values.push(value[1])
    }

    values.push(...this._where.values())
    values.push(...this._having.values())

    if (this._limit != undefined) {
      values.push(this._limit)
    }

    if (this._offset != undefined) {
      values.push(this._offset)
    }

    return values
  }
}
