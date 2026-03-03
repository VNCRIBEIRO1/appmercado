const puppeteer = require('puppeteer');
const path = require('path');

// =============================================
// MEGA GERADOR DE CUPONS FISCAIS - 100+ cupons
// Baseado em cupons REAIS brasileiros
// Com abreviações reais de mercado
// =============================================

// ---- LOJAS (30 lojas variadas) ----
const STORES = [
  { name:'MINIMERCADO DA PANDIA', addr:'RUA PANDIA CALOGERAS, 710 BAIRRO SARANDI', city:'PORTO ALEGRE - RS', cnpj:'90.369.075/0001-37', ie:'096/0828125', fone:'51 3364-1638' },
  { name:'SUPERMERCADO EXTRA HIPERMERCADO', addr:'AV. GIOVANNI GRONCHI, 5819 MORUMBI', city:'SAO PAULO - SP', cnpj:'47.508.411/0157-32', ie:'562.377.112.117', fone:'11 3741-2000' },
  { name:'CARREFOUR COM IND LTDA', addr:'ROD. RAPOSO TAVARES, KM 14,5', city:'SAO PAULO - SP', cnpj:'45.543.915/0329-81', ie:'636.092.344.118', fone:'11 3004-2222' },
  { name:'SENDAS DISTRIB S.A.', addr:'AV. ARICANDUVA, 5555 ARICANDUVA', city:'SAO PAULO - SP', cnpj:'03.258.372/0100-43', ie:'112.654.998.001', fone:'11 3003-5000' },
  { name:'CIA BRAS DE DISTRIBUICAO', addr:'R. TEODORO SAMPAIO, 1840 PINHEIROS', city:'SAO PAULO - SP', cnpj:'47.508.411/0220-56', ie:'562.377.115.998', fone:'11 3055-6000' },
  { name:'COOP COOP DE CONSUMO', addr:'AV. KENNEDY, 1500 CENTRO', city:'SANTO ANDRE - SP', cnpj:'57.500.725/0032-12', ie:'645.012.890.115', fone:'11 4437-1234' },
  { name:'DIA BRASIL SOC LTDA', addr:'R. AMADOR BUENO, 333 SANTO AMARO', city:'SAO PAULO - SP', cnpj:'03.476.811/0188-67', ie:'149.300.715.110', fone:'11 3004-4444' },
  { name:'SONDA SUPERMERCADOS LTDA', addr:'AV. CUPECE, 4100 JABAQUARA', city:'SAO PAULO - SP', cnpj:'62.809.834/0099-41', ie:'335.720.812.990', fone:'11 5588-9900' },
  { name:'ATACADAO S.A.', addr:'AV. BANDEIRANTES, 3900', city:'RIBEIRAO PRETO - SP', cnpj:'75.315.333/0219-55', ie:'790.200.445.112', fone:'16 3965-1000' },
  { name:'SUPERM GUANABARA LTDA', addr:'R. SENADOR BERNARDO, 55 CENTRO', city:'RIO DE JANEIRO - RJ', cnpj:'33.223.841/0001-12', ie:'85.044.129', fone:'21 2509-6000' },
  { name:'PREZUNIC COM LTDA', addr:'AV. BRASIL, 13155 PENHA', city:'RIO DE JANEIRO - RJ', cnpj:'30.200.208/0072-44', ie:'86.110.055', fone:'21 2561-3000' },
  { name:'SUPERM MUNDIAL LTDA', addr:'R. MARECHAL FLORIANO, 80 CENTRO', city:'RIO DE JANEIRO - RJ', cnpj:'27.113.309/0001-90', ie:'77.082.193', fone:'21 2263-8000' },
  { name:'DROGARIAS PACHECO S/A', addr:'RUA URUGUAIANA, 27/29 CENTRO', city:'RIO DE JANEIRO - RJ', cnpj:'33.438.250/0085-75', ie:'85.439.669', fone:'21 2224-5500' },
  { name:'MERCADINHO BOM PRECO', addr:'R. JOSE BONIFACIO, 240 CENTRO', city:'FORTALEZA - CE', cnpj:'12.654.890/0001-33', ie:'06.012.887-0', fone:'85 3252-1100' },
  { name:'SUPERM MATEUS LTDA', addr:'AV. JERONIMO DE ALBUQUERQUE, 1000', city:'SAO LUIS - MA', cnpj:'03.649.181/0001-89', ie:'12.356.790-7', fone:'98 3878-1000' },
  { name:'SUPERM BIG BOM LTDA', addr:'R. XV DE NOVEMBRO, 890 CENTRO', city:'CURITIBA - PR', cnpj:'76.430.322/0091-18', ie:'101.987.445-33', fone:'41 3322-8900' },
  { name:'ANGELONI & CIA LTDA', addr:'R. FELIPE SCHMIDT, 515 CENTRO', city:'FLORIANOPOLIS - SC', cnpj:'83.646.984/0032-44', ie:'254.812.009', fone:'48 3224-5000' },
  { name:'ZAFFARI COM LTDA', addr:'AV. NILO PECANHA, 2750 BELA VISTA', city:'PORTO ALEGRE - RS', cnpj:'87.654.321/0088-99', ie:'096/1234567', fone:'51 3378-5000' },
  { name:'FORT ATACADISTA LTDA', addr:'ROD. SC 401, KM 5 SACO GRANDE', city:'FLORIANOPOLIS - SC', cnpj:'04.159.433/0015-67', ie:'257.300.112', fone:'48 3879-5000' },
  { name:'BRETAS SUPERM LTDA', addr:'AV. AMAZONAS, 6200 GAMELEIRA', city:'BELO HORIZONTE - MG', cnpj:'16.403.724/0056-11', ie:'062.578.449.0044', fone:'31 3379-8000' },
  { name:'VERDEMAR SUPERM LTDA', addr:'R. LEVINDO LOPES, 251 SAVASSI', city:'BELO HORIZONTE - MG', cnpj:'17.255.689/0001-92', ie:'062.120.339.0012', fone:'31 3227-7000' },
  { name:'LARA ACESSORIOS EIRELI ME', addr:'AV. CRISTOVAO COLOMBO, 67 SAVASSI', city:'BELO HORIZONTE - MG', cnpj:'28.663.093/0001-53', ie:'003.044314.0006', fone:'31 3261-4500' },
  { name:'SUPERM SAO JORGE LTDA', addr:'R. DOUTOR MOURA RIBEIRO, 33', city:'CAMPINAS - SP', cnpj:'44.012.556/0001-77', ie:'244.087.119.112', fone:'19 3234-5600' },
  { name:'SAVEGNAGO SUPERM LTDA', addr:'AV. PRES. VARGAS, 1555 CENTRO', city:'RIBEIRAO PRETO - SP', cnpj:'56.884.373/0012-89', ie:'580.100.667.115', fone:'16 3610-4000' },
  { name:'SUPERM IMPERATRIZ LTDA', addr:'R. MARECHAL DEODORO, 580', city:'JOINVILLE - SC', cnpj:'84.430.222/0010-55', ie:'253.090.119', fone:'47 3433-9000' },
  { name:'MUFFATO & CIA LTDA', addr:'AV. VICTOR F AMARAL, 2200', city:'CURITIBA - PR', cnpj:'77.813.910/0055-01', ie:'101.522.009-90', fone:'41 3019-1000' },
  { name:'PAGUE MENOS S.A.', addr:'R. SENADOR POMPEU, 1520 CENTRO', city:'FORTALEZA - CE', cnpj:'06.626.253/0001-51', ie:'06.000.289-0', fone:'85 3255-7000' },
  { name:'COMERCIAL ZARAGOZA LTDA', addr:'R. AURORA, 229 CENTRO', city:'SAO PAULO - SP', cnpj:'61.084.502/0001-04', ie:'108.033.795.116', fone:'11 3331-0000' },
  { name:'IRMÃOS MUFFATO CIA LTDA', addr:'R. VISCONDE NACAR, 1280', city:'CURITIBA - PR', cnpj:'04.711.430/0092-33', ie:'902.33448-81', fone:'41 3340-2500' },
  { name:'CONDOR SUPER CENTER LTDA', addr:'AV. PRES. KENNEDY, 4455', city:'CURITIBA - PR', cnpj:'76.430.433/0150-22', ie:'101.098.788-20', fone:'41 3371-8000' },
];

