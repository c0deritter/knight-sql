import { Query } from './Query'

export default class {

  static select(...selects: string[]): Query {
    let query = new Query
    return query.select(...selects)
  }

  static insertInto(insertInto: string): Query {
    let query = new Query
    return query.insertInto(insertInto)
  }

  static update(update: string): Query {
    let query = new Query
    return query.update(update)
  }

  static delete_(delete_?: string) {
    let query = new Query
    return query.delete_(delete_)
  }

  static deleteFrom(from: string): Query {
    let query = new Query
    return query.deleteFrom(from)
  }
}

export * from './Brackets'
export * from './Comparison'
export * from './Condition'
export * from './From'
export * from './Join'
export * from './ParameterTokens'
export * from './Query'
export * from './SqlPiece'
export * from './Value'
