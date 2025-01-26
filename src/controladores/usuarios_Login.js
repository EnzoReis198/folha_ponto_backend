require('dotenv').config();
const bcrypt = require('bcrypt');
const knex = require('../conexaoBD'); 
const jwt = require('jsonwebtoken');

const cadastrar = async (req, res) => {
    const { nome, cpf, email, senha, administrador } = req.body;

    try {
        
        if (!nome || !cpf || !email || !senha) {
            return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' });
        }

        
        const usuarioExistente = await knex('usuarios').where({ email }).first();
        if (usuarioExistente) {
            return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
        }

        
        const cpfExistente = await knex('usuarios').where({ cpf }).first();
        if (cpfExistente) {
            return res.status(400).json({ mensagem: 'CPF já cadastrado.' });
        }

        
        const senhaHash = await bcrypt.hash(senha, 10);

        
        const novoUsuario = await knex('usuarios').insert({
            nome,
            cpf,
            email,
            senha: senhaHash,
            administrador: administrador || false, 
        });

        return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const listarUsuarios = async (req, res) => {
    try {
      const usuarios = await knex('usuarios').select(
        'id_usuario', 'nome', 'email', 'cpf', 'administrador', 'criado_em'
    ).orderBy('id_usuario', 'asc');

  
      
      if (usuarios.length === 0) {
        return res.status(404).json({ mensagem: 'Nenhum usuário encontrado.' });
      }
  
      return res.status(200).json(usuarios); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  };

  const editarUsuario = async (req, res) => {
    const { id, nome, email, senha, administrador } = req.body;

    try {
        console.log('ID recebido:', id);

        const usuarioId = parseInt(id, 10);

        if (isNaN(usuarioId)) {
            return res.status(400).json({ mensagem: 'ID inválido' });
        }

        const usuario = await knex('usuarios').where('id_usuario', usuarioId).first();

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        
        if (email && email !== usuario.email) {
            const emailExistente = await knex('usuarios').where('email', email).first();
            if (emailExistente) {
                return res.status(400).json({ mensagem: 'O e-mail informado já está em uso' });
            }
        }

        let senhaHash = null;
        if (senha) {
            senhaHash = await bcrypt.hash(senha, 10);
        }

        await knex('usuarios')
            .where('id_usuario', usuarioId)
            .update({
                nome: nome || usuario.nome,
                email: email || usuario.email,
                senha: senhaHash || usuario.senha,
                administrador: administrador !== undefined ? administrador : usuario.administrador,
            });

        return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const deletarUsuario = async (req, res) => {
  const { id } = req.body;  

  try {
    
    const usuarioId = parseInt(id, 10);
    if (isNaN(usuarioId)) {
      return res.status(400).json({ mensagem: 'ID inválido' });
    }

    
    const usuario = await knex('usuarios').where('id_usuario', usuarioId).first();
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    
    await knex('usuarios').where('id_usuario', usuarioId).del();

    return res.status(200).json({ mensagem: 'Usuário deletado com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
};

const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;

  try {
    
    const usuario = await knex('usuarios').where('email', email).first();
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Senha inválida' });
    }

  
    const token = jwt.sign(
      { id: usuario.id_usuario, email: usuario.email },  
      process.env.JWT_SECRET, 
      { expiresIn: '2h' }  
    );

   
    return res.status(200).json({ mensagem: 'Login realizado com sucesso', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
};


module.exports = {
    cadastrar,
    listarUsuarios,
    editarUsuario,
    deletarUsuario,
    loginUsuario
}