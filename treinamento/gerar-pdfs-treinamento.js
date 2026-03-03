/**
 * ================================================
 * GERADOR DE PDFs PARA TREINAMENTO - ExtractLab
 * ================================================
 * 
 * Gera cupons fiscais em PDF (não PNG) para melhor
 * compatibilidade com o ExtractLab.
 * 
 * PDFs são MUITO melhores que imagens porque:
 * - O texto é digital (selecionável), não imagem
 * - ExtractLab consegue ler o texto nativamente
 * - A anotação de campos é mais fácil e precisa
 * - O treinamento fica mais rápido e acurado
 * 
 * Uso: node gerar-pdfs-treinamento.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// =============================================
// CONFIGURAÇÃO
// =============================================
const TOTAL_CUPONS = 20;  // ExtractLab recomenda 5-20 docs
const OUTPUT_DIR = path.join(__dirname, 'pdfs');

// =============================================
// LOJAS BRASILEIRAS REAIS
// =============================================
const LOJAS = [
  { 
    nome: 'MINIMERCADO DA PANDIA',
    razao: 'PANDIA COMERCIO DE ALIMENTOS LTDA',
    cnpj: '90.369.075/0001-37',
    ie: '096/0828125',
    end: 'RUA PANDIA CALOGERAS, 710',
    bairro: 'SARANDI',
    cidade: 'PORTO ALEGRE',
    uf: 'RS',
    cep: '91130-000',
    fone: '(51) 3364-1638'
  },
  {
    nome: 'SUPERMERCADO EXTRA',
    razao: 'SENDAS DISTRIBUIDORA S.A.',
    cnpj: '47.508.411/0157-32',
    ie: '562.377.112.117',
    end: 'AV. GIOVANNI GRONCHI, 5819',
    bairro: 'MORUMBI',
    cidade: 'SAO PAULO',
    uf: 'SP',
    cep: '05724-005',
    fone: '(11) 3741-2000'
  },
  {
    nome: 'CARREFOUR',
    razao: 'CARREFOUR COM IND LTDA',
    cnpj: '45.543.915/0329-81',
    ie: '636.092.344.118',
    end: 'ROD. RAPOSO TAVARES, KM 14,5',
    bairro: 'BUTANTA',
    cidade: 'SAO PAULO',
    uf: 'SP',
    cep: '05577-000',
    fone: '(11) 3004-2222'
  },
  {
    nome: 'ATACADAO',
    razao: 'ATACADAO S.A.',
    cnpj: '75.315.333/0219-55',
    ie: '790.200.445.112',
    end: 'AV. BANDEIRANTES, 3900',
    bairro: 'LAGOINHA',
    cidade: 'RIBEIRAO PRETO',
    uf: 'SP',
    cep: '14085-000',
    fone: '(16) 3965-1000'
  },
  {
    nome: 'PAO DE ACUCAR',
    razao: 'CIA BRAS DE DISTRIBUICAO',
    cnpj: '47.508.411/0220-56',
    ie: '562.377.115.998',
    end: 'R. TEODORO SAMPAIO, 1840',
    bairro: 'PINHEIROS',
    cidade: 'SAO PAULO',
    uf: 'SP',
    cep: '05406-100',
    fone: '(11) 3055-6000'
  },
  {
    nome: 'ASSAI ATACADISTA',
    razao: 'SENDAS DISTRIB S.A.',
    cnpj: '03.258.372/0100-43',
    ie: '112.654.998.001',
    end: 'AV. ARICANDUVA, 5555',
    bairro: 'ARICANDUVA',
    cidade: 'SAO PAULO',
    uf: 'SP',
    cep: '03527-000',
    fone: '(11) 3003-5000'
  },
  {
    nome: 'COOP',
    razao: 'COOP COOP DE CONSUMO',
    cnpj: '57.500.725/0032-12',
    ie: '645.012.890.115',
    end: 'AV. KENNEDY, 1500',
    bairro: 'CENTRO',
    cidade: 'SANTO ANDRE',
    uf: 'SP',
    cep: '09015-000',
    fone: '(11) 4437-1234'
  },
  {
    nome: 'SUPERMERCADO DIA',
    razao: 'DIA BRASIL SOC LTDA',
    cnpj: '03.476.811/0188-67',
    ie: '149.300.715.110',
    end: 'R. AMADOR BUENO, 333',
    bairro: 'SANTO AMARO',
    cidade: 'SAO PAULO',
    uf: 'SP',
    cep: '04752-000',
    fone: '(11) 3004-4444'
  },
  {
    nome: 'SONDA SUPERMERCADOS',
    razao: 'SONDA SUPERMERCADOS LTDA',
    cnpj: '62.809.834/0099-41',
    ie: '335.720.812.990',
    end: 'AV. CUPECE, 4100',
    bairro: 'JABAQUARA',
    cidade: 'SAO PAULO',
    uf: 'SP',
    cep: '04366-000',
    fone: '(11) 5588-9900'
  },
  {
    nome: 'GUANABARA',
    razao: 'SUPERM GUANABARA LTDA',
    cnpj: '33.223.841/0001-12',
    ie: '85.044.129',
    end: 'R. SENADOR BERNARDO, 55',
    bairro: 'CENTRO',
    cidade: 'RIO DE JANEIRO',
    uf: 'RJ',
    cep: '20231-000',
    fone: '(21) 2509-6000'
  },
  {
    nome: 'PREZUNIC',
    razao: 'PREZUNIC COM LTDA',
    cnpj: '30.200.208/0072-44',
    ie: '86.110.055',
    end: 'AV. BRASIL, 13155',
    bairro: 'PENHA',
    cidade: 'RIO DE JANEIRO',
    uf: 'RJ',
    cep: '21012-000',
    fone: '(21) 2561-3000'
  },
  {
    nome: 'MUNDIAL',
    razao: 'SUPERM MUNDIAL LTDA',
    cnpj: '27.113.309/0001-90',
    ie: '77.082.193',
    end: 'R. MARECHAL FLORIANO, 80',
    bairro: 'CENTRO',
    cidade: 'RIO DE JANEIRO',
    uf: 'RJ',
    cep: '20080-003',
    fone: '(21) 2263-8000'
  },
  {
    nome: 'ANGELONI',
    razao: 'ANGELONI & CIA LTDA',
    cnpj: '83.646.984/0032-44',
    ie: '254.812.009',
    end: 'R. FELIPE SCHMIDT, 515',
    bairro: 'CENTRO',
    cidade: 'FLORIANOPOLIS',
    uf: 'SC',
    cep: '88010-001',
    fone: '(48) 3224-5000'
  },
  {
    nome: 'ZAFFARI',
    razao: 'ZAFFARI COM LTDA',
    cnpj: '87.654.321/0088-99',
    ie: '096/1234567',
    end: 'AV. NILO PECANHA, 2750',
    bairro: 'BELA VISTA',
    cidade: 'PORTO ALEGRE',
    uf: 'RS',
    cep: '90460-000',
    fone: '(51) 3378-5000'
  },
  {
    nome: 'BRETAS',
    razao: 'BRETAS SUPERM LTDA',
    cnpj: '16.403.724/0056-11',
    ie: '062.578.449.0044',
    end: 'AV. AMAZONAS, 6200',
    bairro: 'GAMELEIRA',
    cidade: 'BELO HORIZONTE',
    uf: 'MG',
    cep: '30510-000',
    fone: '(31) 3379-8000'
  },
  {
    nome: 'SAVEGNAGO',
    razao: 'SAVEGNAGO SUPERM LTDA',
    cnpj: '56.884.373/0012-89',
    ie: '580.100.667.115',
    end: 'AV. PRES. VARGAS, 1555',
    bairro: 'CENTRO',
    cidade: 'RIBEIRAO PRETO',
    uf: 'SP',
    cep: '14025-000',
    fone: '(16) 3610-4000'
  },
  {
    nome: 'MUFFATO',
    razao: 'MUFFATO & CIA LTDA',
    cnpj: '77.813.910/0055-01',
    ie: '101.522.009-90',
    end: 'AV. VICTOR F AMARAL, 2200',
    bairro: 'PORTAO',
    cidade: 'CURITIBA',
    uf: 'PR',
    cep: '80320-000',
    fone: '(41) 3019-1000'
  },
  {
    nome: 'CONDOR',
    razao: 'CONDOR SUPER CENTER LTDA',
    cnpj: '76.430.433/0150-22',
    ie: '101.098.788-20',
    end: 'AV. PRES. KENNEDY, 4455',
    bairro: 'PORTAO',
    cidade: 'CURITIBA',
    uf: 'PR',
    cep: '80610-000',
    fone: '(41) 3371-8000'
  },
  {
    nome: 'BIG',
    razao: 'BIG HIPERMERCADOS LTDA',
    cnpj: '76.430.322/0091-18',
    ie: '101.987.445-33',
    end: 'R. XV DE NOVEMBRO, 890',
    bairro: 'CENTRO',
    cidade: 'CURITIBA',
    uf: 'PR',
    cep: '80020-310',
    fone: '(41) 3322-8900'
  },
  {
    nome: 'FORT ATACADISTA',
    razao: 'FORT ATACADISTA LTDA',
    cnpj: '04.159.433/0015-67',
    ie: '257.300.112',
    end: 'ROD. SC 401, KM 5',
    bairro: 'SACO GRANDE',
    cidade: 'FLORIANOPOLIS',
    uf: 'SC',
    cep: '88032-000',
    fone: '(48) 3879-5000'
  },
];

// =============================================
// PRODUTOS COM ABREVIAÇÕES REAIS
// =============================================
const PRODUTOS = {
  frutas_verduras: [
    { desc: 'BANANA PRATA', abrevs: ['BAN PRATA','BANANA PR','BAN PRT'], un: 'KG', min: 2.99, max: 8.99 },
    { desc: 'BANANA NANICA', abrevs: ['BAN NANICA','BANANA NAN','BAN NAN'], un: 'KG', min: 2.49, max: 6.99 },
    { desc: 'MACA FUJI', abrevs: ['MACA FJ','MCA FUJI','MACA FUJI KG'], un: 'KG', min: 8.99, max: 16.99 },
    { desc: 'TOMATE LONGA VIDA', abrevs: ['TOMATE L','TOM LONGA V','TOM LV'], un: 'KG', min: 5.99, max: 12.99 },
    { desc: 'BATATA LAVADA', abrevs: ['BAT LAVADA','BATATA LAV','BAT LAV'], un: 'KG', min: 3.99, max: 8.99 },
    { desc: 'CEBOLA AMARELA', abrevs: ['CEBOLA A','CEB AMAR','CEBOLA AM'], un: 'KG', min: 3.49, max: 7.99 },
    { desc: 'LARANJA PERA', abrevs: ['LAR PERA','LARANJA PR','LAR P'], un: 'KG', min: 3.49, max: 7.99 },
    { desc: 'MAMAO PAPAIA', abrevs: ['MAMAO PAP','MAM PAPAIA','MAM P'], un: 'KG', min: 5.99, max: 12.99 },
    { desc: 'ALFACE CRESPA', abrevs: ['ALF CRESPA','ALFACE CR'], un: 'UN', min: 2.49, max: 5.99 },
    { desc: 'CENOURA', abrevs: ['CENOURA','CENOURA KG'], un: 'KG', min: 4.49, max: 9.99 },
    { desc: 'MELANCIA', abrevs: ['MELANCIA','MELANCIA KG'], un: 'KG', min: 2.49, max: 5.99 },
    { desc: 'LIMAO TAHITI', abrevs: ['LIMAO TAH','LIM TAHITI','LIM T'], un: 'KG', min: 4.99, max: 12.99 },
    { desc: 'PEPINO JAPONES', abrevs: ['PEPINO JAP','PEP JAPON'], un: 'KG', min: 5.99, max: 11.99 },
    { desc: 'PIMENTAO VERDE', abrevs: ['PIMENT VD','PIM VERDE'], un: 'KG', min: 6.99, max: 14.99 },
    { desc: 'ABOBORA CABOTIA', abrevs: ['ABOB CABOT','ABOBORA CB'], un: 'KG', min: 3.99, max: 7.99 },
    { desc: 'UVA ITALIA', abrevs: ['UVA IT','UVA ITALIA'], un: 'KG', min: 9.99, max: 19.99 },
    { desc: 'MORANGO BANDEJA', abrevs: ['MORANGO BD','MORANGO BAN'], un: 'UN', min: 6.99, max: 14.99 },
    { desc: 'MANGA TOMMY', abrevs: ['MANGA TOM','MNG TOMMY'], un: 'KG', min: 5.99, max: 11.99 },
    { desc: 'CHUCHU', abrevs: ['CHUCHU','CHUCHU KG'], un: 'KG', min: 3.99, max: 7.99 },
    { desc: 'REPOLHO VERDE', abrevs: ['REPOLHO VD','REP VERDE'], un: 'KG', min: 2.99, max: 6.99 },
  ],
  carnes_frios: [
    { desc: 'COXAO DURO TA', abrevs: ['COXAO TA','COXAO D','CX DURO','CX D TA'], un: 'KG', min: 24.90, max: 49.90 },
    { desc: 'PEITO FRANGO', abrevs: ['PTO FRANGO','PEITO FRG','PTO FRG'], un: 'KG', min: 12.90, max: 24.90 },
    { desc: 'COSTELA BOVINA', abrevs: ['COST BOVINA','COST BOV','CST BOV'], un: 'KG', min: 19.90, max: 39.90 },
    { desc: 'ACÉM BOVINO', abrevs: ['ACEM BOV','ACEM BOVINO','ACM BOV'], un: 'KG', min: 22.90, max: 42.90 },
    { desc: 'COXA SOBRECOXA FRG', abrevs: ['CX SOBREC','COXA SBR FRG','CX SB FRG'], un: 'KG', min: 9.90, max: 18.90 },
    { desc: 'LINGUICA TOSCANA', abrevs: ['LING TOSCANA','LNG TOSC','LING TOSC'], un: 'KG', min: 14.90, max: 29.90 },
    { desc: 'SALSICHA PERDIGAO', abrevs: ['SALS PERDIGAO','SALSCH PERD','SALS PERD'], un: 'UN', min: 5.99, max: 12.99 },
    { desc: 'PRESUNTO SADIA', abrevs: ['PRES SADIA','PRESUNTO SAD','PRES SAD'], un: 'KG', min: 24.90, max: 44.90 },
    { desc: 'MORTADELA SADIA', abrevs: ['MORT SADIA','MORTAD SAD','MORT SAD'], un: 'KG', min: 12.90, max: 22.90 },
    { desc: 'CARNE MOIDA', abrevs: ['CARNE MOIDA','CRN MOIDA','CRN MOD'], un: 'KG', min: 18.90, max: 34.90 },
    { desc: 'PICANHA BOVINA', abrevs: ['PICANHA BOV','PIC BOV','PICANHA'], un: 'KG', min: 49.90, max: 89.90 },
    { desc: 'BACON SADIA', abrevs: ['BACON SAD','BACON SADIA'], un: 'UN', min: 9.90, max: 18.90 },
    { desc: 'SALAME ITALIANO', abrevs: ['SAL ITAL','SALAME IT','SAL IT'], un: 'KG', min: 39.90, max: 69.90 },
    { desc: 'FILE DE TILAPIA', abrevs: ['FILE TILAP','FIL TILAPIA','FIL TILP'], un: 'KG', min: 29.90, max: 49.90 },
    { desc: 'PATE EXCELSIOR PRESUNTO', abrevs: ['PATE EXCEL PRES','PATE EXC PRES','PT EXCEL PR'], un: 'UN', min: 3.49, max: 6.99 },
  ],
  laticinios: [
    { desc: 'LEITE INTEGRAL ITALAC', abrevs: ['LEITE INT ITALAC','LT INT ITALAC','LT INTEG ITAL'], un: 'UN', min: 4.49, max: 7.99 },
    { desc: 'LEITE INTEGRAL PIRACANJUBA', abrevs: ['LT INT PIRAC','LEITE PIRAC','LT PIRACANJ'], un: 'UN', min: 4.99, max: 7.99 },
    { desc: 'QUEIJO MUSSARELA', abrevs: ['QUEIJO M','QJ MUSSA','QJ MUSSARELA','MUSSA KG'], un: 'KG', min: 29.90, max: 49.90 },
    { desc: 'QUEIJO PRATO', abrevs: ['QUEIJO PR','QJ PRATO','QJ PRT'], un: 'KG', min: 34.90, max: 54.90 },
    { desc: 'REQUEIJAO CATUPIRY', abrevs: ['REQ CATUPIRY','REQJ CATUP','REQ CATU'], un: 'UN', min: 7.99, max: 14.99 },
    { desc: 'MANTEIGA AVIACAO', abrevs: ['MANT AVIACAO','MANT AVIAC','MNT AVIAC'], un: 'UN', min: 7.99, max: 14.99 },
    { desc: 'MARGARINA QUALY', abrevs: ['MARG QUALY','MARGARINA QL','MARG QL'], un: 'UN', min: 5.99, max: 10.99 },
    { desc: 'IOGURTE NATURAL NESTLE', abrevs: ['IOG NAT NESTLE','IOG NEST NAT','IOG NT NEST'], un: 'UN', min: 3.99, max: 7.99 },
    { desc: 'CREME DE LEITE NESTLE', abrevs: ['CR LEITE NESTLE','CREM LT NEST','CR LT NEST'], un: 'UN', min: 3.49, max: 5.99 },
    { desc: 'LEITE CONDENSADO MOCA', abrevs: ['LT COND MOCA','COND MOCA','LT CONDENSAD'], un: 'UN', min: 5.99, max: 9.99 },
    { desc: 'CREAM CHEESE PHILADELPHIA', abrevs: ['CR CHEESE PHIL','CREAM CH PHIL','CRMCH PHIL'], un: 'UN', min: 8.99, max: 15.99 },
    { desc: 'DANONE MORANGO', abrevs: ['DANONE MOR','DANONE MORANG','DAN MRNGO'], un: 'UN', min: 4.99, max: 8.99 },
  ],
  mercearia: [
    { desc: 'ARROZ TIPO 1 CAMIL', abrevs: ['ARROZ T1 CAMIL','ARROZ CAMIL 5K','ARZ CAMIL'], un: 'UN', min: 19.90, max: 32.90 },
    { desc: 'FEIJAO CARIOCA CAMIL', abrevs: ['FEIJ CAR CAMIL','FJ CARIOCA CAM','FJ CAR CAMIL'], un: 'UN', min: 6.99, max: 12.99 },
    { desc: 'MACARRAO ESPAGUETE RENATA', abrevs: ['MAC ESP RENATA','MACARR RENAT','MAC REN ESP'], un: 'UN', min: 3.49, max: 6.99 },
    { desc: 'OLEO SOJA SOYA', abrevs: ['OLEO SOJA SOYA','OL SOYA 900ML','OL SOJA SOYA'], un: 'UN', min: 6.99, max: 10.99 },
    { desc: 'ACUCAR CRISTAL UNIAO', abrevs: ['ACUC CRIST UNIAO','ACUCAR UNIAO','ACUC UNIAO'], un: 'UN', min: 4.99, max: 8.99 },
    { desc: 'SAL REFINADO CISNE', abrevs: ['SAL REF CISNE','SAL CISNE','SAL R CISNE'], un: 'UN', min: 2.49, max: 4.99 },
    { desc: 'CAFE PILAO 500G', abrevs: ['CAFE PILAO','CAFE PIL 500','CF PILAO'], un: 'UN', min: 12.90, max: 22.90 },
    { desc: 'CAFE MELITTA 500G', abrevs: ['CAFE MELITTA','CF MELITTA 500','CF MELIT'], un: 'UN', min: 14.90, max: 24.90 },
    { desc: 'FARINHA TRIGO DONA BENTA', abrevs: ['FAR TRIG D BENTA','FARINH D BENT','FAR DB'], un: 'UN', min: 4.49, max: 7.99 },
    { desc: 'MOLHO TOMATE HEINZ', abrevs: ['MOL TOM HEINZ','MOLHO HEINZ','ML TOM HEINZ'], un: 'UN', min: 3.99, max: 7.99 },
    { desc: 'AZEITE EXTRA VIRGEM GALLO', abrevs: ['AZ EXT VRG GALLO','AZEITE GALLO','AZ GALLO'], un: 'UN', min: 22.90, max: 39.90 },
    { desc: 'BISCOITO CREAM CRACKER VITARELLA', abrevs: ['BISC CR CRK VITAR','BISC VITARELLA','BSC CR VITAR'], un: 'UN', min: 3.99, max: 7.49 },
    { desc: 'ACHOCOLATADO NESCAU', abrevs: ['ACHOC NESCAU','NESCAU 400G','ACHOC NESC'], un: 'UN', min: 7.99, max: 14.99 },
    { desc: 'CHOC LEITE MM SINGLE', abrevs: ['CHOC LT MM SINGL','CHOC MM SINGLE','CHOC LT MM SNG'], un: 'UN', min: 2.49, max: 5.99 },
    { desc: 'GOMA MASCAR TRIDENT', abrevs: ['GOMA MASC TRIDENT','GOMA TRIDENT','GM MASC TRID'], un: 'UN', min: 2.99, max: 5.99 },
    { desc: 'MIOJO NISSIN GALINHA', abrevs: ['MIOJO NISSIN GAL','MIOJO NISSIN','MJ NISSIN GL'], un: 'UN', min: 1.49, max: 3.49 },
    { desc: 'MAIONESE HELLMANNS', abrevs: ['MAION HELLMANNS','MAION HELLM','MN HELLM'], un: 'UN', min: 6.99, max: 12.99 },
    { desc: 'EXTRATO TOMATE ELEFANTE', abrevs: ['EXT TOM ELEFANTE','EXT ELEFANTE','EXT TOM ELEF'], un: 'UN', min: 3.49, max: 6.99 },
    { desc: 'SARDINHA COQUEIRO', abrevs: ['SARD COQUEIRO','SARD COQ','SARDINH COQ'], un: 'UN', min: 5.99, max: 9.99 },
    { desc: 'MILHO VERDE QUERO', abrevs: ['MILHO VD QUERO','MILHO QUERO','MLH VD QUERO'], un: 'UN', min: 3.49, max: 6.99 },
  ],
  bebidas: [
    { desc: 'COCA COLA 2L', abrevs: ['COCA 2L','COCA COLA 2L','CC 2L'], un: 'UN', min: 7.99, max: 12.99 },
    { desc: 'GUARANA ANTARCT 2L', abrevs: ['GUAR ANT 2L','GUARANA ANT 2L','GR ANT 2L'], un: 'UN', min: 6.99, max: 11.99 },
    { desc: 'CERVEJA BRAHMA LT', abrevs: ['CERV BRAHMA LT','BRAHMA LT 350','CRV BRAHMA'], un: 'UN', min: 2.99, max: 5.49 },
    { desc: 'CERVEJA SKOL LT 350ML', abrevs: ['CERV SKOL LT','SKOL LT 350','CRV SKOL'], un: 'UN', min: 2.79, max: 4.99 },
    { desc: 'AGUA MINERAL CRYSTAL', abrevs: ['AGUA MIN CRYST','AGUA CRYSTAL','AG CRYSTAL'], un: 'UN', min: 1.49, max: 3.49 },
    { desc: 'SUCO TANG LARANJA', abrevs: ['SUCO TANG LAR','TANG LAR','SC TANG LAR'], un: 'UN', min: 1.49, max: 3.49 },
    { desc: 'REFRIGERANTE FANTA LAR', abrevs: ['REFRIG FANTA','FANTA LAR 2L','FANTA LR 2L'], un: 'UN', min: 5.99, max: 9.99 },
    { desc: 'CAFE SOLUVEL NESCAFE', abrevs: ['CF SOL NESCAFE','NESCAFE SOL','CF NESCAFE'], un: 'UN', min: 12.99, max: 24.99 },
    { desc: 'VINHO TINTO MIOLO', abrevs: ['VINHO TTO MIOLO','VINHO MIOLO','VNH TTO MIOLO'], un: 'UN', min: 19.90, max: 39.90 },
    { desc: 'ENERGETICO RED BULL', abrevs: ['ENERG RED BULL','RED BULL 250','ENRG RD BULL'], un: 'UN', min: 8.99, max: 14.99 },
  ],
  limpeza: [
    { desc: 'DETERGENTE LIMPOL', abrevs: ['DET LIMPOL','DETERG LIMPOL','DT LIMPOL'], un: 'UN', min: 1.99, max: 3.99 },
    { desc: 'AGUA SANITARIA QBOA', abrevs: ['AG SANIT QBOA','AGUA SAN QBOA','AG SN QBOA'], un: 'UN', min: 3.99, max: 7.99 },
    { desc: 'DESINFETANTE PINHO SOL', abrevs: ['DESINF P SOL','PINHO SOL','DESF PINHO'], un: 'UN', min: 5.99, max: 11.99 },
    { desc: 'SABAO PO OMO', abrevs: ['SAB PO OMO','OMO MULTIACAO','SAB OMO'], un: 'UN', min: 14.99, max: 27.99 },
    { desc: 'AMACIANTE DOWNY', abrevs: ['AMAC DOWNY','DOWNY CONC','AMCNT DOWNY'], un: 'UN', min: 8.99, max: 17.99 },
    { desc: 'ESPONJA N RISCA S SC', abrevs: ['ESPONJA N RISC','ESP N RISCA','ESPNJ N RSC'], un: 'UN', min: 2.99, max: 5.99 },
    { desc: 'PANO M USO SBRITE A', abrevs: ['PANO M USO SBRIT','PANO SBRITE','PN M USO SBRT'], un: 'UN', min: 3.99, max: 7.99 },
    { desc: 'PAPEL HIGIENICO NEVE', abrevs: ['PAP HIG NEVE','PAPEL NEVE','PH NEVE'], un: 'UN', min: 14.99, max: 27.99 },
    { desc: 'PAPEL TOALHA SCOTT', abrevs: ['PAP TOAL SCOTT','SCOTT TOALHA','PP TLH SCOTT'], un: 'UN', min: 5.99, max: 11.99 },
    { desc: 'SACO LIXO DOVER 50L', abrevs: ['SACO LX DOVER','SACO LIXO DOV','SC LX DOVER'], un: 'UN', min: 5.99, max: 11.99 },
    { desc: 'LAVA LOUCAS YPE', abrevs: ['LAVA LC YPE','LAVA LOUCA YPE','LV LC YPE'], un: 'UN', min: 2.49, max: 4.99 },
  ],
  higiene: [
    { desc: 'SABONETE DOVE ORIGINAL', abrevs: ['SAB DOVE ORIG','SABONTE DOVE','SAB DV ORIG'], un: 'UN', min: 3.99, max: 7.99 },
    { desc: 'SHAMPOO PANTENE', abrevs: ['SHAMP PANTENE','SHAMPOO PANT','SHP PANTENE'], un: 'UN', min: 14.99, max: 27.99 },
    { desc: 'CREME DENTAL COLGATE', abrevs: ['CR DENT COLGATE','CREM COLGATE','CR DNT COLG'], un: 'UN', min: 5.99, max: 12.99 },
    { desc: 'DESODORANTE REXONA', abrevs: ['DESOD REXONA','REXONA AER','DES REXONA'], un: 'UN', min: 9.99, max: 18.99 },
    { desc: 'HIDRATANTE JOHNSONS SOFT', abrevs: ['HIDRAT JOHNSONS','HIDR JOHN SOFT','HID JOHNS SFT'], un: 'UN', min: 9.99, max: 19.99 },
    { desc: 'PAD FRAN SEMPRE LIVRE', abrevs: ['PAD FRAN S LIVRE','PAD FRAN','PAD FR S LVR'], un: 'UN', min: 7.99, max: 15.99 },
    { desc: 'FRALDA PAMPERS', abrevs: ['FRALDA PAMPERS','FRAL PAMPERS','FRLD PAMPER'], un: 'UN', min: 29.99, max: 59.99 },
    { desc: 'ESCOVA DENTAL ORAL B', abrevs: ['ESC DENT ORAL B','ESC ORAL B','ESC DNT ORL'], un: 'UN', min: 7.99, max: 14.99 },
    { desc: 'CONDICIONADOR PANTENE', abrevs: ['COND PANTENE','CONDIC PANT','CND PANTENE'], un: 'UN', min: 14.99, max: 27.99 },
    { desc: 'PROTETOR SOLAR NIVEA', abrevs: ['PROT SOL NIVEA','PROTET NIVEA','PRT SL NIVEA'], un: 'UN', min: 24.99, max: 49.99 },
  ],
  padaria_congelados: [
    { desc: 'PAO FRANCES', abrevs: ['PAD FRAN','PAO FRANC','PAO FR'], un: 'KG', min: 14.90, max: 22.90 },
    { desc: 'PAO DE FORMA PULLMAN', abrevs: ['PAO FORM PULLM','PF PULLMAN','PAO PULLMAN'], un: 'UN', min: 6.99, max: 12.99 },
    { desc: 'BOLO CHOCOLATE ANA MARIA', abrevs: ['BOLO CHOC A MARIA','BOLO ANA MAR','BL CHOC ANAM'], un: 'UN', min: 3.99, max: 7.99 },
    { desc: 'PIZZA CONGELADA SADIA', abrevs: ['PIZZA CONG SAD','PIZZA SADIA','PZ CONG SAD'], un: 'UN', min: 12.99, max: 22.99 },
    { desc: 'HAMBURGUER SADIA', abrevs: ['HAMB SADIA','HAMBURG SAD','HMB SADIA'], un: 'UN', min: 8.99, max: 16.99 },
    { desc: 'SORVETE KIBON', abrevs: ['SORV KIBON','SORVETE KIB','SRV KIBON'], un: 'UN', min: 12.99, max: 24.99 },
    { desc: 'EMPANADO SADIA', abrevs: ['EMPAN SADIA','EMPANADO SAD','EMP SADIA'], un: 'UN', min: 9.99, max: 18.99 },
    { desc: 'LASANHA CONGELADA SADIA', abrevs: ['LASANHA SAD','LAS CONG SAD','LSNH SADIA'], un: 'UN', min: 11.99, max: 19.99 },
  ],
  ovos_temperos: [
    { desc: 'OVO BRANCO GRANDE', abrevs: ['OVO BRC GDE','OVO BRANCO GD','OVOS BRC GD'], un: 'UN', min: 9.99, max: 18.99 },
    { desc: 'OVO CAIPIRA', abrevs: ['OVO CAIPIRA','OVOS CAIP','OVO CAIP'], un: 'UN', min: 12.99, max: 22.99 },
    { desc: 'ALHO ROXO', abrevs: ['ALHO RX','ALHO ROXO','ALH ROXO'], un: 'KG', min: 19.90, max: 39.90 },
    { desc: 'TEMPERO SAZON', abrevs: ['TEMP SAZON','SAZON VD','TMP SAZON'], un: 'UN', min: 2.49, max: 4.99 },
    { desc: 'VINAGRE TOSCANO', abrevs: ['VINAGRE TOSC','VINAG TOSC','VNG TOSCANO'], un: 'UN', min: 3.49, max: 6.99 },
  ],
};

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function randPrice(min, max) {
  return parseFloat(rand(min, max).toFixed(2));
}

function formatPrice(v) {
  return v.toFixed(2).replace('.', ',');
}

function randQtdKg() {
  const qtds = [0.250, 0.300, 0.350, 0.400, 0.450, 0.500, 0.550, 0.600, 0.650,
    0.700, 0.750, 0.800, 0.850, 0.900, 0.950, 1.000, 1.100, 1.200, 1.250,
    1.300, 1.400, 1.500, 1.750, 2.000, 2.500, 3.000];
  return pick(qtds);
}

function randDate() {
  const y = pick([2024, 2025, 2026]);
  const m = randInt(1, 12);
  const d = randInt(1, 28);
  const h = randInt(7, 22);
  const min = randInt(0, 59);
  const s = randInt(0, 59);
  return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y} ${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function genCOO() { return String(randInt(100000, 999999)); }
function genECF() { return String(randInt(1, 999)).padStart(3, '0'); }
function genCCF() { return String(randInt(100000, 999999)); }
function genSATNum() { return Array.from({length: 44}, () => randInt(0,9)).join(''); }
function genChaveNFCe() { return Array.from({length: 44}, () => randInt(0,9)).join(''); }

function padRight(str, len) { return (str + ' '.repeat(len)).substring(0, len); }
function padLeft(str, len) { return (' '.repeat(len) + str).substring(str.length); }

// Gerar itens aleatórios para um cupom
function gerarItens(qtdItens) {
  const cats = Object.keys(PRODUTOS);
  const itens = [];
  const usados = new Set();

  for (let i = 0; i < qtdItens; i++) {
    const cat = pick(cats);
    const prodList = PRODUTOS[cat];
    let prod;
    let tentativas = 0;
    do {
      prod = pick(prodList);
      tentativas++;
    } while (usados.has(prod.desc) && tentativas < 20);
    usados.add(prod.desc);

    const abrev = pick(prod.abrevs);
    const precoUnit = randPrice(prod.min, prod.max);
    let qtd, total;

    if (prod.un === 'KG') {
      qtd = randQtdKg();
      total = parseFloat((qtd * precoUnit).toFixed(2));
    } else {
      qtd = randInt(1, 6);
      total = parseFloat((qtd * precoUnit).toFixed(2));
    }

    itens.push({
      seq: i + 1,
      desc: abrev,
      un: prod.un,
      qtd,
      precoUnit,
      total,
    });
  }
  return itens;
}

// =============================================
// FORMATOS DE CUPOM (geram texto plano)
// =============================================

function formatoSAT(loja, data, itens) {
  const W = 48; // largura padrão cupom SAT
  const lines = [];
  const center = (t) => {
    const pad = Math.max(0, Math.floor((W - t.length) / 2));
    return ' '.repeat(pad) + t;
  };
  const sep = '-'.repeat(W);
  const sepEq = '='.repeat(W);

  lines.push(center(loja.razao));
  lines.push(center(loja.end));
  lines.push(center(`${loja.bairro} - ${loja.cidade}-${loja.uf}`));
  lines.push(center(`CEP: ${loja.cep} Fone: ${loja.fone}`));
  lines.push(center(`CNPJ: ${loja.cnpj}`));
  lines.push(center(`IE: ${loja.ie}`));
  lines.push(sep);
  lines.push(center('EXTRATO No. ' + randInt(100000, 999999)));
  lines.push(center('CUPOM FISCAL ELETRONICO - SAT'));
  lines.push(sep);

  // Cabeçalho itens
  lines.push('#  COD   DESCRICAO');
  lines.push('   QTD UN   VL UNIT(R$)  ST  VL ITEM(R$)');
  lines.push(sep);

  let totalGeral = 0;
  itens.forEach((it) => {
    const cod = String(randInt(1000000, 9999999));
    const l1 = `${String(it.seq).padStart(3,'0')} ${cod} ${it.desc}`;
    lines.push(l1);
    
    const qtdStr = it.un === 'KG' ? it.qtd.toFixed(3).replace('.',',') : String(it.qtd);
    const tax = pick(['F1','I1','N1','T17,00%','T18,00%','F','I','N']);
    const l2 = `   ${qtdStr} ${it.un}  x ${formatPrice(it.precoUnit)}  ${tax}  ${formatPrice(it.total)}`;
    lines.push(l2);
    totalGeral += it.total;
  });

  lines.push(sep);
  
  // Subtotal
  lines.push(`  QTD. TOTAL DE ITENS                    ${itens.length}`);
  lines.push(`  VALOR TOTAL                     R$ ${formatPrice(totalGeral)}`);
  
  // Pagamento
  const pagamento = pick(['DINHEIRO','CARTAO CREDITO','CARTAO DEBITO','PIX','VALE REFEICAO']);
  lines.push(sep);
  lines.push(`  FORMA PAGAMENTO            VL PAGO R$`);
  
  if (pagamento === 'DINHEIRO') {
    const pago = Math.ceil(totalGeral / 10) * 10;
    const troco = parseFloat((pago - totalGeral).toFixed(2));
    lines.push(`  Dinheiro                       ${formatPrice(pago)}`);
    lines.push(`  TROCO                    R$    ${formatPrice(troco)}`);
  } else {
    lines.push(`  ${pagamento}                  ${formatPrice(totalGeral)}`);
  }

  lines.push(sep);
  lines.push(`  SAT No. ${genSATNum()}`);
  lines.push(`  ${data}`);
  lines.push(sep);

  return { lines, total: totalGeral, pagamento };
}

function formatoNFCe(loja, data, itens) {
  const W = 48;
  const lines = [];
  const center = (t) => {
    const pad = Math.max(0, Math.floor((W - t.length) / 2));
    return ' '.repeat(pad) + t;
  };
  const sep = '-'.repeat(W);

  lines.push(center(loja.nome));
  lines.push(center(loja.razao));
  lines.push(center(`CNPJ: ${loja.cnpj} IE: ${loja.ie}`));
  lines.push(center(loja.end));
  lines.push(center(`${loja.cidade}-${loja.uf} CEP:${loja.cep}`));
  lines.push(sep);
  lines.push(center('DANFE NFC-e - DOCUMENTO AUXILIAR'));
  lines.push(center('DA NOTA FISCAL ELETRONICA'));
  lines.push(center('PARA CONSUMIDOR'));
  lines.push(sep);
  
  // Cabeçalho
  lines.push('CODIGO  DESCRICAO      QTD  UN  VL.UN  TOTAL');
  lines.push(sep);

  let totalGeral = 0;
  itens.forEach((it) => {
    const cod = String(randInt(10000, 99999)).padStart(7, '0');
    const qtdStr = it.un === 'KG' ? it.qtd.toFixed(3).replace('.',',') : String(it.qtd).padStart(3,' ');
    const l = `${cod} ${padRight(it.desc, 14)} ${qtdStr} ${it.un} ${padLeft(formatPrice(it.precoUnit), 7)} ${padLeft(formatPrice(it.total), 8)}`;
    lines.push(l);
    totalGeral += it.total;
  });

  lines.push(sep);
  lines.push(`QTD. TOTAL DE ITENS                      ${itens.length}`);
  lines.push(`VALOR TOTAL R$                       ${formatPrice(totalGeral)}`);
  
  const desconto = pick([0, 0, 0, parseFloat(rand(1, totalGeral * 0.1).toFixed(2))]);
  if (desconto > 0) {
    lines.push(`DESCONTO R$                          ${formatPrice(desconto)}`);
    lines.push(`VALOR A PAGAR R$                     ${formatPrice(totalGeral - desconto)}`);
  }

  const pagamento = pick(['Dinheiro','Cartao de Credito','Cartao de Debito','PIX']);
  lines.push(sep);
  lines.push(`FORMA DE PAGAMENTO          VALOR PAGO`);
  lines.push(`${pagamento}                ${formatPrice(totalGeral - desconto)}`);
  lines.push(sep);
  lines.push(`NFC-e nro ${randInt(100, 9999)} Serie ${randInt(1,99)} ${data}`);
  lines.push(`Chave de Acesso:`);
  lines.push(genChaveNFCe());
  lines.push(`Protocolo de Autorizacao:`);
  lines.push(`${randInt(100000000,999999999)}${randInt(100000000,999999999)} ${data}`);
  lines.push(sep);
  lines.push(center('CONSUMIDOR NAO IDENTIFICADO'));

  return { lines, total: totalGeral - desconto, pagamento };
}

function formatoECF(loja, data, itens) {
  const W = 44;
  const lines = [];
  const center = (t) => {
    const pad = Math.max(0, Math.floor((W - t.length) / 2));
    return ' '.repeat(pad) + t;
  };
  const sep = '-'.repeat(W);

  lines.push(center(loja.razao));
  lines.push(center(`CNPJ ${loja.cnpj} IE ${loja.ie}`));
  lines.push(center(loja.end));
  lines.push(center(`${loja.cidade}-${loja.uf}`));
  lines.push(sep);
  lines.push(`CCF:${genCCF()} COO:${genCOO()}`);
  lines.push(center('CUPOM FISCAL'));
  lines.push(sep);
  lines.push('ITEM CODIGO  DESCRICAO');
  lines.push('      QTD.   UN  VL.UNIT.  VL.ITEM');
  lines.push(sep);

  let totalGeral = 0;
  itens.forEach((it) => {
    const cod = String(randInt(1000000, 9999999));
    const l1 = `${String(it.seq).padStart(3,'0')} ${cod} ${it.desc}`;
    lines.push(l1);
    const qtdStr = it.un === 'KG' ? it.qtd.toFixed(3).replace('.',',') : String(it.qtd).padStart(3,' ');
    const tax = pick(['F1','I1','N1','T','F','I']);
    lines.push(`     ${qtdStr}   ${it.un}  ${formatPrice(it.precoUnit)}  ${tax} ${formatPrice(it.total)}`);
    totalGeral += it.total;
  });

  lines.push(sep);
  lines.push(`TOTAL R$                    ${formatPrice(totalGeral)}`);
  
  const pagamento = pick(['Dinheiro','Credito','Debito','PIX']);
  lines.push(`${pagamento}               ${formatPrice(totalGeral)}`);
  lines.push(sep);
  lines.push(`${data}  ECF:${genECF()} CRO:${randInt(1,9999)}`);
  lines.push(`FAB: ${pick(['BEMATECH','EPSON','SWEDA','DARUMA'])}`);

  return { lines, total: totalGeral, pagamento };
}

function formatoSimples(loja, data, itens) {
  const W = 40;
  const lines = [];
  const center = (t) => {
    const pad = Math.max(0, Math.floor((W - t.length) / 2));
    return ' '.repeat(pad) + t;
  };
  const sep = '-'.repeat(W);

  lines.push(center(loja.nome));
  lines.push(center(`CNPJ: ${loja.cnpj}`));
  lines.push(center(loja.end));
  lines.push(center(`${loja.cidade}-${loja.uf}`));
  lines.push(center(`TEL: ${loja.fone}`));
  lines.push(sep);
  lines.push(center('CUPOM FISCAL'));
  lines.push(`DATA: ${data}`);
  lines.push(sep);

  let totalGeral = 0;
  itens.forEach((it) => {
    const qtdStr = it.un === 'KG' ? `${it.qtd.toFixed(3).replace('.',',')}KG` : `${it.qtd}UN`;
    const l = `${it.desc}`;
    lines.push(l);
    lines.push(`  ${qtdStr} x ${formatPrice(it.precoUnit)} = ${formatPrice(it.total)}`);
    totalGeral += it.total;
  });

  lines.push(sep);
  lines.push(`TOTAL: R$ ${formatPrice(totalGeral)}`);
  
  const pagamento = pick(['DINHEIRO','CREDITO','DEBITO','PIX']);
  lines.push(`PGTO: ${pagamento}`);
  lines.push(sep);
  lines.push(center('OBRIGADO PELA PREFERENCIA'));
  lines.push(center(loja.nome));

  return { lines, total: totalGeral, pagamento };
}

// =============================================
// GERAÇÃO DO PDF
// =============================================

function gerarPDF(index) {
  return new Promise((resolve) => {
    const loja = LOJAS[index % LOJAS.length];
    const data = randDate();
    const qtdItens = randInt(4, 25);
    const itens = gerarItens(qtdItens);
    
    // Alternar formato
    const formatos = [formatoSAT, formatoNFCe, formatoECF, formatoSimples];
    const fmt = formatos[index % formatos.length];
    const { lines, total, pagamento } = fmt(loja, data, itens);

    // Criar PDF com fonte monospace (simula impressora térmica)
    const doc = new PDFDocument({
      size: [226.77, lines.length * 11 + 80], // ~80mm de largura
      margins: { top: 15, bottom: 15, left: 10, right: 10 },
    });

    const filename = `cupom_${String(index + 1).padStart(3, '0')}.pdf`;
    const filepath = path.join(OUTPUT_DIR, filename);
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Fonte monospace para simular impressora térmica
    doc.font('Courier');
    doc.fontSize(7);

    let y = 15;
    lines.forEach((line) => {
      doc.text(line, 10, y, { width: 206 });
      y += 10;
    });

    doc.end();
    stream.on('finish', () => {
      resolve({ filename, filepath, loja: loja.nome, total, itens: qtdItens, pagamento, data });
    });
  });
}

// =============================================
// MAIN
// =============================================

async function main() {
  console.log('='.repeat(50));
  console.log('  GERADOR DE PDFs - TREINAMENTO EXTRACTLAB');
  console.log('='.repeat(50));
  console.log(`\nGerando ${TOTAL_CUPONS} cupons em PDF...\n`);

  // Criar diretório
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const resultados = [];
  for (let i = 0; i < TOTAL_CUPONS; i++) {
    const r = await gerarPDF(i);
    resultados.push(r);
    process.stdout.write(`  [${i + 1}/${TOTAL_CUPONS}] ${r.filename} - ${r.loja} (${r.itens} itens, R$ ${formatPrice(r.total)})\n`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`  ✅ ${TOTAL_CUPONS} PDFs gerados em: ${OUTPUT_DIR}`);
  console.log('='.repeat(50));

  // Relatório
  console.log('\n📊 RESUMO:');
  console.log(`  Formatos: SAT, NFC-e, ECF, Simples`);
  console.log(`  Lojas: ${new Set(resultados.map(r => r.loja)).size} diferentes`);
  console.log(`  Total de itens: ${resultados.reduce((s, r) => s + r.itens, 0)}`);
  console.log(`  Valor médio: R$ ${formatPrice(resultados.reduce((s, r) => s + r.total, 0) / TOTAL_CUPONS)}`);
  
  console.log('\n📂 PRÓXIMO PASSO:');
  console.log(`  1. Abra: https://extractlab.com.br/Model/Create`);
  console.log(`  2. Crie modelo "Cupom Mercado" (ou qualquer nome)`);
  console.log(`  3. Faça upload dos ${TOTAL_CUPONS} PDFs da pasta: ${OUTPUT_DIR}`);
  console.log(`  4. Anote os campos em cada documento`);
  console.log(`  5. Treine o modelo\n`);
}

main().catch(console.error);