// ---- PRODUTOS COM ABREVIAÇÕES REAIS (500+) ----
const ITEMS = [
  // FRUTAS/VERDURAS/LEGUMES (KG)
  {n:'BANANA PRATA',a:['BANANA PR','BAN PRATA','BANANA PRT'],u:'kg',p:[3.99,8.99]},
  {n:'BANANA NANICA',a:['BAN NANICA','BANANA NAN','BAN NAN'],u:'kg',p:[2.99,6.99]},
  {n:'MACA FUJI',a:['MACA FJ','MACA FUJI KG','MCA FUJI'],u:'kg',p:[8.99,16.99]},
  {n:'MACA GALA',a:['MACA GL','MCA GALA','MACA GALA KG'],u:'kg',p:[9.99,17.99]},
  {n:'LARANJA PERA',a:['LAR PERA','LARANJA PR','LAR P'],u:'kg',p:[3.49,7.99]},
  {n:'LARANJA LIMA',a:['LAR LIMA','LARANJA LM'],u:'kg',p:[4.99,9.99]},
  {n:'TOMATE LONGA VIDA',a:['TOMATE L','TOM LONGA V','TOMATE LV','TOM LG VIDA'],u:'kg',p:[5.99,12.99]},
  {n:'TOMATE ITALIANO',a:['TOM ITAL','TOMATE IT','TOM ITALIANO'],u:'kg',p:[6.99,14.99]},
  {n:'BATATA LAVADA',a:['BAT LAVADA','BATATA LAV','BAT LAV'],u:'kg',p:[3.99,8.99]},
  {n:'CEBOLA AMARELA',a:['CEBOLA A','CEB AMAR','CEBOLA AM'],u:'kg',p:[3.49,7.99]},
  {n:'CEBOLA ROXA',a:['CEBOLA RX','CEB ROXA'],u:'kg',p:[5.99,11.99]},
  {n:'ALFACE CRESPA',a:['ALFACE CR','ALF CRESPA'],u:'un',p:[2.49,5.99]},
  {n:'ALFACE AMERICANA',a:['ALF AMERIC','ALFACE AM'],u:'un',p:[3.99,7.49]},
  {n:'CENOURA',a:['CENOURA','CENOURA KG'],u:'kg',p:[4.49,9.99]},
  {n:'MAMAO PAPAIA',a:['MAMAO PAP','MAM PAPAIA','MAMAO P'],u:'kg',p:[5.99,12.99]},
  {n:'MAMAO FORMOSA',a:['MAM FORMOSA','MAMAO FORM','MAM FORM'],u:'kg',p:[3.99,8.99]},
  {n:'MELANCIA',a:['MELANCIA','MELANCIA KG'],u:'kg',p:[2.49,5.99]},
  {n:'MELAO AMARELO',a:['MELAO AM','MEL AMAR','MELAO A'],u:'kg',p:[4.99,9.99]},
  {n:'UVA ITALIA',a:['UVA IT','UVA ITALIA'],u:'kg',p:[9.99,19.99]},
  {n:'UVA THOMPSON',a:['UVA THOMPS','UVA THOMP'],u:'kg',p:[12.99,22.99]},
  {n:'ABACAXI PEROLA',a:['ABAC PEROLA','ABACAXI P'],u:'un',p:[4.99,10.99]},
  {n:'LIMAO TAHITI',a:['LIMAO TAH','LIM TAHITI','LIMAO T'],u:'kg',p:[4.99,12.99]},
  {n:'MANGA TOMMY',a:['MANGA TOM','MNG TOMMY'],u:'kg',p:[5.99,11.99]},
  {n:'MORANGO BAND',a:['MORANGO BD','MORNGO BAN'],u:'un',p:[6.99,14.99]},
  {n:'ABOBORA CABOTIA',a:['ABOB CABOT','ABOBORA CB'],u:'kg',p:[3.99,7.99]},
  {n:'PEPINO JAPONES',a:['PEPINO JAP','PEP JAPON'],u:'kg',p:[5.99,11.99]},
  {n:'PIMENTAO VERDE',a:['PIMENT VD','PIM VERDE'],u:'kg',p:[6.99,14.99]},
  {n:'BROCOLIS NINJA',a:['BROC NINJA','BROCOLIS N'],u:'un',p:[4.99,9.99]},
  {n:'COUVE FOLHA',a:['COUVE FL','COUVE FOLH'],u:'un',p:[1.99,4.99]},
  {n:'REPOLHO VERDE',a:['REPOLHO VD','REP VERDE'],u:'kg',p:[2.99,6.99]},
  {n:'CHUCHU',a:['CHUCHU','CHUCHU KG'],u:'kg',p:[3.99,7.99]},
  {n:'BERINJELA',a:['BERINJ','BERINJELA'],u:'kg',p:[5.99,10.99]},
  {n:'ABOBRINHA ITAL',a:['ABOB ITAL','ABOBRINHA I'],u:'kg',p:[4.99,9.99]},
  // CARNES / FRIOS
  {n:'PEITO FRANGO CONG',a:['PTO FRANG CG','PEITO FRG CG','PTO FRGO CONG','PT FRANGO CON'],u:'kg',p:[12.99,22.99]},
  {n:'COXA SOBRECOXA FRG',a:['CX SOBREC FRG','COXA SBCX','CX SBCX FRANG','COXA S FRG'],u:'kg',p:[9.99,17.99]},
  {n:'ASA DE FRANGO',a:['ASA FRANGO','ASA FRG','ASA D FRANGO'],u:'kg',p:[8.99,15.99]},
  {n:'CARNE MOIDA PATINHO',a:['CRN MOIDA PAT','CARNE M PATINH','CRN MOI PAT'],u:'kg',p:[27.99,44.99]},
  {n:'CARNE MOIDA ACOUGUE',a:['CRN MOIDA AC','CARNE M ACOU','CRN MOIDA ACG'],u:'kg',p:[22.99,34.99]},
  {n:'ALCATRA BOVINA',a:['ALCATRA BOV','ALCAT BOV','ALCATRA B'],u:'kg',p:[39.99,62.99]},
  {n:'COSTELA BOVINA',a:['COSTELA BOV','COST BOV','COSTELA B'],u:'kg',p:[24.99,39.99]},
  {n:'COXAO MOLE BOV',a:['COXAO ML','COXAO MOLE','CX MOLE BOV'],u:'kg',p:[34.99,52.99]},
  {n:'COXAO DURO BOV',a:['COXAO DR','COXAO DURO','CX DURO BOV','COXAO D'],u:'kg',p:[29.99,46.99]},
  {n:'MAMINHA BOV',a:['MAMINHA','MAMINHA BOV','MAM BOV'],u:'kg',p:[44.99,69.99]},
  {n:'PICANHA BOV',a:['PICANHA','PICANHA BOV','PIC BOV'],u:'kg',p:[59.99,99.99]},
  {n:'ACÉM BOVINO',a:['ACEM BOV','ACEM','ACEM BOVINO'],u:'kg',p:[24.99,37.99]},
  {n:'LINGUICA TOSCANA',a:['LING TOSC','LINGUICA TSC','LING TOSCANA','LG TOSC'],u:'kg',p:[17.99,29.99]},
  {n:'LINGUICA CALABRESA',a:['LING CALAB','LINGUICA CL','LING CALABR'],u:'kg',p:[19.99,34.99]},
  {n:'SALSICHA HOTDOG',a:['SALSICHA HD','SALSICHA HOT','SALSCH HD 500G'],u:'un',p:[5.49,11.99]},
  {n:'BACON FATIADO',a:['BACON FAT','BCN FATIADO','BACON F 250G'],u:'un',p:[9.99,18.99]},
  {n:'PRESUNTO SADIA',a:['PRES SADIA','PRESUNTO SAD','PRES SAD'],u:'kg',p:[22.99,39.99]},
  {n:'PRESUNTO PERDIGAO',a:['PRES PERDIG','PRESUNTO PD','PRES PERD'],u:'kg',p:[21.99,36.99]},
  {n:'MORTADELA BOLOGNA',a:['MORTAD BOLOG','MORTA BOLOGNA','MORT BOL'],u:'kg',p:[11.99,22.99]},
  {n:'PEITO PERU SADIA',a:['PTO PERU SAD','PEITO P SADIA','PT PERU SAD'],u:'kg',p:[34.99,54.99]},
  {n:'SALAME ITALIANO',a:['SALAME IT','SALAME ITAL','SAL ITALIANO'],u:'kg',p:[44.99,69.99]},
  {n:'PATE EXCELSIOR PRESUNTO',a:['PATE EXCEL PRES','PATE EXCELSI P','PATE EXCELS PR','PT EXCELS PRES'],u:'un',p:[1.49,3.99]},
  {n:'PATE EXCELSIOR GALINHA',a:['PATE EXCEL GAL','PATE EXCELS GL','PT EXCELS GAL'],u:'un',p:[1.49,3.99]},
  // LATICÍNIOS
  {n:'LEITE INTEGRAL ITALAC 1L',a:['LT INTEG ITALAC','LEITE I ITALAC','LT INT ITALAC 1L'],u:'un',p:[4.49,6.99]},
  {n:'LEITE INTEGRAL PARMALAT 1L',a:['LT INT PARMAL','LEITE I PARMAL','LT INTEG PARMAL'],u:'un',p:[4.99,7.49]},
  {n:'LEITE DESNAT ELEGÊ 1L',a:['LT DESN ELEGE','LEITE D ELEGE','LT DSN ELEGE'],u:'un',p:[4.99,7.49]},
  {n:'LEITE SEMIDESN PIRACANJ',a:['LT SEMI PIRAC','LEITE SD PIRAC'],u:'un',p:[4.49,6.99]},
  {n:'QUEIJO MUSSARELA',a:['QUEIJO M','QJ MUSSARELA','QUEIJO MUSS','QJ MUSSA'],u:'kg',p:[32.99,52.99]},
  {n:'QUEIJO PRATO',a:['QUEIJO PR','QJ PRATO','QUEIJO PRAT'],u:'kg',p:[36.99,56.99]},
  {n:'QUEIJO MINAS FRESCAL',a:['QJ MIN FRESC','QUEIJO MN FR','QJ MINAS F'],u:'un',p:[9.99,19.99]},
  {n:'QUEIJO COALHO',a:['QJ COALHO','QUEIJO COALH'],u:'un',p:[12.99,22.99]},
  {n:'REQUEIJAO CATUPIRY 200G',a:['REQJ CATUPIRY','REQ CATUPY 200','REQJ CATUP 200G'],u:'un',p:[7.49,13.99]},
  {n:'REQUEIJAO POLENGHI 200G',a:['REQJ POLENGHI','REQ POLENG 200','REQJ POLG 200G'],u:'un',p:[6.99,12.99]},
  {n:'IOGURTE NATURAL NESTLE',a:['IOG NAT NESTLE','IOGUR N NESTL','IOG NATUR NEST'],u:'un',p:[3.99,7.99]},
  {n:'IOGURTE DANONE MORANGO',a:['IOG DANONE MOR','IOGUR DAN MOR','IOG DAN MORANG'],u:'un',p:[3.49,6.99]},
  {n:'IOGURTE ACTIVIA AMEIXA',a:['IOG ACTIV AMEIX','IOGUR ACTIV AM'],u:'un',p:[4.49,8.49]},
  {n:'MANTEIGA AVIACAO 200G',a:['MANT AVIACAO','MANTG AVIAC 200','MANT AVIAC 200G'],u:'un',p:[8.99,15.99]},
  {n:'MANTEIGA PRESIDENTE 200G',a:['MANT PRESID','MANTG PRES 200','MANT PRES 200G'],u:'un',p:[7.99,13.99]},
  {n:'MARGARINA QUALY 500G',a:['MARG QUALY','MARGR QUALY 500','MARG QUAL 500G'],u:'un',p:[6.49,10.99]},
  {n:'CREME DE LEITE NESTLE 200G',a:['CR LEITE NESTL','CRM LT NESTLE','CR LT NEST 200'],u:'un',p:[3.29,5.99]},
  {n:'LEITE CONDENSADO MOCA 395G',a:['LT COND MOCA','LEITE C MOCA','LT CONDEN MOCA','L COND MOCA 395'],u:'un',p:[5.99,9.99]},
  {n:'CREAM CHEESE PHILADELPH',a:['CREAM CH PHIL','CR CHEESE PHIL','CRM CHS PHILA'],u:'un',p:[7.99,14.99]},
  {n:'CHOC LEITE LACTA',a:['CHOC LT LACTA','CHOC LEITE LCT','CHOC L LACTA'],u:'un',p:[6.99,12.99]},
  {n:'CHOC LEITE NESTLE',a:['CHOC LT NESTL','CHOC LEITE NST','CHOC L NESTLE'],u:'un',p:[5.99,11.99]},
  {n:'CHOC AO LEITE GAROTO',a:['CHOC AL GAROTO','CHOC LT GAROT','CHOC GAROTO'],u:'un',p:[5.49,10.99]},
  {n:'CHOC KINDER OVO MENINO',a:['CHOC KINDER OVO MENI','CHOC KIND OVO MN','KINDER OVO MEN'],u:'un',p:[4.99,8.99]},
  {n:'CHOC KINDER OVO MENINA',a:['CHOC KINDER OVO MENA','CHOC KIND OVO MNA','KINDER OVO MENA'],u:'un',p:[4.99,8.99]},
  {n:'CHOC LEITE MM SINGLE',a:['CHOC LEITE MM SINGLE','CHOC LT MM SINGL','CHOC MM SINGLE'],u:'un',p:[1.49,3.49]},
  {n:'CHOC TWIX',a:['CHOC TWIX','CHOC TWIX CARAMEL'],u:'un',p:[2.99,5.99]},
  {n:'CHOC SNICKERS',a:['CHOC SNICKERS','CHOC SNICK'],u:'un',p:[2.99,5.99]},
  {n:'CHOC LACTA SONHO VALSA',a:['CHOC SONHO VALSA','CHOC SN VALSA','SONHO VALSA'],u:'un',p:[1.99,4.49]},
  // MERCEARIA / SECOS
  {n:'ARROZ TIPO 1 CAMIL 5KG',a:['ARR T1 CAMIL 5K','ARROZ CAMIL 5KG','ARR CAMIL T1 5'],u:'un',p:[18.99,29.99]},
  {n:'ARROZ TIPO 1 TIO JOAO 5KG',a:['ARR T JOAO 5KG','ARROZ TJ 5KG','ARR TIO JOAO 5'],u:'un',p:[21.99,32.99]},
  {n:'ARROZ INTEGRAL CAMIL 1KG',a:['ARR INTEG CAMIL','ARROZ INT CAM 1','ARR INT CAMIL'],u:'un',p:[6.99,11.99]},
  {n:'FEIJAO CARIOCA CAMIL 1KG',a:['FJ CARIOCA CAMIL','FEIJ CAR CAMIL','FJ CAR CAMIL 1K'],u:'un',p:[6.49,11.99]},
  {n:'FEIJAO PRETO CAMIL 1KG',a:['FJ PRETO CAMIL','FEIJ PT CAMIL','FJ PRT CAMIL 1K'],u:'un',p:[6.99,12.99]},
  {n:'ACUCAR CRISTAL UNIAO 1KG',a:['ACUC CRIST UNIAO','ACUCAR UNIAO','ACUC UNIAO 1KG'],u:'un',p:[3.99,6.99]},
  {n:'ACUCAR REFINADO UNIAO 1KG',a:['ACUC REF UNIAO','ACUCAR R UNIAO','ACUC REFIN UNIAO'],u:'un',p:[4.49,7.49]},
  {n:'CAFE PILAO 500G',a:['CAFE PILAO 500','CAFE PIL 500G','CF PILAO 500'],u:'un',p:[14.99,24.99]},
  {n:'CAFE MELITTA 500G',a:['CAFE MELITTA','CAFE MEL 500G','CF MELITTA 500'],u:'un',p:[15.99,25.99]},
  {n:'CAFE 3 CORACOES 500G',a:['CAFE 3 CORAC','CAFE 3COR 500','CF 3 CORAC 500'],u:'un',p:[13.99,22.99]},
  {n:'OLEO SOJA LIZA 900ML',a:['OLEO LIZA 900','OL SOJA LIZA','OLEO LZ 900ML'],u:'un',p:[5.49,9.49]},
  {n:'OLEO SOJA SOYA 900ML',a:['OLEO SOYA 900','OL SOJA SOYA','OLEO SY 900ML'],u:'un',p:[5.49,8.99]},
  {n:'MACARRAO ESPAG BARILLA 500G',a:['MAC ESP BARILLA','MACARR BARIL 500','MAC BARILLA ESP'],u:'un',p:[4.49,8.99]},
  {n:'MACARRAO ESPAG RENATA 500G',a:['MAC ESP RENATA','MACARR RENAT 500','MAC RENATA ESP'],u:'un',p:[3.49,6.99]},
  {n:'MACARRAO PENNE BARILLA 500G',a:['MAC PENNE BARIL','MACARR PEN BAR','MAC BAR PENNE'],u:'un',p:[5.49,9.99]},
  {n:'MACARRAO INSTANT NISSIN',a:['MAC INST NISSIN','MIOJO NISSIN','MAC NISSIN'],u:'un',p:[1.49,3.49]},
  {n:'MOLHO TOMATE POMAROLA 340G',a:['MLH TOM POMAR','MOLHO POMAROL','MLH POMAROLA'],u:'un',p:[3.29,5.99]},
  {n:'MOLHO TOMATE HEINZ 340G',a:['MLH TOM HEINZ','MOLHO HEINZ','MLH HEINZ 340'],u:'un',p:[4.49,7.99]},
  {n:'EXTRATO TOMATE ELEFANTE',a:['EXT TOM ELEFANT','EXTR ELEFANTE','EXT ELEF 340G'],u:'un',p:[3.99,6.99]},
  {n:'SAL REFINADO CISNE 1KG',a:['SAL CISNE 1KG','SAL REF CISNE','SAL CISNE'],u:'un',p:[2.29,4.49]},
  {n:'FARINHA TRIGO DONA BENTA 1KG',a:['FAR TRIG D BENTA','FARINHA DB 1KG','FAR D BENTA 1K'],u:'un',p:[4.49,7.99]},
  {n:'FARINHA MANDIOCA YOKI 500G',a:['FAR MAND YOKI','FARINH YOKI 500','FAR MAND YK 500'],u:'un',p:[4.99,8.49]},
  {n:'AZEITE EV GALLO 500ML',a:['AZEIT GALLO 500','AZEITE EV GALL','AZT GALLO 500'],u:'un',p:[22.99,39.99]},
  {n:'AZEITE EV ANDORINHA 500ML',a:['AZEIT ANDORIN','AZEITE ANDOR 500','AZT ANDORINHA'],u:'un',p:[24.99,42.99]},
  {n:'VINAGRE MAÇA CASTELO 750ML',a:['VINAG CASTELO','VINAGRE CAST 750','VNG CAST 750ML'],u:'un',p:[4.49,7.99]},
  {n:'ACHOCOLAT NESCAU 400G',a:['ACHOC NESCAU 400','NESCAU 400G','ACHOC NESC 400'],u:'un',p:[8.49,14.99]},
  {n:'ACHOCOLAT TODDY 400G',a:['ACHOC TODDY 400','TODDY 400G','ACHOC TODD 400'],u:'un',p:[7.99,13.99]},
  {n:'AVEIA QUAKER 200G',a:['AVEIA QUAKER','AVEIA QKR 200G'],u:'un',p:[3.99,6.99]},
  {n:'GRANOLA KOBBER 250G',a:['GRANOLA KOBB','GRAN KOBBER 250'],u:'un',p:[8.99,14.99]},
  {n:'CEREAL SUCRILHOS KELLOGG',a:['CER SUCRILH KELL','SUCRILHOS KEL','CER SUCRILH'],u:'un',p:[9.99,16.99]},
  {n:'MILHO VERDE QUERO 200G',a:['MILHO VD QUERO','MILHO QUERO 200','MLH VD QRO 200'],u:'un',p:[2.99,5.49]},
  {n:'ERVILHA QUERO 200G',a:['ERVILHA QUERO','ERVLHA QRO 200','ERV QUERO 200'],u:'un',p:[2.99,5.49]},
  {n:'SARDINHA COQUEIRO',a:['SARD COQUEIRO','SARDINHA COQ','SARD COQ 125G'],u:'un',p:[4.99,8.99]},
  {n:'ATUM COQUEIRO',a:['ATUM COQUEIRO','ATUM COQ 170G','ATUM COQUEIR'],u:'un',p:[6.99,12.99]},
  // BEBIDAS
  {n:'COCA COLA 2L',a:['COCA COLA 2L','COCA 2L','CC 2 LTS'],u:'un',p:[8.49,12.99]},
  {n:'COCA COLA LATA 350ML',a:['COCA LT 350ML','CC LATA 350','COCA COLA LT'],u:'un',p:[3.49,5.99]},
  {n:'COCA COLA ZERO 2L',a:['CC ZERO 2L','COCA ZERO 2L','COCA C ZERO 2'],u:'un',p:[8.49,12.99]},
  {n:'GUARANA ANTARC 2L',a:['GUAR ANTARC 2L','GUARANA ANT 2L','GRN ANTARC 2'],u:'un',p:[6.99,10.99]},
  {n:'GUARANA ANTARC LATA',a:['GUAR ANT LT 350','GUARANA A LATA','GRN ANT LATA'],u:'un',p:[2.99,5.49]},
  {n:'FANTA LARANJA 2L',a:['FANTA LAR 2L','FANTA LRJ 2L','FNT LAR 2L'],u:'un',p:[7.49,10.99]},
  {n:'SPRITE 2L',a:['SPRITE 2L','SPRT 2L'],u:'un',p:[7.49,10.99]},
  {n:'SUCO DEL VALLE 1L',a:['SU DEL VALLE 1L','SUCO DV 1L','SU D VALLE 1L'],u:'un',p:[5.99,9.99]},
  {n:'SUCO TANG LARANJA',a:['SUCO TANG LAR','TANG LARANJA','TANG LAR'],u:'un',p:[0.99,2.49]},
  {n:'SUCO TANG UVA',a:['SUCO TANG UVA','TANG UVA'],u:'un',p:[0.99,2.49]},
  {n:'AGUA MINERAL CRYSTAL 1,5L',a:['AGUA CRYST 1,5L','AG MIN CRYST','AGUA CRYSTAL'],u:'un',p:[2.29,4.49]},
  {n:'AGUA MIN S GAS MINALBA 500ML',a:['AGUA MINALBA','AG MIN MINALB','AGUA MNLB 500'],u:'un',p:[1.49,3.49]},
  {n:'CERVEJA BRAHMA LATA 350ML',a:['CERV BRAHMA LT','BRAHMA LT 350','CRV BRAHMA LT'],u:'un',p:[2.99,5.49]},
  {n:'CERVEJA SKOL LATA 350ML',a:['CERV SKOL LT','SKOL LT 350','CRV SKOL LT'],u:'un',p:[2.79,5.29]},
  {n:'CERVEJA HEINEKEN 600ML',a:['CERV HEINEK 600','HEINEKEN 600','CRV HEINEK LN'],u:'un',p:[8.99,14.99]},
  {n:'CERVEJA ANTARC ORIG 600ML',a:['CERV ANT ORIG','ANTARC ORIG 600','CRV ANT ORIG'],u:'un',p:[6.99,10.99]},
  {n:'CERVEJA AMSTEL LATA 350ML',a:['CERV AMSTEL LT','AMSTEL LT 350','CRV AMSTEL'],u:'un',p:[2.99,5.49]},
  {n:'ENERGETICO RED BULL 250ML',a:['ENERG RED BULL','RED BULL 250','REDBULL 250ML'],u:'un',p:[8.99,14.99]},
  {n:'ENERGETICO MONSTER 473ML',a:['ENERG MONSTER','MONSTER 473ML','ENRG MONST 473'],u:'un',p:[7.99,12.99]},
  // LIMPEZA
  {n:'DETERGENTE LIMPOL 500ML',a:['DET LIMPOL 500','DETERG LIMPOL','DET LIMP 500ML'],u:'un',p:[2.29,4.49]},
  {n:'DETERGENTE YPE 500ML',a:['DET YPE 500ML','DETERG YPE','DET YPE 500'],u:'un',p:[2.19,4.29]},
  {n:'SABAO PO OMO 800G',a:['SB PO OMO 800','SABAO OMO 800G','SB OMO 800G'],u:'un',p:[11.99,19.99]},
  {n:'SABAO PO ACE 800G',a:['SB PO ACE 800','SABAO ACE 800G','SB ACE 800G'],u:'un',p:[10.99,17.99]},
  {n:'SABAO PO SURF 800G',a:['SB PO SURF 800','SABAO SURF','SB SURF 800G'],u:'un',p:[7.99,13.99]},
  {n:'SABAO BARRA BIOBRILHO',a:['SB BARRA BIOBR','SABAO BR BIOB','SB BAR BIOBR'],u:'un',p:[2.49,4.99]},
  {n:'AGUA SANITARIA QBOA 1L',a:['AG SANIT QBOA','AGUA SAN QBOA','AG SAN QBOA 1L'],u:'un',p:[3.49,6.49]},
  {n:'DESINFET PINHO SOL 500ML',a:['DESINF PINHO S','PINHO SOL 500','DESINF P SOL'],u:'un',p:[4.49,7.99]},
  {n:'DESINFET VEJA 500ML',a:['DESINF VEJA 500','VEJA MULTIUSO','DESINF VJ 500'],u:'un',p:[5.99,9.99]},
  {n:'ESPONJA SCOTCH BRITE',a:['ESPONJA S BRITE','ESP SCOTCH BR','ESPONJ S BRITE','ESPONJA BRITE 3M'],u:'un',p:[2.99,5.99]},
  {n:'ESPONJA NAO RISCA SCOTCH',a:['ESPONJA N RISCA S SC','ESP N RISCA SC','ESPONJ NR SCOT'],u:'un',p:[3.99,6.99]},
  {n:'PAPEL TOALHA SNOB 2UN',a:['PAP TOAL SNOB','PAPEL T SNOB 2','PAP TOALHA SNB'],u:'un',p:[5.49,9.99]},
  {n:'SACO LIXO 50L 10UN',a:['SC LIXO 50L','SACO LX 50L 10','SC LX 50L 10UN'],u:'un',p:[5.99,10.99]},
  {n:'AMACIANTE COMFORT 1L',a:['AMAC COMFORT 1L','COMFORT 1L','AMAC COMF 1L'],u:'un',p:[9.49,16.99]},
  {n:'AMACIANTE DOWNY 1L',a:['AMAC DOWNY 1L','DOWNY 1L','AMAC DWNY 1L'],u:'un',p:[11.99,19.99]},
  {n:'LIMPADOR VEJA MULTISUP',a:['LIMP VEJA MULTI','VEJA MULTI SUP','LIMP VJ MULTI'],u:'un',p:[6.99,11.99]},
  {n:'ALVEJANTE VANISH 450ML',a:['ALVEJ VANISH','VANISH 450ML','ALVJ VANISH 450'],u:'un',p:[10.99,17.99]},
  {n:'LUSTRA MOVEIS POLIFLOR',a:['LUSTRA MOV POLI','POLIFLOR LUSTRA','LUST MOV POLIF'],u:'un',p:[7.99,13.99]},
  {n:'PANO MULTIUSO SCOTCH BRITE',a:['PANO M USO S-BRITE A','PANO MULT S BRT','PANO SCOTT BRT'],u:'un',p:[4.99,8.99]},
  {n:'RODO PLASTICO',a:['RODO PLAST','RODO PLASTIC'],u:'un',p:[8.99,16.99]},
  // HIGIENE
  {n:'PAPEL HIG NEVE 12UN',a:['PAP HIG NEVE 12','PAPEL H NEVE 12','PAP HG NEVE 12'],u:'un',p:[13.99,24.99]},
  {n:'PAPEL HIG PERSONAL 12UN',a:['PAP HIG PERSON','PAPEL H PERS 12','PAP HG PERSNL'],u:'un',p:[10.99,19.99]},
  {n:'SABONETE DOVE 90G',a:['SABON DOVE 90G','SABONT DOVE 90','SAB DOVE 90G'],u:'un',p:[3.29,5.99]},
  {n:'SABONETE LUX 85G',a:['SABON LUX 85G','SABONT LUX 85','SAB LUX 85G'],u:'un',p:[2.49,4.49]},
  {n:'SABONETE PROTEX 85G',a:['SABON PROTEX','SABONT PROTEX','SAB PROTEX 85G'],u:'un',p:[3.99,6.99]},
  {n:'SHAMPOO PANTENE 400ML',a:['SHAMP PANTENE','SHAMPOO PANT 400','SHP PANTENE 400'],u:'un',p:[15.99,24.99]},
  {n:'SHAMPOO ELSEVE 400ML',a:['SHAMP ELSEVE','SHAMPOO ELSV 400','SHP ELSEVE 400'],u:'un',p:[14.99,22.99]},
  {n:'SHAMPOO SEDA 325ML',a:['SHAMP SEDA 325','SHAMPOO SEDA','SHP SEDA 325'],u:'un',p:[9.99,16.99]},
  {n:'CONDIC PANTENE 400ML',a:['COND PANTENE','CONDIC PANT 400','CND PANTENE 400'],u:'un',p:[16.99,26.99]},
  {n:'PASTA DENTAL COLGATE 90G',a:['PASTA D COLGAT','COLGAT 90G','PST DENT COLG'],u:'un',p:[4.49,8.49]},
  {n:'PASTA DENTAL ORAL-B 70G',a:['PASTA ORAL-B','PST DENT ORALB','ORAL-B 70G'],u:'un',p:[3.99,7.49]},
  {n:'DESODORANTE REXONA 150ML',a:['DESOD REXONA','REXONA 150ML','DES REXONA 150'],u:'un',p:[11.99,19.99]},
  {n:'DESODORANTE NIVEA 150ML',a:['DESOD NIVEA','NIVEA 150ML','DES NIVEA 150'],u:'un',p:[12.99,21.99]},
  {n:'CREME HIDRAT JOHNSONS SOFT',a:['HIDRAT JOHNSONS SOFT','CRM HID JOHNS','HIDRAT JOHNS SF'],u:'un',p:[8.99,15.99]},
  {n:'CREME HIDRAT NIVEA 200ML',a:['HIDRAT NIVEA 200','CRM HID NIVEA','HIDRAT NIV 200'],u:'un',p:[12.99,22.99]},
  {n:'FRALDA PAMPERS M 30UN',a:['FRALDA PAMPERS M','FRLDA PAM M 30','FRAL PAMPERS M'],u:'un',p:[29.99,49.99]},
  {n:'FRALDA HUGGIES G 26UN',a:['FRALDA HUGGIES G','FRLDA HUG G 26','FRAL HUGGIES G'],u:'un',p:[27.99,44.99]},
  {n:'ABSORV ALWAYS C/8',a:['ABSORV ALWAYS','ABS ALWAYS C8','ABSORV ALW C/8'],u:'un',p:[5.99,12.99]},
  {n:'GOMA MASCAR TRIDENT',a:['GOMA MASCAR TRIDENT','GOMA MASC TRID','TRIDENT'],u:'un',p:[1.29,2.99]},
  {n:'GOMA MASCAR HALLS',a:['GOMA MASC HALLS','HALLS','GOMA M HALLS'],u:'un',p:[1.49,3.49]},
  // PADARIA / CONGELADOS / SNACKS
  {n:'PAO FRANCES',a:['PAD FRAN','PAO FRAN','PAO FRANC','PÃO FRANCÊS'],u:'kg',p:[12.99,22.99]},
  {n:'PAO DE FORMA PULLMAN',a:['PAO FORM PULLM','PAO F PULLMAN','PF PULLMAN'],u:'un',p:[7.49,12.99]},
  {n:'PAO DE FORMA WICKBOLD',a:['PAO FORM WICKB','PAO F WICKBOLD','PF WICKBOLD'],u:'un',p:[7.99,13.49]},
  {n:'BISC RECH OREO 90G',a:['BISC REC OREO','BISC OREO 90G','BSC RECH OREO'],u:'un',p:[3.29,5.99]},
  {n:'BISC RECH NEGRESCO 90G',a:['BISC REC NEGR','BISC NEGR 90G','BSC NEGRESC 90'],u:'un',p:[2.99,5.49]},
  {n:'BISC CREAM CRACKER 400G',a:['BISC CR CRACKER','BSC CREAM CRACK','BISC CREAM CRK'],u:'un',p:[4.49,7.99]},
  {n:'BISC MAISENA MARILAN',a:['BISC MAIS MARIL','BSC MAISENA','BISC MAIS MAR'],u:'un',p:[3.49,6.49]},
  {n:'PIZZA CONG SADIA MUSSA',a:['PIZZA CG SADIA M','PIZZA SAD MUSSA','PZ CNG SADIA M'],u:'un',p:[14.99,22.99]},
  {n:'PIZZA CONG SEARA CALABRESA',a:['PIZZA CG SEARA C','PIZZA SEAR CALAB','PZ CNG SEARA C'],u:'un',p:[12.99,19.99]},
  {n:'SORVETE KIBON 1,5L',a:['SORV KIBON 1,5','SORVETE KBN','SORV KBN 1,5L'],u:'un',p:[18.99,29.99]},
  {n:'SORVETE NESTLE 1,5L',a:['SORV NESTLE 1,5','SORVETE NST','SORV NST 1,5L'],u:'un',p:[16.99,27.99]},
  {n:'HAMBURGUER SADIA 672G',a:['HAMB SADIA 672','HAMBURG SAD','HAMB SAD 672G'],u:'un',p:[14.99,22.99]},
  {n:'NUGGETS SADIA 300G',a:['NUGG SADIA 300','NUGGETS SAD','NUGG SAD 300G'],u:'un',p:[9.99,16.99]},
  {n:'EMPANADO SADIA 300G',a:['EMPAN SADIA 300','EMPANADO SAD','EMP SAD 300G'],u:'un',p:[9.49,15.99]},
  {n:'BATATA CONG MCCAIN 400G',a:['BAT CG MCCAIN','BATATA MCCAIN','BAT MCCAIN 400'],u:'un',p:[8.99,14.99]},
  {n:'LASANHA CONG SADIA 600G',a:['LASAN CG SADIA','LASANHA SAD 600','LASANH SAD CG'],u:'un',p:[13.99,21.99]},
  {n:'BATATA CHIPS LAYS 100G',a:['BAT CHIPS LAYS','LAYS 100G','BAT LAYS 100G'],u:'un',p:[6.99,11.99]},
  {n:'BATATA CHIPS RUFFLES 100G',a:['BAT CHIPS RUFF','RUFFLES 100G','BAT RUFF 100G'],u:'un',p:[7.49,12.99]},
  {n:'DORITOS 100G',a:['DORITOS 100G','DORIT 100G'],u:'un',p:[7.49,12.99]},
  {n:'PIPOCA MICROOND YOKI',a:['PIPOC MICRO YOKI','PIPOCA YOKI','PIP YOKI MICRO'],u:'un',p:[3.99,6.99]},
  // TEMPEROS/CONDIMENTOS
  {n:'KETCHUP HEINZ 397G',a:['KETCH HEINZ 397','KETCHUP HEINZ','KTCH HEINZ 397'],u:'un',p:[8.99,14.99]},
  {n:'MOSTARDA HEINZ 215G',a:['MOST HEINZ 215','MOSTARDA HEINZ','MOST HNZ 215G'],u:'un',p:[5.99,9.99]},
  {n:'MAIONESE HELLMANNS 500G',a:['MAION HELLMAN','MAIONESE HELL','MAION HELL 500'],u:'un',p:[7.99,13.99]},
  {n:'ALHO TRITURADO 200G',a:['ALHO TRITURAD','ALHO TRIT 200G'],u:'un',p:[3.99,7.99]},
  {n:'SAZON TEMP VERD 60G',a:['SAZON VD 60G','TEMP SAZON VD','SAZON VERDE'],u:'un',p:[2.49,4.49]},
  {n:'CALDO KNORR GALINHA 57G',a:['CALDO KNORR GAL','KNORR GALIN 57','CALDO KNR GAL'],u:'un',p:[1.99,3.99]},
  {n:'CALDO MAGGI CARNE 57G',a:['CALDO MAGGI CRN','MAGGI CARNE 57','CALDO MGI CRN'],u:'un',p:[1.99,3.99]},
  // OVOS
  {n:'OVO BRANCO GRANJA 12UN',a:['OVO BR GRANJA 12','OVOS BR 12','OVO BRNCO GR 12'],u:'un',p:[8.99,16.99]},
  {n:'OVO CAIPIRA 10UN',a:['OVO CAIPIRA 10','OVOS CAIP 10','OVO CAIP 10UN'],u:'un',p:[11.99,19.99]},
  {n:'OVO VERM GRANJA 30UN',a:['OVO VM GRANJA 30','OVOS VM 30','OVO VERM GR 30'],u:'un',p:[17.99,29.99]},
  // PET
  {n:'RACAO PEDIGREE ADULTO 1KG',a:['RAC PEDIGREE AD','RAÇÃO PEDIGR','RAC PEDIGR 1KG'],u:'un',p:[11.99,19.99]},
  {n:'RACAO WHISKAS SACHE',a:['RAC WHISKAS SAC','RAÇÃO WHISK','RAC WHISK SACH'],u:'un',p:[2.49,4.99]},
  // ANEL / ACESSÓRIO (como no cupom real)
  {n:'ANEL',a:['ANEL','ANEL DOURADO'],u:'un',p:[5.00,25.00]},
];

