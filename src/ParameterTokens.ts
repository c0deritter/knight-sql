export class ParameterTokens {

  index: number

  constructor(index: number = 1) {
    this.index = index
  }

  create(db: string): string {
    if (db == 'postgres') {
      return '$' + this.index++
    }

    return '?'
  }
}