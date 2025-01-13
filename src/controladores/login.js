require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



const cadastrar = async (req,res)=>{    
    const {email, senha} = req.body
    try {
        
        if(!email || !senha){
            return res.status(400).json({mensagem: 'Preencha todos os campos corretamente'})
        }
        
        return res.status(200).json({mensagem: {email,senha}})

    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}



module.exports = {
    cadastrar
}