// ---- HELPER FUNCTIONS ----
const R = (min, max) => Math.random() * (max - min) + min;
const RI = (min, max) => Math.floor(R(min, max + 1));
const pick = a => a[RI(0, a.length - 1)];
const fp = v => v.toFixed(2).replace('.', ',');
const genBarcode = () => { let s=''; for(let i=0;i<13;i++) s+=RI(0,9); return s; };
const genCode = () => String(RI(10000,99999999)).padStart(8,'0');
const genSAT = () => { let s=''; for(let i=0;i<44;i++) s+=RI(0,9); return s; };

function randomDate() {
  const y = pick([2023,2024,2025]);
  const m = RI(1,12), d = RI(1,28), h = RI(6,22), mn = RI(0,59), s = RI(0,59);
  const pad = n => String(n).padStart(2,'0');
  return { fmt: `${pad(d)}/${pad(m)}/${y} ${pad(h)}:${pad(mn)}:${pad(s)}`, iso: `${y}-${pad(m)}-${pad(d)}` };
}

function pickItems(count) {
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Tax codes used in real receipts
const taxCodes = ['F1','F2','I1','I2','T17,00%','T18,00%','T12,00%','T7,00%','FF','NN','II'];

// ---- 6 RECEIPT FORMAT GENERATORS ----

function fmt1_SAT(store, prods, date, num) {
  // SAT format with codes, like the "Minimercado da Pandia" receipt
  const lines = [];
  lines.push(`<div class="r" style="font-family:'Courier New',monospace;font-size:10.5px;width:340px;padding:14px;background:#fff;color:#111;line-height:1.45;">`);
  lines.push(`<div style="text-align:center;font-weight:bold;">${store.name}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">${store.addr}</div>`);
  if(store.fone) lines.push(`<div style="text-align:center;font-size:9px;">FONE: ${store.fone}  ${store.city}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">CNPJ:${store.cnpj}  IE: ${store.ie}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">${date.fmt.split(' ')[0]}  ${date.fmt.split(' ')[1]}    CCF:${RI(100000,999999)} COD:${RI(100000,999999)}</div>`);
  lines.push(`<div style="text-align:center;font-weight:bold;margin:4px 0;">CUPOM FISCAL</div>`);
  lines.push(`<div style="font-size:9px;">M.CODIGO DESCRICAO QTD.UN.VL UNIT R$ ST A/T VL ITEM R$</div>`);

  let total = 0;
  prods.forEach((item, i) => {
    const abbr = pick(item.a);
    const price = parseFloat(R(item.p[0], item.p[1]).toFixed(2));
    let qty, qtyStr, itemTotal;
    const tc = pick(taxCodes);

    if (item.u === 'kg') {
      qty = parseFloat(R(0.15, 4.0).toFixed(3));
      qtyStr = `${qty.toFixed(3).replace('.',',')}kg`;
      itemTotal = parseFloat((qty * price).toFixed(2));
      lines.push(`<div>${genBarcode()} ${abbr} ${qtyStr} x ${fp(price)}R$/ 1${item.u} ${tc} ${fp(itemTotal)}</div>`);
    } else {
      qty = RI(1, 8);
      itemTotal = parseFloat((qty * price).toFixed(2));
      if (qty > 1) {
        lines.push(`<div>${genBarcode()} ${abbr} ${qty}</div>`);
        lines.push(`<div>    ${qty}un x ${fp(price)}  1${item.u} ${tc} ${fp(itemTotal)}</div>`);
      } else {
        lines.push(`<div>${genBarcode()} ${abbr}  1un ${tc} ${fp(price)}</div>`);
        itemTotal = price;
      }
    }
    total += itemTotal;
  });

  lines.push(`<div style="font-weight:bold;font-size:13px;margin-top:6px;border-top:1px solid #333;padding-top:4px;">TOTAL    R$    ${fp(total)}</div>`);
  
  const pay = pick(['Dinheiro','TEF','Credito','Debito','PIX']);
  lines.push(`<div>${pay}    ${fp(total)}</div>`);
  if (pay === 'Dinheiro') {
    const paid = Math.ceil(total/10)*10;
    lines.push(`<div>Troco R$    ${fp(paid-total)}</div>`);
  }
  
  lines.push(`<div style="font-size:9px;margin-top:4px;">Valor dos Impostos R$${fp(total*R(0.18,0.32))} (${fp(R(18,32))}%)</div>`);
  lines.push(`<div style="font-size:9px;">   ITEM(S) COMPRADOS ${prods.length}</div>`);
  lines.push(`<div style="font-size:9px;">NR PDV.:${RI(1,99)}    NR. CUPOM: ${RI(10000,99999)}</div>`);
  lines.push(`</div>`);
  return lines.join('\n');
}

function fmt2_NFC(store, prods, date, num) {
  // NFC-e compact format (like first attached receipt)
  const lines = [];
  lines.push(`<div class="r" style="font-family:'Courier New',monospace;font-size:11px;width:330px;padding:14px;background:#fff;color:#111;line-height:1.4;">`);
  lines.push(`<div style="text-align:center;font-weight:bold;">${store.name}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">CNPJ: ${store.cnpj} IE: ${store.ie}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">${store.addr}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">${store.city}</div>`);
  lines.push(`<div style="margin:4px 0;">${'='.repeat(46)}</div>`);
  lines.push(`<div style="text-align:center;font-size:10px;">DANFE NFC-e - DOCUMENTO AUXILIAR</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">NAO PERMITE APROVEITAMENTO DE CREDITO ICMS</div>`);
  lines.push(`<div style="margin:4px 0;">${'='.repeat(46)}</div>`);
  lines.push(`<div style="font-size:9px;"># COD   DESCRICAO          QTD UN VL.UNIT TOTAL</div>`);
  lines.push(`<div>${'-'.repeat(46)}</div>`);

  let total = 0;
  prods.forEach((item, i) => {
    const abbr = pick(item.a);
    const price = parseFloat(R(item.p[0], item.p[1]).toFixed(2));
    const num = String(i+1).padStart(3,'0');
    const code = genCode();
    let qty, itemTotal;
    const tc = pick(taxCodes);

    if (item.u === 'kg') {
      qty = parseFloat(R(0.2, 3.5).toFixed(3));
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${num} ${code} ${abbr}</div>`);
      lines.push(`<div>    ${qty.toFixed(3).replace('.',',')} KG X ${fp(price)}  ${tc} ${fp(itemTotal)}</div>`);
    } else {
      qty = RI(1, 6);
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${num} ${code} ${abbr}    ${qty}un ${tc} ${fp(itemTotal)}</div>`);
    }
    total += itemTotal;
  });

  lines.push(`<div style="margin:4px 0;">${'='.repeat(46)}</div>`);
  lines.push(`<div style="font-weight:bold;font-size:13px;">TOTAL    R$  ${fp(total)}</div>`);
  lines.push(`<div>${'-'.repeat(46)}</div>`);
  const pay = pick(['CARTAO CREDITO','CARTAO DEBITO','DINHEIRO','PIX']);
  lines.push(`<div>${pay}    ${fp(total)}</div>`);
  lines.push(`<div>CUPOM MANIA, CONCORRA A PREMIOS</div>`);
  lines.push(`<div style="font-size:9px;">ENVIE SMS P/ 6789: ${genSAT().substring(0,20)}</div>`);
  lines.push(`<div style="font-size:9px;">Valor dos Impostos R$${fp(total*R(0.2,0.3))} (${fp(R(20,30))}%)</div>`);
  lines.push(`<div style="font-size:9px;">   ITEM(S) COMPRADOS ${prods.length}</div>`);
  lines.push(`<div style="font-size:9px;">DATA: ${date.fmt}</div>`);
  lines.push(`</div>`);
  return lines.join('\n');
}

