import { ParameterToken } from './ParameterToken'

export abstract class CustomSqlPiece {

  abstract sql(db: string, parameterToken?: ParameterToken): string
  abstract values(): any[]

  mysql(): string {
    return this.sql('mysql')
  }

  postgres(parameterToken?: ParameterToken): string {
    return this.sql('postgres', parameterToken)
  }
}
