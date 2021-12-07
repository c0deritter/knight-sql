import { expect } from 'chai'
import 'mocha'
import { ParameterToken } from '../src'

describe('ParameterToken', function () {
  describe('constructor', function () {
    it('should accept an index', function () {
      let parameterToken = new ParameterToken(2)
      expect(parameterToken.index).to.equal(2)
    })
  })

  describe('mysql', function () {
    it('should render a MySQL parameter token', function () {
      let parameterToken = new ParameterToken(2)
      expect(parameterToken.sql('mysql')).to.equal('?')
      expect(parameterToken.index).to.equal(2)
    })
  })

  describe('postgres', function () {
    it('should render a MySQL parameter token', function () {
      let parameterToken = new ParameterToken(2)
      expect(parameterToken.sql('postgres')).to.equal('$2')
      expect(parameterToken.index).to.equal(3)
    })
  })
})