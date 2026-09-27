import {criarOrdem, ordens, buscarOrdem, tipoValido, calcularCampos, gerarRelatorio} from './ordens.js';
import express from 'express';

const app = express()
app.use(express.json())

app.post('/ordens', (req,res) => {
    const dados = req.body;

    if (buscarOrdem(dados.codigoOrdem)) {
        return res.status(400).json({erro: 'codigoOrdem já existe'})
    }

    if (!tipoValido(Number(dados.tipoProduto))) {
        return res.status(400).json({erro: 'tipoProduto deve ser 1, 2 ou 3'})
    }

    const novaOrdem = criarOrdem(req.body);
    ordens.push(novaOrdem);
    res.status(201).json(novaOrdem);
});

app.get('/ordens', (req,res) => {
    res.json(ordens);
})

app.get('/ordens/:codigoOrdem', (req,res) => {
    const ordem = buscarOrdem(req.params.codigoOrdem)

    if (!ordem) {
        return res.status(404).json({erro: 'Ordem não encontrada'})
    }

    res.json(ordem)
})

app.put('/ordens/:codigoOrdem', (req, res) => {
    const ordem = buscarOrdem(req.params.codigoOrdem)

    if (!ordem) {
        return res.status(404).json({erro: 'Ordem não encontrada'})
    }
    const dados = req.body

    if (dados.tipoProduto !== undefined && !tipoValido(Number(dados.tipoProduto))) {
        return res.status(400).json({erro: 'tipoProduto deve ser 1 2 ou 3'})
    }
    if (dados.codigoProduto !== undefined) {
        ordem.codigoProduto = dados.codigoProduto
    }
    if (dados.tipoProduto !== undefined) {
        ordem.tipoProduto = Number(dados.tipoProduto)
    }
    if (dados.quantidadeProduzida !== undefined) {
        ordem.quantidadeProduzida = Number(dados.quantidadeProduzida)
    }
    if (dados.custoUnitarioBase !== undefined) {
        ordem.custoUnitarioBase = Number(dados.custoUnitarioBase)
    }
    if (dados.estoqueInicial !== undefined) {
        ordem.estoqueInicial = Number(dados.estoqueInicial)
    }

    calcularCampos(ordem)

    res.json(ordem)
})

app.delete('/ordens/:codigoOrdem', (req, res) => {
    const ordem = buscarOrdem(req.params.codigoOrdem)

    if (!ordem) {
        return res.status(404).json({erro: 'Ordem não encontrada'})
    }
    const indice = ordens.indexOf(ordem)
    ordens.splice(indice,1)

    res.json({mensagem: 'Ordem removida com sucesso'})
})

app.get('/relatorios/ordens', (req, res) => {
    res.json(gerarRelatorio())
})

app.listen(3000,() => {
    console.log('API rodando em http://localhost:3000')
})
