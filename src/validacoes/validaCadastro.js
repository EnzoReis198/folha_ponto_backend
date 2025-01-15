const knex = require("../conexaoBD");
const validaCadastro = async (tabela, tipo, valor, verbo) => {
    const usuario = await knex(tabela).where(tipo, valor).returning("*");
  
    let name = tabela === "usuarios" ? "Usuario" : "Cliente";
    if (verbo === "insert") {
      if (usuario[0]) {
        return `${name} ${tipo} já cadastrado.`;
      } else {
        return false;
      }
    } else if (verbo === "update") {
      if (!usuario[0]) {
        return `${name} não encontrado`;
      }
    }
  
    return false;
  };

  module.exports = {
    validaCadastro
  }