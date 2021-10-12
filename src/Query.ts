import { Condition } from './Condition'
import { CustomSqlPiece } from './CustomSqlPiece'
import { From } from './From'
import { Join } from './Join'
import { ParameterTokens } from './ParameterTokens'
import { SqlPieces } from './SqlPieces'

export class Query extends CustomSqlPiece {

  _select?: SqlPieces
  _insertInto?: SqlPieces
  _valuesToSet?: [string, any][]
  _update?: SqlPieces
  _delete?: SqlPieces
  _from?: SqlPieces
  _join?: SqlPieces
  _using?: SqlPieces
  _where?: Condition
  _groupBy?: SqlPieces
  _having?: Condition
  _orderBy?: SqlPieces
  _limit?: number
  _offset?: number
  _returning?: SqlPieces

  constructor() {
    super()
  }

  select(...selects: (string|CustomSqlPiece)[]): Query {
    if (this._select == undefined) {
      this._select = new SqlPieces(', ')
    }

    this._select.push(...selects)
    return this
  }

  insertInto(insertInto: string|CustomSqlPiece): Query {
    if (this._insertInto == undefined) {
      this._insertInto = new SqlPieces
    }

    this._insertInto.push(insertInto)
    return this
  }

  update(update: string|CustomSqlPiece): Query {
    if (this._update == undefined) {
      this._update = new SqlPieces
    }

    this._update.push(update)
    return this
  }

  delete_(delete_?: string|CustomSqlPiece): Query {
    if (this._delete == undefined) {
      this._delete = new SqlPieces
    }

    if (delete_ != undefined) {
      this._delete.push(delete_)
    }

    return this
  }

  deleteFrom(deleteFrom: string|CustomSqlPiece): Query
  deleteFrom(table: string, alias: string): Query

  deleteFrom(...args: (string|CustomSqlPiece)[]): Query {
    if (this._delete == undefined) {
      this._delete = new SqlPieces
    }

    if (this._from == undefined) {
      this._from = new SqlPieces
    }

    if (args.length == 1) {
      this._from.push(args[0])
    }
    else if (args.length >= 2) {
      this._from.push(new From(args[0] as string, args[1] as string))
    }

    return this
  }

  from(from: string|CustomSqlPiece): Query
  from(table: string, alias: string): Query

  from(...args: (string|CustomSqlPiece)[]): Query {
    if (this._from == undefined) {
      this._from = new SqlPieces(', ')
    }

    if (args.length == 1) {
      this._from.push(args[0])
    }
    else if (args.length >= 2) {
      this._from.push(new From(args[0] as string, args[1] as string))
    }

    return this
  }

  join(join: string|CustomSqlPiece): Query
  join(type: string, table: string, on: string): Query
  join(type: string, table: string, alias: string, on: string): Query
  join(table: string, on: string): Query
  join(table: string, alias: string, on: string): Query

  join(...args: any[]): Query {
    if (this._join == undefined) {
      this._join = new SqlPieces
    }

    if (args.length == 1) {
      this._join.push(...args)
    }
    else {
      let newJoin = new Join(args[0], args[1], args[2], args[3])
      let newJoinSql = newJoin.sql()
      let joinAlreadyExists = false
  
      if (this._join.pieces) {
        for (let join of this._join.pieces) {
          if (typeof join == 'string') {
            if (join == newJoinSql) {
              joinAlreadyExists = true
              break  
            }
          }
          else if (join !== null) {
            if (join.sql('mysql') == newJoinSql) {
              joinAlreadyExists = true
              break                
            }
          }
        }  
      }
  
      if (! joinAlreadyExists) {
        this._join.push(newJoin)
      }        
    }

    return this
  }

  /**
   * A USING statement like this: DELETE FROM A USING B, C
    * Supported in PostgreSQL 9.1+ (https://stackoverflow.com/questions/11753904/postgresql-delete-with-inner-join)
   */
  using(...usings: (string|CustomSqlPiece)[]): Query {
    if (this._using == undefined) {
      this._using = new SqlPieces(', ')
    }

    this._using.push(...usings)
    return this
  }

  value(column: string, value: any): Query {
    if (this._valuesToSet == undefined) {
      this._valuesToSet = []
    }

    this._valuesToSet.push([column, value])
    return this
  }

  set(column: string, value: any): Query {
    if (this._valuesToSet == undefined) {
      this._valuesToSet = []
    }
    
    this._valuesToSet.push([column, value])
    return this
  }

  where(...conditions: any[]): Query {
    if (this._where == undefined) {
      this._where = new Condition
    }

    this._where.push(...conditions)
    return this
  }

  and(...conditions: any[]): Query {
    if (this._where == undefined) {
      this._where = new Condition
    }

    this._where.push('AND', ...conditions)
    return this
  }

