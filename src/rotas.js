const express = require('express');
const { cadastrar, listarUsuarios, editarUsuario, deletarUsuario, loginUsuario } = require('./controladores/usuarios_Login');
const schemaUsuario = require('./schemas/schemaValidarUsuario');
const validarBody = require('./validacoes/validarBody');
const verificaLogin = require('./intermediarios/verificarLogin');
const verificaAdmin = require('./intermediarios/verificarAdmin');
const { listarPontosDoUsuario, inserirPonto } = require('./controladores/dadosUsuarios');
const {registrarPontos, registrarPontosAtrasados} = require('./testes/registrarPontosTestes');
const { registrarPonto } = require('./controladores/pontos');

const rotas = express.Router();

rotas.post('/login', loginUsuario); 
rotas.post('/usuarios', validarBody(schemaUsuario), cadastrar); 

rotas.use(verificaLogin);

rotas.get('/usuarios',verificaAdmin, listarUsuarios);
rotas.put('/usuarios/:id', verificaAdmin, editarUsuario);
rotas.delete('/usuarios/:id', verificaAdmin, deletarUsuario);

rotas.get('/pontos', listarPontosDoUsuario);
rotas.post('/pontos',  /*registrarPontos  /*inserirPonto  registrarPontosAtrasados*/ registrarPonto );

module.exports = rotas;