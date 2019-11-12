export default class {

  static select(select: string): Query {
    let query = new Query()
    query.select(select)
    return query
  }
}

export class Query {

  private _selects: string[] = []
  private _froms: string[] = []
  private _joins: Join[] = []
  private _wheres: Where[] = []
  private _orderBys: OrderBy[] = []
  private _limit?: number
  private _offset?: number
  
  select(select: string): Query {
    this._selects.push(select)
    return this
  }

  from(from: string): Query {
    this._froms.push(from)
    return this
  }

  join(typeOrTable: string, tableOrOn: string, on?: string): Query {
    this._joins.push(new Join(typeOrTable, tableOrOn, on))
    return this
  }

  where(where: string, valueOrOperator?: any, value?: any): Query {
    this._wheres.push(new Where(where, valueOrOperator, value))
    return this
  }

  orderBy(orderBy: string, direction?: string): Query {
    let orderByObj = new OrderBy(orderBy, direction)
    this._orderBys.push(orderByObj)
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

  sql(): string {
    let sql = ""
    let varIndex = 1

    if (this._selects.length > 0) {
      sql += "SELECT "
      let firstSelect = true

      for (let select of this._selects) {
        if (! firstSelect) {
          sql += ", "
        }

        sql += select
        firstSelect = false
      }
    }

    if (this._froms.length > 0) {
      sql += " FROM "
      let firstFrom = true

      for (let from of this._froms) {
        if (! firstFrom) {
          sql += ", "
        }

        sql += from
        firstFrom = false
      }
    }

    for (let join of this._joins) {
      sql += " " + join.sql()
    }

    if (this._wheres.length > 0) {
      sql += " WHERE "

      let firstWhere = true
      for (let where of this._wheres) {
        if (! firstWhere) {
          sql += " AND "
        }

        let whereResult = <{ sql: string, varIndex: number }> where.sql(varIndex)
        varIndex = whereResult.varIndex
        sql += whereResult.sql
        firstWhere = false
      }
    }

    if (this._orderBys.length > 0) {
      sql += " ORDER BY "
      let firstOrderBy = true

      for (let orderBy of this._orderBys) {
        if (! firstOrderBy) {
          sql += ", "
        }

        sql += orderBy.sql()
        firstOrderBy = false
      }
    }

    if (this._limit != undefined) {
      sql += " LIMIT $" + varIndex
      varIndex++
    }
    
    if (this._offset != undefined) {
      sql += " OFFSET $" + varIndex
      varIndex++
    }
    
    if (sql.length > 0) {
      sql += ";"
    }

    return sql
  }

  values(): any[] {
    let values: any[] = []

    for (let where of this._wheres) {
      if (where.operator == "IN") {
        if (where.value instanceof Array) {
          for (let value of where.value) {
            values.push(value)
          }
        }
        else {
          values.push(where.value)
        }
      }
      else if (! where.operator.endsWith("NULL")) {
        values.push(where.value)
      }
    }

    if (this._limit != undefined) {
      values.push(this._limit)
    }

    if (this._offset != undefined) {
      values.push(this._offset)
    }

    return values
  }
}

export class Join {
  type: string = ""
  table: string
  on?: string

  constructor(typeOrTable: string, tableOrOn: string, on?: string) {
    let upperCase = typeOrTable.trim().toUpperCase()

    if (upperCase.startsWith("INNER") || upperCase.startsWith("LEFT") || 
        upperCase.startsWith("RIGHT") || upperCase.startsWith("FULL")) {
      this.type = upperCase
      this.table = tableOrOn
      this.on = on
    }
    else {
      this.table = typeOrTable
      this.on = tableOrOn
    }
  }

  sql(): string {
    return this.type + " JOIN " + this.table + " ON " + this.on
  }
}

export class Where {

  private static readonly nullRegExp = /(\w+\bis\b\w+\bnull\b\w*)/i
  private static readonly notNullRegExp = /(\w+\bis\b\w+\bnot\b\w+\bnull\b\w*)/i
  private static readonly inRegExp = /(\w+\bin\b\w*)/i

  column: string
  operator: string = "="
  value: any
  
  constructor(where: string, valueOrOperator?: any, value?: any) {
    if (where.search(Where.nullRegExp) > -1) {
      this.column = where.replace(Where.nullRegExp, "")
      this.operator = "IS NULL"
    }
    else if (where.search(Where.notNullRegExp) > -1) {
      this.column = where.replace(Where.notNullRegExp, "")
      this.operator = "IS NOT NULL"
    }
    else if (where.search(Where.inRegExp) > -1) {
      this.column = where.replace(Where.inRegExp, "")
      this.operator = "IN"
    }
    else {
      this.column = where
    }
    
    if (valueOrOperator !== undefined) {
      // 4 because LIKE is the longest supported operator
      if (typeof valueOrOperator == 'string' && valueOrOperator.length <= 4) {
        let upperCase = valueOrOperator.trim().toUpperCase()

        if (upperCase == "=" || upperCase == ">" || upperCase == "<" || upperCase == ">=" ||
            upperCase == "<=" || upperCase == "<>" || upperCase == "IN" || upperCase == "LIKE") {
          this.operator = upperCase
        }
        else {
          this.operator = "="
          this.value = valueOrOperator
        }
      }
      else if (valueOrOperator === null) {
        this.operator = "IS NULL"
      }
      else if (valueOrOperator instanceof Array) {
        this.operator = "IN"
        this.value = valueOrOperator
      }
      else {
        this.operator = "="
        this.value = valueOrOperator
      }
    }

    if (value != undefined) {
      this.value = value
    }
  }

  sql(varIndex?: number): string | { sql: string, varIndex: number } {
    let externalVarIndex = true

    if (varIndex == undefined) {
      varIndex = 1
      externalVarIndex = false
    }

    let sql = this.column + " " + this.operator

    if (this.operator == "IN") {
      sql += " ("

      if (this.value instanceof Array && this.value.length > 0) {

        let firstValue = true        
        for (let value of this.value) {
          if (! firstValue) {
            sql += ", "
          }

          sql += "$" + varIndex
          varIndex++
          firstValue = false
        }
      }
      else {
        sql += "$" + varIndex
        varIndex++
      }

      sql += ")"
    }
    else if (! this.operator.endsWith("NULL")) {
      sql += " $" + varIndex
      varIndex++
    }

    if (externalVarIndex) {
      return {
        sql: sql,
        varIndex: varIndex
      }
    }
    else {
      return sql
    }
  }
}

export class OrderBy {

  column: string
  direction?: string

  constructor(column: string, direction?: string) {
    this.column = column
    this.direction = direction
  }

  sql(): string {
    if (this.direction != undefined) {
      if (this.direction.toLowerCase() == "asc") {
        return this.column + " ASC"
      }
      else if (this.direction.toLowerCase() == "desc") {
        return this.column + " DESC"
      }
      else {
        return this.column + " " + this.direction
      }
    }

    return this.column
  }
}