  or(...conditions: any[]): Query {
    if (this._where == undefined) {
      this._where = new Condition
    }

    this._where.push('OR', ...conditions)
    return this
  }

  xor(...conditions: any[]): Query {
    if (this._where == undefined) {
      this._where = new Condition
    }

    this._where.push('XOR', ...conditions)
    return this
  }

  groupBy(...columns: (string|CustomSqlPiece)[]): Query {
    if (this._groupBy == undefined) {
      this._groupBy = new SqlPieces(', ')
    }

    this._groupBy.push(...columns)
    return this
  }

  having(...conditions: any[]): Query {
    if (this._having == undefined) {
      this._having = new Condition
    }

    this._having.push(...conditions)
    return this
  }

  andHaving(...conditions: any[]): Query {
    if (this._having == undefined) {
      this._having = new Condition
    }

    this._having.push('AND', ...conditions)
    return this
  }

  orHaving(...conditions: any[]): Query {
    if (this._having == undefined) {
      this._having = new Condition
    }

    this._having.push('OR', ...conditions)
    return this
  }

  xorHaving(...conditions: any[]): Query {
    if (this._having == undefined) {
      this._having = new Condition
    }

    this._having.push('XOR', ...conditions)
    return this
  }

  orderBy(...orderBys: (string|CustomSqlPiece)[]): Query {
    if (this._orderBy == undefined) {
      this._orderBy = new SqlPieces(', ')
    }

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

  returning(returning: string|CustomSqlPiece): Query {
    if (this._returning == undefined) {
      this._returning = new SqlPieces(', ')
    }

    this._returning.push(returning)
    return this
  }

  sql(db: string, parameterTokens: ParameterTokens = new ParameterTokens): string {
    let sql = ''

    if (this._select) {
      sql += 'SELECT ' + this._select.sql(db, parameterTokens)
    }

    if (this._insertInto) {
      sql += 'INSERT INTO ' + this._insertInto.sql(db, parameterTokens)
    }

    if (this._update) {
      sql += 'UPDATE ' + this._update.sql(db, parameterTokens)
    }

    if (this._delete) {
      sql += 'DELETE'
      
      if (! this._delete.isEmpty()) {
        sql += ' ' + this._delete.sql(db, parameterTokens)
      }
    }

    if (this._from) {
      sql += ' FROM ' + this._from.sql(db, parameterTokens)
    }

    if (this._using) {
      sql += ' USING ' + this._using.sql(db, parameterTokens)
    }

    if (this._join) {
      sql += ' ' + this._join.sql(db, parameterTokens)
    }

    if (this._insertInto && this._valuesToSet && this._valuesToSet.length > 0) {
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

    if (this._update && this._valuesToSet && this._valuesToSet.length > 0) {
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

    if (this._where) {
      sql += ' WHERE ' + this._where.sql(db, parameterTokens)
    }

    if (this._groupBy) {
      sql += ' GROUP BY ' + this._groupBy.sql(db, parameterTokens)
    }

    if (this._having) {
      sql += ' HAVING ' + this._having.sql(db, parameterTokens)
    }

    if (this._orderBy) {
      sql += ' ORDER BY ' + this._orderBy.sql(db, parameterTokens)
    }

    if (this._limit != undefined) {
      sql += ' LIMIT ' + parameterTokens.create(db)
    }

    if (this._offset != undefined) {
      sql += ' OFFSET ' + parameterTokens.create(db)
    }

    if (this._returning) {
      sql += ' RETURNING ' + this._returning.sql(db, parameterTokens)
    }

    return sql
  }

  values(): any[] {
    let values: any[] = []

    if (this._select) {
      values.push(...this._select.values())
    }

    if (this._insertInto) {
      values.push(...this._insertInto.values())
    }

    if (this._update) {
      values.push(...this._update.values())
    }

    if (this._delete) {
      values.push(...this._delete.values())
    }

    if (this._from) {
      values.push(...this._from.values())
    }

    if (this._using) {
      values.push(...this._using.values())
    }

    if (this._join) {
      values.push(...this._join.values())
    }

    if (this._valuesToSet) {
      for (let value of this._valuesToSet) {
        values.push(value[1])
      }
    }

    if (this._where) {
      values.push(...this._where.values())
    }

    if (this._groupBy) {
      values.push(...this._groupBy.values())
    }

    if (this._having) {
      values.push(...this._having.values())
    }

    if (this._orderBy) {
      values.push(...this._orderBy.values())
    }

    if (this._limit != undefined) {
      values.push(this._limit)
    }

    if (this._offset != undefined) {
      values.push(this._offset)
    }

    if (this._returning) {
      values.push(...this._returning.values())
    }

    return values
  }
}
