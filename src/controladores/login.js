require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



const login = async (req,res)=>{    
    
    try {
        
        return res.status(200).json({mensagem: 'tudo ok por aqui'})

    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}



module.exports = {
    login
}