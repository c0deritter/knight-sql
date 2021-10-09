import { expect } from 'chai'
import 'mocha'
import { Brackets, ParameterTokens, value } from '../src'

describe('Brackets', function () {
  describe('constructor', function() {
    it('should accept a list of condition pieces', function() {
      let value1 = value(1)
      let comparison = new Brackets('column =', value1, 'AND')
      expect(comparison.condition).to.not.be.undefined
      expect(comparison.condition.pieces).to.not.be.undefined
      expect(comparison.condition.pieces.length).to.equal(3)
      expect(comparison.condition.pieces[0]).to.equal('column =')
      expect(comparison.condition.pieces[1]).to.equal(value1)
      expect(comparison.condition.pieces[2]).to.equal('AND')
    })
  })

  describe('mysql', function () {
    it('should render brackets', function() {
      let comparison = new Brackets('column =', value(1))
      expect(comparison.mysql()).to.equal('(column = ?)')
      expect(comparison.values()).to.deep.equal([1])
    })

    it('should not render brackets if the condition is empty', function() {
      let comparison = new Brackets()
      expect(comparison.mysql()).to.equal('')
      expect(comparison.values()).to.deep.equal([])
    })
  })

  describe('postgres', function () {
    it('should render brackets', function() {
      let comparison = new Brackets('column =', value(1))
      expect(comparison.sql('postgres', new ParameterTokens(2))).to.equal('(column = $2)')
      expect(comparison.values()).to.deep.equal([1])
    })

    it('should not render brackets if the condition is empty', function() {
      let comparison = new Brackets()
      expect(comparison.sql('postgres', new ParameterTokens(2))).to.equal('')
      expect(comparison.values()).to.deep.equal([])
    })
  })
})