function fmt3_ECFIF(store, prods, date, num) {
  // ECF-IF older format (like Drogarias Pacheco)
  const lines = [];
  lines.push(`<div class="r" style="font-family:'Courier New',monospace;font-size:10px;width:300px;padding:12px;background:#fff;color:#222;line-height:1.5;">`);
  lines.push(`<div style="text-align:center;font-weight:bold;font-size:11px;">${store.name}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">${store.addr} - ${store.city.split(' - ')[1] || 'SP'}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">CEP: ${RI(10000,99999)}-${RI(100,999)}   ${store.city}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">CNPJ:${store.cnpj}  IE:${store.ie}</div>`);
  lines.push(`<div style="text-align:center;font-size:8px;">${date.fmt.split(' ')[0]} ${date.fmt.split(' ')[1]}  CCF:${RI(1000,999999)}  COD:${RI(100000,999999)}</div>`);
  lines.push(`<div style="text-align:center;font-weight:bold;margin:4px 0;">CUPOM FISCAL</div>`);
  lines.push(`<div style="font-size:8px;">ITEM CODIGO DESCRICAO</div>`);
  lines.push(`<div style="font-size:8px;">QTD UN  VL UNIT  NI ST INT  VL ITEM R$</div>`);

  let total = 0;
  prods.forEach((item, i) => {
    const abbr = pick(item.a);
    const price = parseFloat(R(item.p[0], item.p[1]).toFixed(2));
    const code = genCode();
    let qty, itemTotal;

    if (item.u === 'kg') {
      qty = parseFloat(R(0.15, 2.5).toFixed(3));
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${String(i+1).padStart(3,'0')} ${code} ${abbr}</div>`);
      lines.push(`<div>  ${qty.toFixed(3).replace('.',',')} ${item.u.toUpperCase()} x ${fp(price)}  1UN/LT/KG  ${fp(itemTotal)}</div>`);
    } else {
      qty = RI(1, 5);
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${String(i+1).padStart(3,'0')} ${code} ${abbr}</div>`);
      lines.push(`<div>  ${qty},000 UN  ${fp(price)}  1UN  ${fp(itemTotal)}</div>`);
    }
    total += itemTotal;
  });

  lines.push(`<div style="font-weight:bold;font-size:12px;margin-top:4px;border-top:1px solid #333;padding-top:3px;">TOTAL    R$  ${fp(total)}</div>`);
  
  const pay = pick(['Credito','Debito','Dinheiro','PIX']);
  if (pay === 'Dinheiro') {
    const paid = Math.ceil(total);
    lines.push(`<div>Dinheiro    ${fp(paid)}</div>`);
    lines.push(`<div>Troco    ${fp(paid-total)}</div>`);
  } else {
    lines.push(`<div>${pay}    ${fp(total)}</div>`);
  }
  
  lines.push(`<div style="font-size:8px;margin-top:3px;">PROCON ${RI(100,999)} RUA DA AJUDA N.S SUBSOLO</div>`);
  lines.push(`<div style="font-size:8px;">${store.city}</div>`);
  lines.push(`<div style="font-size:8px;">TEL ${RI(1000,9999)} ${RI(1000,9999)}</div>`);
  lines.push(`<div style="font-size:7px;">VERSAO:03.00.04 ECF:${RI(1,9)} CRO:001 OPR:${RI(100000,999999)}</div>`);
  lines.push(`</div>`);
  return lines.join('\n');
}

