const express = require('express');
const { cadastrar, listarUsuarios, editarUsuario, deletarUsuario, loginUsuario } = require('./controladores/login');
const schemaUsuario = require('./schemas/schemaValidarUsuario');
const validarBody = require('./validacoes/validarBody');
const verificaLogin = require('./intermediarios/verificarLogin');

const rotas = express.Router();

rotas.post('/login', loginUsuario); 
rotas.post('/usuarios', validarBody(schemaUsuario), cadastrar); 

rotas.use(verificaLogin);

rotas.get('/usuarios', listarUsuarios);
rotas.put('/usuarios/:id', editarUsuario);
rotas.delete('/usuarios/:id', deletarUsuario);

module.exports = rotas;
