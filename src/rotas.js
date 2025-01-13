const express = require('express')
const { login } = require('./controladores/login')
const rotas = express()


rotas.get('/', login)



module.exports = rotas