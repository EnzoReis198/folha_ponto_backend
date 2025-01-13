const express = require('express')
const { cadastrar } = require('./controladores/login')
const rotas = express()


rotas.get('/', cadastrar)



module.exports = rotas