function fmt4_thermal(store, prods, date, num) {
  // Thermal printer style - wide, clean
  const lines = [];
  lines.push(`<div class="r" style="font-family:'Courier New',monospace;font-size:11px;width:350px;padding:16px;background:#fff;color:#111;line-height:1.45;">`);
  lines.push(`<div style="text-align:center;font-weight:bold;font-size:13px;">${store.name.substring(0,30)}</div>`);
  lines.push(`<div style="text-align:center;">${store.addr}</div>`);
  lines.push(`<div style="text-align:center;">${store.city}  FONE:${store.fone||'(11)3000-0000'}</div>`);
  lines.push(`<div style="text-align:center;">CNPJ ${store.cnpj}  IE ${store.ie}</div>`);
  lines.push(`<div>${'─'.repeat(48)}</div>`);
  lines.push(`<div style="text-align:center;">*** CUPOM FISCAL ***</div>`);
  lines.push(`<div style="text-align:center;">DATA ${date.fmt}</div>`);
  lines.push(`<div>${'─'.repeat(48)}</div>`);

  let total = 0;
  let totalDiscounts = 0;
  prods.forEach((item, i) => {
    const abbr = pick(item.a);
    const price = parseFloat(R(item.p[0], item.p[1]).toFixed(2));
    let qty, itemTotal;

    if (item.u === 'kg') {
      qty = parseFloat(R(0.2, 4.5).toFixed(3));
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${abbr}</div>`);
      lines.push(`<div>  ${qty.toFixed(3).replace('.',',')} KG x ${fp(price)}         ${fp(itemTotal)}</div>`);
    } else {
      qty = RI(1, 10);
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${abbr}</div>`);
      lines.push(`<div>  ${qty} UN x ${fp(price)}              ${fp(itemTotal)}</div>`);
    }

    // Random discount on some items
    if (Math.random() > 0.85) {
      const disc = parseFloat((itemTotal * R(0.05,0.2)).toFixed(2));
      totalDiscounts += disc;
      lines.push(`<div style="color:#666;">  (!) DESC CARTAO FIDELIDADE  -${fp(disc)}</div>`);
    }
    total += itemTotal;
  });

  const finalTotal = total - totalDiscounts;
  lines.push(`<div>${'─'.repeat(48)}</div>`);
  lines.push(`<div>SUBTOTAL                      ${fp(total)}</div>`);
  if (totalDiscounts > 0) {
    lines.push(`<div>DESCONTOS                    -${fp(totalDiscounts)}</div>`);
  }
  lines.push(`<div style="font-weight:bold;font-size:14px;">TOTAL A PAGAR   R$  ${fp(finalTotal)}</div>`);
  lines.push(`<div>${'─'.repeat(48)}</div>`);
  lines.push(`<div>QTD ITENS: ${prods.length}</div>`);
  lines.push(`<div>OBRIGADO! VOLTE SEMPRE!</div>`);
  lines.push(`</div>`);
  return lines.join('\n');
}

