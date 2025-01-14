const joi = require('joi');

const schemaUsuario = joi.object({
    nome: joi.string().required().messages({
        'any.required': 'O campo nome é obrigatório.',
        'string.empty': 'O campo nome é obrigatório.',
    }),
    cpf: joi.string().pattern(/^\d{11}$/).required().messages({
        'any.required': 'O campo CPF é obrigatório.',
        'string.empty': 'O campo CPF é obrigatório.',
        'string.pattern.base': 'O CPF deve conter exatamente 11 dígitos numéricos.',
    }),
    email: joi.string().email().required().messages({
        'any.required': 'O campo email é obrigatório.',
        'string.email': 'O campo email precisa ter um formato válido.',
        'string.empty': 'O campo email é obrigatório.',
    }),
    senha: joi.string().required().messages({
        'any.required': 'O campo senha é obrigatório.',
        'string.empty': 'O campo senha é obrigatório.',
    }),
    administrador: joi.boolean().optional(),
});

module.exports = schemaUsuario;
