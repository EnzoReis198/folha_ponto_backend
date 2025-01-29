const jwt = require("jsonwebtoken");
const knex = require("../conexaoBD.js");


const verificaLogin = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ mensagem: "Token de autenticação não fornecido." });
  }
  const token = authorization.split(' ')[1];
  if (!token){
    return res.status(401).json({ mensagem: "Token de autenticação não fornecido." });
  }

  try{
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    if (!id) {
      return res.status(401).json({ mensagem: "Token inválido." });
    }

    const usuarioExiste = await knex("usuarios").where({id_usuario: id}).first();


    if (!usuarioExiste) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }
    
    const { senha:__,...usuario } = usuarioExiste;
    req.usuario = usuario;
  
    next();
  } catch (error) {
    // console.log(error)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensagem: "Token inválido ou expirado." });
    }
    

    console.error("Erro no middleware verificaLogin:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = verificaLogin;