function fmt5_atacadao(store, prods, date, num) {
  // Atacadão/wholesale style - bigger quantities
  const lines = [];
  lines.push(`<div class="r" style="font-family:'Courier New',monospace;font-size:10.5px;width:360px;padding:15px;background:#fff;color:#111;line-height:1.4;">`);
  lines.push(`<div style="text-align:center;font-weight:bold;font-size:14px;">${store.name}</div>`);
  lines.push(`<div style="text-align:center;">${store.addr}</div>`);
  lines.push(`<div style="text-align:center;">${store.city}</div>`);
  lines.push(`<div style="text-align:center;">CNPJ:${store.cnpj} IE:${store.ie}</div>`);
  lines.push(`<div>${'*'.repeat(50)}</div>`);
  lines.push(`<div style="text-align:center;font-weight:bold;">NOTA FISCAL AO CONSUMIDOR ELETRON.</div>`);
  lines.push(`<div style="text-align:center;">NFC-e N°${RI(100000,999999)} SERIE ${RI(1,50)}</div>`);
  lines.push(`<div style="text-align:center;">EMISSAO ${date.fmt}</div>`);
  lines.push(`<div>${'*'.repeat(50)}</div>`);
  lines.push(`<div>COD | DESCRICAO | QTD x VALOR | TOTAL</div>`);
  lines.push(`<div>${'-'.repeat(50)}</div>`);

  let total = 0;
  prods.forEach((item, i) => {
    const abbr = pick(item.a);
    const price = parseFloat(R(item.p[0], item.p[1]).toFixed(2));
    let qty, itemTotal;

    if (item.u === 'kg') {
      qty = parseFloat(R(0.5, 8.0).toFixed(3)); // bigger for wholesale
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${genBarcode()}</div>`);
      lines.push(`<div>${abbr}</div>`);
      lines.push(`<div>${qty.toFixed(3).replace('.',',')}KG X ${fp(price)} R$/KG        ${fp(itemTotal)}</div>`);
    } else {
      qty = RI(1, 24); // bigger quantities for wholesale
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${genBarcode()}</div>`);
      lines.push(`<div>${abbr}</div>`);
      lines.push(`<div>${qty} UN X ${fp(price)}               ${fp(itemTotal)}</div>`);
    }
    total += itemTotal;
  });

  lines.push(`<div>${'*'.repeat(50)}</div>`);
  lines.push(`<div style="font-weight:bold;font-size:15px;">VALOR TOTAL R$  ${fp(total)}</div>`);
  lines.push(`<div>${'-'.repeat(50)}</div>`);
  lines.push(`<div>FORMA PGTO: ${pick(['CARTAO CREDITO','CARTAO DEBITO','PIX','DINHEIRO'])}</div>`);
  lines.push(`<div>VALOR PAGO: R$ ${fp(total)}</div>`);
  lines.push(`<div>${'-'.repeat(50)}</div>`);
  lines.push(`<div>QTDE TOTAL ITENS: ${prods.length}</div>`);
  lines.push(`<div>VALOR TOTAL: R$ ${fp(total)}</div>`);
  lines.push(`<div style="font-size:8px;">Trib aprox R$${fp(total*R(0.2,0.35))} Fed, R$${fp(total*R(0.1,0.18))} Est</div>`);
  lines.push(`<div>${'*'.repeat(50)}</div>`);
  lines.push(`<div style="text-align:center;font-size:8px;">Consulte pela Chave de Acesso em</div>`);
  lines.push(`<div style="text-align:center;font-size:8px;">www.nfce.fazenda.sp.gov.br</div>`);
  lines.push(`<div style="text-align:center;font-size:7px;">${genSAT()}</div>`);
  lines.push(`</div>`);
  return lines.join('\n');
}

