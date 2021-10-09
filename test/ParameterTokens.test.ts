import { expect } from 'chai'
import 'mocha'
import { ParameterTokens } from '../src'

describe('ParameterTokens', function () {
  describe('constructor', function () {
    it('should accept an index', function () {
      let parameterTokens = new ParameterTokens(2)
      expect(parameterTokens.index).to.equal(2)
    })
  })

  describe('mysql', function () {
    it('should render a MySQL parameter token', function () {
      let parameterTokens = new ParameterTokens(2)
      expect(parameterTokens.create('mysql')).to.equal('?')
      expect(parameterTokens.index).to.equal(2)
    })
  })

  describe('postgres', function () {
    it('should render a MySQL parameter token', function () {
      let parameterTokens = new ParameterTokens(2)
      expect(parameterTokens.create('postgres')).to.equal('$2')
      expect(parameterTokens.index).to.equal(3)
    })
  })
})