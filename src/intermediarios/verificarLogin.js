const jwt = require("jsonwebtoken");
const verifica = require("../validacoes/validaCadastro.js");
const { default: knex } = require("knex");

const verificaLogin = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ mensagem: "Token de autenticação não fornecido." });
  }
  const token = authorization.split(' ')[1];
  console.log("authorization: ", token);

  if (!token) {
    return res.status(401).json({ mensagem: "Token de autenticação não fornecido." });
  }

  try {
    const { id } = jwt.verify(token, process.env.SENHA_JWT);
    console.log('id do token: ', id)
    if (!id) {
      return res.status(401).json({ mensagem: "Token inválido." });
    }

    const usuarioExiste = await knex('usuarios').where('id_usuario', id);
    console.log('usuario existe: ',usuarioExiste)

    if (!usuarioExiste) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const { senha, ...usuario } = usuarioExiste;
    console.log(usuario);
    req.usuario = usuario;

    next();
  } catch (error) {
    console.log(error)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensagem: "Token inválido ou expirado." });
    }

    console.error("Erro no middleware verificaLogin:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = verificaLogin;
