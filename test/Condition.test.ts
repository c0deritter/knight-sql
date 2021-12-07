import { expect } from 'chai'
import 'mocha'
import sql, { Comparison, Condition, ParameterTokens, parameter } from '../src'

describe('Condition', function () {
  describe('mysql', function () {
    it('should ignore empty strings', function() {
      let condition = new Condition('', 'a', '=', parameter(1), '')
      expect(condition.mysql()).to.equal('a = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should ignore undefined', function() {
      let condition = new Condition(undefined, 'a', '=', parameter(1), undefined)
      expect(condition.mysql()).to.equal('a = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render a simple comparison', function () {
      let condition = new Condition('column', '=', parameter(1))
      expect(condition.mysql()).to.equal('column = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render two simple comparisons connected by a logical operator', function () {
      let condition = new Condition('column', '>', parameter(0), 'AND', 'column', '<', parameter(10))
      expect(condition.mysql()).to.equal('column > ? AND column < ?')
      expect(condition.values()).to.deep.equal([0, 10])
    })

    it('should render a number', function() {
      let condition = new Condition('column =', 1, 'AND')
      expect(condition.mysql()).to.equal('column = 1 AND')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render multiple values', function() {
      let condition = new Condition(parameter(1), parameter(2))
      expect(condition.mysql()).to.equal('? ?')
      expect(condition.values()).to.deep.equal([1,2])
    })

    it('should render an alias', function () {
      let condition = new Condition('alias.', 'column', '=', parameter(1))
      expect(condition.mysql()).to.equal('alias.column = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render an array to values in brackets', function() {
      let condition = new Condition([1,2,3])
      expect(condition.mysql()).to.equal('(1, 2, 3)')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render a value which is an array to parameter tokens in brackets', function() {
      let condition = new Condition(parameter(0), parameter([1,2,3]), parameter(4))
      expect(condition.mysql()).to.equal('? (?, ?, ?) ?')
      expect(condition.values()).to.deep.equal([0,1,2,3,4])
    })

    it('should render null to an SQL NULL string', function() {
      let condition = new Condition(parameter(0), parameter(null), parameter(1))
      expect(condition.mysql()).to.equal('? NULL ?')
      expect(condition.values()).to.deep.equal([0,1])
    })

    it('should render a condition', function() {
      let condition = new Condition(new Condition('column'))
      expect(condition.mysql()).to.equal('column')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render a comparison', function() {
      let condition = new Condition(new Comparison('column', 1))
      expect(condition.mysql()).to.equal('column = ?')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render a condition with values', function() {
      let condition = new Condition(parameter(1), new Condition(parameter(2)), parameter(3))
      expect(condition.mysql()).to.equal('? ? ?')
      expect(condition.values()).to.deep.equal([1,2,3])
    })

    it('should render a sub query', function() {
      let condition = new Condition(parameter(0), sql.select('COUNT(*)').from('table').where('column =', parameter(1)), parameter(2))
      expect(condition.mysql()).to.equal('? (SELECT COUNT(*) FROM table WHERE column = ?) ?')
      expect(condition.values()).to.deep.equal([0,1,2])
    })

    it('should add a date as a parameter', function() {
      let date = new Date
      let condition = new Condition(parameter(0), date, parameter(1))
      expect(condition.mysql()).to.equal('? ? ?')
      expect(condition.values()).to.deep.equal([0,date,1])
    })

    it('should remove outer logical operators', function() {
      let c1 = new Condition('and', 'and')
      let c2 = new Condition('or', 'or')
      let c3 = new Condition('xor', 'xor')
      let c4 = new Condition('AND', 'AND')
      let c5 = new Condition('OR', 'OR')
      let c6 = new Condition('XOR', 'XOR')
      let c7 = new Condition('AND', 'column =', parameter(1), 'AND')
      let c8 = new Condition('AND', 'column1 =', parameter(1), 'OR', 'column2 =', parameter('a'), 'AND')

      c1.removeOuterLogicalOperators = true
      c2.removeOuterLogicalOperators = true
      c3.removeOuterLogicalOperators = true
      c4.removeOuterLogicalOperators = true
      c5.removeOuterLogicalOperators = true
      c6.removeOuterLogicalOperators = true
      c7.removeOuterLogicalOperators = true
      c8.removeOuterLogicalOperators = true

      expect(c1.mysql()).to.equal('')
      expect(c2.mysql()).to.equal('')
      expect(c3.mysql()).to.equal('')
      expect(c4.mysql()).to.equal('')
      expect(c5.mysql()).to.equal('')
      expect(c6.mysql()).to.equal('')
      expect(c7.mysql()).to.equal('column = ?')
      expect(c8.mysql()).to.equal('column1 = ? OR column2 = ?')
    })

    it('should render brackets', function() {
      let condition = new Condition('column =', parameter(1))
      condition.surroundWithBrackets = true
      expect(condition.mysql()).to.equal('(column = ?)')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should not render brackets if the condition is empty', function() {
      let c1 = new Condition
      c1.surroundWithBrackets = true
      expect(c1.mysql()).to.equal('')
      expect(c1.values()).to.deep.equal([])

      let c2 = new Condition('AND', 'OR')
      c2.removeOuterLogicalOperators = true
      c2.surroundWithBrackets = true
      expect(c2.mysql()).to.equal('')
      expect(c2.values()).to.deep.equal([])
    })
  })

  describe('postgres', function () {
    it('should ignore empty strings', function() {
      let condition = new Condition('', 'a', '=', parameter(1), '')
      expect(condition.postgres()).to.equal('a = $1')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should ignore undefined', function() {
      let condition = new Condition(undefined, 'a', '=', parameter(1), undefined)
      expect(condition.postgres()).to.equal('a = $1')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render a simple comparison', function () {
      let condition = new Condition('column', '=', parameter(1))
      expect(condition.postgres()).to.equal('column = $1')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render two simple comparisons connected by a logical operator', function () {
      let condition = new Condition('column', '>', parameter(0), 'AND', 'column', '<', parameter(10))
      expect(condition.postgres()).to.equal('column > $1 AND column < $2')
      expect(condition.values()).to.deep.equal([0, 10])
    })

    it('should render a number', function() {
      let condition = new Condition('column =', 1, 'AND')
      expect(condition.postgres()).to.equal('column = 1 AND')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render multiple values', function() {
      let condition = new Condition(parameter(1), parameter(2))
      expect(condition.postgres()).to.equal('$1 $2')
      expect(condition.values()).to.deep.equal([1,2])
    })

    it('should render an alias', function () {
      let condition = new Condition('alias.', 'column', '=', parameter(1))
      expect(condition.postgres()).to.equal('alias.column = $1')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render an array to values in brackets', function() {
      let condition = new Condition([1,2,3])
      expect(condition.postgres()).to.equal('(1, 2, 3)')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render a value which is an array to parameter tokens in brackets', function() {
      let condition = new Condition(parameter(0), parameter([1,2,3]), parameter(4))
      expect(condition.postgres()).to.equal('$1 ($2, $3, $4) $5')
      expect(condition.values()).to.deep.equal([0,1,2,3,4])
    })

    it('should render null to an SQL NULL string', function() {
      let condition = new Condition(parameter(0), parameter(null), parameter(1))
      expect(condition.postgres()).to.equal('$1 NULL $2')
      expect(condition.values()).to.deep.equal([0,1])
    })

    it('should render a condition', function() {
      let condition = new Condition(new Condition('column'))
      expect(condition.postgres()).to.equal('column')
      expect(condition.values()).to.deep.equal([])
    })

    it('should render a comparison', function() {
      let condition = new Condition(new Comparison('column', 1))
      expect(condition.sql('postgres', new ParameterTokens(2))).to.equal('column = $2')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should render a condition with values', function() {
      let condition = new Condition(parameter(1), new Condition(parameter(2)), parameter(3))
      expect(condition.postgres()).to.equal('$1 $2 $3')
      expect(condition.values()).to.deep.equal([1,2,3])
    })

    it('should render a sub query', function() {
      let condition = new Condition(parameter(0), sql.select('COUNT(*)').from('table').where('column =', parameter(1)), parameter(2))
      expect(condition.postgres()).to.equal('$1 (SELECT COUNT(*) FROM table WHERE column = $2) $3')
      expect(condition.values()).to.deep.equal([0, 1,2])
    })

    it('should add a date as a parameter', function() {
      let date = new Date
      let condition = new Condition(parameter(0), date, parameter(1))
      expect(condition.postgres()).to.equal('$1 $2 $3')
      expect(condition.values()).to.deep.equal([0,date,1])
    })

    it('should remove outer logical operators', function() {
      let c1 = new Condition('and', 'and')
      let c2 = new Condition('or', 'or')
      let c3 = new Condition('xor', 'xor')
      let c4 = new Condition('AND', 'AND')
      let c5 = new Condition('OR', 'OR')
      let c6 = new Condition('XOR', 'XOR')
      let c7 = new Condition('AND', 'column =', parameter(1), 'AND')
      let c8 = new Condition('AND', 'column1 =', parameter(1), 'OR', 'column2 =', parameter('a'), 'AND')

      c1.removeOuterLogicalOperators = true
      c2.removeOuterLogicalOperators = true
      c3.removeOuterLogicalOperators = true
      c4.removeOuterLogicalOperators = true
      c5.removeOuterLogicalOperators = true
      c6.removeOuterLogicalOperators = true
      c7.removeOuterLogicalOperators = true
      c8.removeOuterLogicalOperators = true

      expect(c1.postgres(new ParameterTokens(2))).to.equal('')
      expect(c2.postgres(new ParameterTokens(2))).to.equal('')
      expect(c3.postgres(new ParameterTokens(2))).to.equal('')
      expect(c4.postgres(new ParameterTokens(2))).to.equal('')
      expect(c5.postgres(new ParameterTokens(2))).to.equal('')
      expect(c6.postgres(new ParameterTokens(2))).to.equal('')
      expect(c7.postgres(new ParameterTokens(2))).to.equal('column = $2')
      expect(c8.postgres(new ParameterTokens(2))).to.equal('column1 = $2 OR column2 = $3')
    })

    it('should render brackets', function() {
      let condition = new Condition('column =', parameter(1))
      condition.surroundWithBrackets = true
      expect(condition.postgres(new ParameterTokens(2))).to.equal('(column = $2)')
      expect(condition.values()).to.deep.equal([1])
    })

    it('should not render brackets if the condition is empty', function() {
      let c1 = new Condition
      c1.surroundWithBrackets = true
      expect(c1.postgres()).to.equal('')
      expect(c1.values()).to.deep.equal([])

      let c2 = new Condition('AND', 'OR')
      c2.removeOuterLogicalOperators = true
      c2.surroundWithBrackets = true
      expect(c2.postgres()).to.equal('')
      expect(c2.values()).to.deep.equal([])
    })
  })
})