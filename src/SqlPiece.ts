import { ParameterTokens } from './ParameterTokens'

export abstract class SqlPiece {

  abstract sql(db: string, parameterTokens?: ParameterTokens): string
  abstract values(): any[]

  mysql(): string {
    return this.sql('mysql')
  }

  postgres(): string {
    return this.sql('postgres')
  }
}
