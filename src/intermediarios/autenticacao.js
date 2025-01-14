const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Token de autenticação não encontrado' });
  }

  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ mensagem: 'Token inválido' });
    }

    req.usuario = decoded; 
    next();
  });
};

module.exports = autenticar;