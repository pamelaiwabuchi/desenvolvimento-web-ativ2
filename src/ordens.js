export const ordens = []

//codigoOrdem não pode se repetir - verifica
export function buscarOrdem(codigoOrdem) {
    for (let i=0; i<ordens.length;i++) {
        if (String(ordens[i].codigoOrdem) === String(codigoOrdem)) {
            return ordens[i]
        }
    }
    return null
}

// tipoProduto deve ser 1, 2 ou 3
export function tipoValido(tipo) {
    const tiposValido = [1,2,3]
    for (let i=0;i<tiposValido.length;i++) {
        if (tiposValido[i] === tipo) {
            return true
        }
    }

    return false
}

export function calcularCampos(ordem) {
    let percentual

    switch (ordem.tipoProduto) {
        case 1:
            percentual = 0
            break
        case 2:
            percentual = 0.10
            break
        case 3:
            percentual = 0.20
            break
    }

    const custoAjustado = ordem.custoUnitarioBase * (1 + percentual)
    ordem.custoUnitarioAjustado = Math.round(custoAjustado * 100) / 100

    ordem.estoqueFinal = ordem.estoqueInicial + ordem.quantidadeProduzida

    const total = ordem.quantidadeProduzida * ordem.custoUnitarioAjustado
    ordem.custoTotal = Math.round(total*100)/100

    if (ordem.estoqueFinal > 5000) {
        ordem.alertaEstoque = "ALTO"
    } else if (ordem.estoqueFinal < 500) {
        ordem.alertaEstoque = 'CRITICO'
    } else {
        ordem.alertaEstoque = 'NORMAL'
    }

    return ordem
}

export function criarOrdem(dados) {
    const ordem =  {
        codigoOrdem: dados.codigoOrdem,
        codigoProduto: dados.codigoProduto,
        tipoProduto: Number(dados.tipoProduto),
        quantidadeProduzida: Number(dados.quantidadeProduzida),
        custoUnitarioBase: Number(dados.custoUnitarioBase),
        estoqueInicial: Number(dados.estoqueInicial)
    };
    return calcularCampos(ordem)
}

export function gerarRelatorio() {
    const estoquePorTipo = {padrao:0, premium:0, sobEncomenda: 0}
    const quantidadeAlertas = {alto:0, critico:0, normal:0}
    const porProduto = {}
    let somaCustoTotal = 0
    let ordemMaisCara = null
    let ordemMaisBarata = null

    for (let i=0; i<ordens.length;i++) {
        const ordem = ordens[i]

        switch (ordem.tipoProduto) {
            case 1:
                estoquePorTipo.padrao += ordem.estoqueFinal
                break
            case 2:
                estoquePorTipo.premium += ordem.estoqueFinal
                break
            case 3:
                estoquePorTipo.sobEncomenda += ordem.estoqueFinal
                break
        }

        switch (ordem.alertaEstoque) {
            case 'ALTO':
                quantidadeAlertas.alto++
                break
            case 'CRITICO':
                quantidadeAlertas.critico++
                break
            case 'NORMAL':
                quantidadeAlertas.normal++
                break
        }

        somaCustoTotal += ordem.custoTotal

        if (ordemMaisCara === null || ordem.custoTotal > ordemMaisCara.custoTotal){
            ordemMaisCara = {codigoOrdem: ordem.codigoOrdem, custoTotal:ordem.custoTotal}
        }
        if (ordemMaisBarata === null || ordem.custoTotal < ordemMaisBarata.custoTotal) {
            ordemMaisBarata = {codigoOrdem: ordem.codigoOrdem, custoTotal: ordem.custoTotal}
        }
        if (porProduto[ordem.codigoProduto] === undefined) {
            porProduto[ordem.codigoProduto] = {estoqueFinalConsolidado:0, valorTotalInvestido:0}
        }
        porProduto[ordem.codigoProduto].estoqueFinalConsolidado += ordem.estoqueFinal
        porProduto[ordem.codigoProduto].valorTotalInvestido += ordem.custoTotal
    }

    let media = 0
    if (ordens.length < 0) {
        media = Math.round(somaCustoTotal/ordens.length * 100) /100
    }

    return {
        totalOrdens: ordens.length,
        estoquePorTipo: estoquePorTipo,
        mediaCustoTotalPorOrdem: media,
        ordemMaisCara: ordemMaisCara,
        ordemMaisBarata: ordemMaisBarata,
        quantidadeAlertas: quantidadeAlertas,
        porProduto: porProduto
    } 

}



