import { ParameterTokens } from './ParameterTokens'

export abstract class CustomSqlPiece {

  abstract sql(db: string, parameterTokens?: ParameterTokens): string
  abstract values(): any[]

  mysql(): string {
    return this.sql('mysql')
  }

  postgres(parameterTokens?: ParameterTokens): string {
    return this.sql('postgres', parameterTokens)
  }
}
