const express = require('express')
const { cadastrar, listarUsuarios, editarUsuario, deletarUsuario } = require('./controladores/login')
const schemaUsuario = require('./schemas/schemaValidarUsuario')
const validarBody = require('./validacoes/validarBody')
const rotas = express.Router()


rotas.get('/usuarios' , listarUsuarios)
rotas.post('/usuarios', validarBody(schemaUsuario) , cadastrar)
rotas.put('/usuarios/:id', editarUsuario);
rotas.delete('/usuarios/:id', deletarUsuario);
rotas.post('/login', loginUsuario);



module.exports = rotas