function fmt6_simple(store, prods, date, num) {
  // Simple small store format (like LARA ACESSORIOS receipt)
  const lines = [];
  lines.push(`<div class="r" style="font-family:'Courier New',monospace;font-size:11px;width:310px;padding:12px;background:#fff;color:#111;line-height:1.5;">`);
  lines.push(`<div style="text-align:center;font-weight:bold;">${store.name}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">${store.addr}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">CEP: ${RI(10000,99999)}-${RI(100,999)} - ${store.city}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">CNPJ:${store.cnpj}</div>`);
  lines.push(`<div style="text-align:center;font-size:9px;">IE:${store.ie} IM:${RI(100000,9999999)}</div>`);
  lines.push(`<div style="font-size:9px;">${date.fmt.split(' ')[0]} ${date.fmt.split(' ')[1]}  COD:${RI(10000,99999)}</div>`);
  lines.push(`<div style="font-weight:bold;text-align:center;margin:4px 0;">CUPOM FISCAL</div>`);
  lines.push(`<div style="font-size:9px;">ITEM CODIGO   DESCRICAO</div>`);
  lines.push(`<div style="font-size:9px;">QTD UN. VL UNIT(R$)  ST  VL ITEM(R$)</div>`);

  let total = 0;
  prods.forEach((item, i) => {
    const abbr = pick(item.a);
    const price = parseFloat(R(item.p[0], item.p[1]).toFixed(2));
    let qty, itemTotal;

    if (item.u === 'kg') {
      qty = parseFloat(R(0.1, 2.5).toFixed(3));
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${String(i+1).padStart(3,'0')} ${genBarcode().substring(0,10)} ${abbr}</div>`);
      lines.push(`<div>  ${qty.toFixed(3).replace('.',',')}KG X ${fp(price)}  02T18,00%  ${fp(itemTotal)}</div>`);
    } else {
      qty = RI(1, 5);
      itemTotal = parseFloat((qty*price).toFixed(2));
      lines.push(`<div>${String(i+1).padStart(3,'0')} ${genBarcode().substring(0,10)} ${abbr}</div>`);
      if(qty > 1){
        lines.push(`<div>  ${qty}UN X ${fp(price)}  02T18,00%  ${fp(itemTotal)}</div>`);
      } else {
        lines.push(`<div>  1UN X ${fp(price)}  02T18,00%  ${fp(price)}</div>`);
        itemTotal = price;
      }
    }
    total += itemTotal;
  });

  lines.push(`<div style="font-weight:bold;font-size:13px;border-top:1px solid #333;margin-top:4px;padding-top:4px;">TOTAL  R$  ${fp(total)}</div>`);
  const pay = pick(['Ct. Credito','Ct. Debito','Dinheiro','PIX']);
  lines.push(`<div>${pay}   ${fp(total)}</div>`);
  if(pay==='Dinheiro'){const p=Math.ceil(total);lines.push(`<div>Troco   ${fp(p-total)}</div>`);}
  lines.push(`<div style="font-size:8px;margin-top:3px;">MD-5:${genSAT().substring(0,32)}</div>`);
  lines.push(`<div style="font-size:8px;">MINAS LEGAL:${genBarcode()} ${RI(1000,9999)}${RI(2020,2025)} ${RI(100,999)}</div>`);
  lines.push(`<div style="font-size:8px;">CONTROLE: ${RI(10000000,99999999)}</div>`);
  lines.push(`<div style="font-size:7px;">BEMATECH MP-4000 TH FI ECF-IF</div>`);
  lines.push(`<div style="font-size:7px;">VERSAO:01.00.02 ECF:001 LJ:0001</div>`);
  lines.push(`</div>`);
  return lines.join('\n');
}

// ---- MAIN ----
async function main() {
  console.log('🚀 Gerando 100 cupons fiscais realistas...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox'],
  });

  const outDir = path.join(__dirname);
  const fmts = [fmt1_SAT, fmt2_NFC, fmt3_ECFIF, fmt4_thermal, fmt5_atacadao, fmt6_simple];

  for (let i = 1; i <= 100; i++) {
    const store = STORES[i % STORES.length];
    const itemCount = RI(3, 30);
    const prods = pickItems(itemCount);
    const date = randomDate();
    const fmt = fmts[(i - 1) % fmts.length];

    const html = fmt(store, prods, date, i);
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;padding:20px;background:#f0f0f0;display:flex;justify-content:center;}</style></head><body>${html}</body></html>`;

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const el = await page.$('.r');
    const fname = `cupom_${String(i).padStart(3,'0')}.png`;

    await el.screenshot({ path: path.join(outDir, fname), type: 'png' });

    if (i % 10 === 0 || i <= 5) {
      console.log(`✅ [${i}/100] ${fname} - ${store.name.substring(0,25)}... (${itemCount} itens, fmt${(i-1)%6+1})`);
    }

    await page.close();
  }

  await browser.close();

  console.log(`\n${'='.repeat(55)}`);
  console.log(`🎉 CONCLUÍDO! 100 cupons gerados em: ${outDir}`);
  console.log(`${'='.repeat(55)}`);
  console.log('\n📌 Agora faça o upload na ExtractLab:');
  console.log('   1. Acesse https://extractlab.com.br/Model/Create');
  console.log('   2. Nome: "Cupom Mercado" / Descrição: "Cupom Mercado"');
  console.log('   3. Arraste todos os 100 arquivos .png');
  console.log('   4. Clique "Criar e Continuar"');
  console.log('   5. Marque os campos e treine!');
}

main().catch(console.error);
