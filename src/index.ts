// https://ronsavage.github.io/SQL/sql-92.bnf.html

import { Query } from './Query'

export default class {

  static select(select: string, alias?: string): Query {
    let query = new Query
    query.select(select, alias)
    return query
  }

  static insertInto(insertInto: string): Query {
    let query = new Query
    query.insertInto(insertInto)
    return query
  }

  static update(update: string): Query {
    let query = new Query
    query.update(update)
    return query
  }

  static delete_(delete_?: string) {
    let query = new Query
    query.delete_(delete_)
    return query
  }

  static deleteFrom(from: string): Query {
    let query = new Query
    query.deleteFrom(from)
    return query
  }
}

export * from './From'
export * from './Join'
export * from './OrderBy'
export * from './Condition'
export * from './Query'
export * from './Value'
export * from './ValueToSet'
