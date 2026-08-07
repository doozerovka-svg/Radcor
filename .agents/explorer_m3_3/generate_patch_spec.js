const fs = require('fs');

const fullM3Specs = [
  {
    sku: "MOL-1004",
    name: "MOL Dynamic Max 10W-40",
    description: "Полусинтетическое моторное масло высшего сорта для большинства современных транспортных средств.",
    description_ro: "Ulei de motor semisintetic de calitate superioară pentru majoritatea vehiculelor moderne.",
    specs: [
      { label: "Вязкость", value: "10W-40" },
      { label: "Класс", value: "API SL/CF, ACEA A3/B4-08" },
      { label: "Допуски", value: "MB 229.3, VW 502.00/505.00" },
      { label: "Плотность при 15°C", value: "0,874" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-33" }
    ]
  },
  {
    sku: "MOL-1005",
    name: "MOL Essence C3 5W-40",
    description: "Синтетическое моторное масло высокой эффективности для бензиновых и дизельных двигателей с фильтрами сажевых частиц (DPF).",
    description_ro: "Ulei de motor sintetic de înaltă performanță pentru motoare pe benzină și diesel cu filtre de particule DPF.",
    specs: [
      { label: "Вязкость", value: "5W-40" },
      { label: "Класс", value: "API SN/CF, ACEA C3, C2" },
      { label: "Допуски", value: "ACEA C3, ACEA C2, API SN/CF, VW 502 00/505 01, Renault RN0700, Renault RN0710" },
      { label: "Плотность при 15°C", value: "0,849" },
      { label: "Температура вспышки (по Кливленду)", value: "235" },
      { label: "Температура застывания", value: "-33" }
    ]
  },
  {
    sku: "MOL-1006",
    name: "MOL Dynamic Gold HEV 0W-20",
    description: "Синтетическое ресурсосберегающее моторное масло высшего качества, специально разработанное для гибридных (HEV/PHEV) и современных бензиновых двигателей.",
    description_ro: "Ulei de motor sintetic economisitor de resurse, special dezvoltat pentru vehicule hibride (HEV/PHEV) și motoare moderne pe benzină.",
    specs: [
      { label: "Вязкость", value: "0W-20" },
      { label: "Класс", value: "API SP, ILSAC GF-6A" },
      { label: "Допуски", value: "API SP, API SP (RC), ILSAC GF-6A" },
      { label: "Плотность при 15°C", value: "0,843" },
      { label: "Температура вспышки (по Кливленду)", value: "226" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-1011",
    name: "MOL Dynamic Gold Longlife 5W-30",
    description: "Синтетическое моторное масло высшего сорта для большинства современных транспортных средств с удлиненным интервалом замены.",
    description_ro: "Ulei de motor sintetic de calitate superioară pentru majoritatea vehiculelor moderne cu interval extins de schimb.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "API SN/CF, ACEA A3/B4-04" },
      { label: "Допуски", value: "VW 504.00/507.00, MB 229.51" },
      { label: "Плотность при 15°C", value: "0,854" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-42" }
    ]
  },
  {
    sku: "MOL-1018",
    name: "MOL Dynamic Gold Longlife 0W-20",
    description: "Синтетическое моторное масло премиум класса для самых современных двигателей автомобилей группы VAG (VW, Audi, Seat, Skoda).",
    description_ro: "Ulei de motor sintetic de clasă premium pentru cele mai moderne motoare ale grupului VAG (VW, Audi, Seat, Skoda).",
    specs: [
      { label: "Вязкость", value: "0W-20" },
      { label: "Класс", value: "ACEA C5, API SN Plus" },
      { label: "Допуски", value: "ACEA C5, API SN Plus, VW 508 00/509 00" },
      { label: "Плотность при 15°C", value: "0,836" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-51" }
    ]
  },
  {
    sku: "MOL-1019",
    name: "MOL Dynamic Star VL 0W-20",
    description: "Синтетическое моторное масло премиум качества для самых современных легковых автомобилей Volvo.",
    description_ro: "Ulei de motor sintetic de calitate premium pentru cele mai moderne autoturisme Volvo.",
    specs: [
      { label: "Вязкость", value: "0W-20" },
      { label: "Класс", value: "ACEA C5" },
      { label: "Допуски", value: "Volvo VCC RBS0-2AE" },
      { label: "Плотность при 15°C", value: "0,845" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-1022",
    name: "MOL Dynamic Gold DX 0W-20",
    description: "Синтетическое моторное масло премиум качества для самых современных азиатских и американских автомобилей.",
    description_ro: "Ulei de motor sintetic de calitate premium pentru cele mai moderne autoturisme asiatice și americane.",
    specs: [
      { label: "Вязкость", value: "0W-20" },
      { label: "Класс", value: "API SP, ILSAC GF-6A" },
      { label: "Допуски", value: "API SN, API SP, Opel OV 040 1547 - A20, ILSAC GF-5, ILSAC GF-6A" },
      { label: "Плотность при 15°C", value: "0,847" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-1023",
    name: "MOL Dynamic Star PC 0W-30",
    description: "Синтетическое моторное масло премиум класса для автомобилей концерна PSA (Peugeot, Citroen).",
    description_ro: "Ulei de motor sintetic de clasă premium pentru autoturismele grupului PSA (Peugeot, Citroen).",
    specs: [
      { label: "Вязкость", value: "0W-30" },
      { label: "Класс", value: "ACEA C2" },
      { label: "Допуски", value: "ACEA C2, PSA B71 2312" },
      { label: "Плотность при 15°C", value: "0,844" },
      { label: "Температура вспышки (по Кливленду)", value: "220" },
      { label: "Температура застывания", value: "-48" }
    ]
  },
  {
    sku: "MOL-1025",
    name: "MOL Botond 20W-50",
    description: "Минеральное моторное масло для транспортных средств более ранних моделей и двигателей с большим пробегом.",
    description_ro: "Ulei de motor mineral pentru vehicule din generații anterioare și motoare cu rulaj mare.",
    specs: [
      { label: "Вязкость", value: "20W-50" },
      { label: "Класс", value: "API SF/CC" },
      { label: "Допуски", value: "API SF/CC, MIL-L-46152B" },
      { label: "Плотность при 15°C", value: "0,887" },
      { label: "Температура вспышки (по Кливленду)", value: "240" },
      { label: "Температура застывания", value: "-27" }
    ]
  },
  {
    sku: "MOL-1030",
    name: "MOL Essence 10W-40",
    description: "Полусинтетическое моторное масло для увеличенного ресурса двигателя бензиновых и дизельных легковых автомобилей.",
    description_ro: "Ulei de motor semisintetic pentru resursă extinsă a motorului la autoturisme pe benzină și diesel.",
    specs: [
      { label: "Вязкость", value: "10W-40" },
      { label: "Класс", value: "API SL/CF, ACEA A3/B4-08" },
      { label: "Допуски", value: "VW 501.01/505.00" },
      { label: "Плотность при 15°C", value: "0,871" },
      { label: "Температура вспышки (по Кливленду)", value: "220" },
      { label: "Температура застывания", value: "-33" }
    ]
  },
  {
    sku: "MOL-1031",
    name: "MOL Dynamic Synt RN17 5W-30",
    description: "Синтетическое малозольное моторное масло последнего поколения, специально одобренное по спецификации Renault RN17.",
    description_ro: "Ulei de motor sintetic Low SAPS de ultimă generație, special aprobat conform specificației Renault RN17.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "ACEA C3, C2, API SP" },
      { label: "Допуски", value: "ACEA C3, ACEA C2, Renault RN17, API SP, MB 229.51, MB 229.52, MB 229.31, Renault RN0700, Renault RN0710, Fiat 9.55535-S1, MB 226.52, ILSAC GF-6A" },
      { label: "Плотность при 15°C", value: "0,854" },
      { label: "Температура вспышки (по Кливленду)", value: "234" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-1032",
    name: "MOL Essence 15W-50",
    description: "Всесезонное моторное масло высокой вязкости для увеличения срока службы бензиновых и дизельных двигателей с износом.",
    description_ro: "Ulei de motor multigrad de vâscozitate ridicată pentru prelungirea duratei de viață a motoarelor pe benzină și diesel cu uzură.",
    specs: [
      { label: "Вязкость", value: "15W-50" },
      { label: "Класс", value: "API SJ/CF" },
      { label: "Допуски", value: "API SJ/CF" },
      { label: "Плотность при 15°C", value: "0,879" },
      { label: "Температура вспышки (по Кливленду)", value: "220" },
      { label: "Температура застывания", value: "-24" }
    ]
  },
  {
    sku: "MOL-1035",
    name: "MOL Dynamic Star PC 5W-30",
    description: "Синтетическое моторное масло высшего сорта для бензиновых и дизельных двигателей автомобилей Peugeot и Citroen.",
    description_ro: "Ulei de motor sintetic de calitate superioară pentru motoare pe benzină și diesel ale vehiculelor Peugeot și Citroen.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "ACEA C2" },
      { label: "Допуски", value: "PSA Peugeot Citroen B71 2290, Fiat 9.55535-S1" },
      { label: "Плотность при 15°C", value: "0,850" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-39" }
    ]
  },
  {
    sku: "MOL-1038",
    name: "MOL Dynamic Gas Eco+ 15W-40",
    description: "Моторное масло высшего сорта для легковых и коммерческих автомобилей, работающих на сжиженном (LPG) и природном (CNG) газе.",
    description_ro: "Ulei de motor de calitate superioară pentru autoturisme și vehicule comerciale alimentate cu gaz GPL și GNC.",
    specs: [
      { label: "Вязкость", value: "15W-40" },
      { label: "Класс", value: "ACEA E7, API CI-4/SL" },
      { label: "Допуски", value: "ACEA E7, API CI-4/SL" },
      { label: "Плотность при 15°C", value: "0,885" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-33" }
    ]
  },
  {
    sku: "MOL-1040",
    name: "MOL Dynamic Synt RN 5W-30",
    description: "Синтетическое малозольное моторное масло высшего сорта для дизельных двигателей Renault с сажевым фильтром DPF.",
    description_ro: "Ulei de motor sintetic Low SAPS de calitate superioară pentru motoare diesel Renault echipate cu filtru DPF.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "ACEA C4" },
      { label: "Допуски", value: "Renault RN0720" },
      { label: "Плотность при 15°C", value: "0,852" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-39" }
    ]
  },
  {
    sku: "MOL-1043",
    name: "MOL Dynamic Gold DX 5W-30",
    description: "Синтетическое моторное масло премиум класса для современных бензиновых двигателей GM, Opel, Chevrolet с официальным допуском dexos1 Gen2.",
    description_ro: "Ulei de motor sintetic premium pentru motoare moderne pe benzină GM, Opel, Chevrolet cu aprobare oficială dexos1 Gen2.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "API SN Plus, API SN, ILSAC GF-5" },
      { label: "Допуски", value: "GM dexos1 Gen2" },
      { label: "Плотность при 15°C", value: "0,850" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-39" }
    ]
  },
  {
    sku: "MOL-1046",
    name: "MOL Essence Longlife 5W-30",
    description: "Синтетическое малозольное моторное масло премиум класса для легковых автомобилей с увеличенным интервалом обслуживания.",
    description_ro: "Ulei de motor sintetic Low SAPS premium pentru autoturisme cu interval extins de deservire.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "ACEA C3, API SN" },
      { label: "Допуски", value: "ACEA C3, API SN, VW 504 00/507 00, BMW Longlife-04" },
      { label: "Плотность при 15°C", value: "0,852" },
      { label: "Температура вспышки (по Кливленду)", value: "220" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-1047",
    name: "MOL Dynamic Star F 0W-30",
    description: "Синтетическое энергосберегающее моторное масло для современных двигателей Ford, Fiat, Alfa Romeo.",
    description_ro: "Ulei de motor sintetic economisitor de energie pentru motoare moderne Ford, Fiat, Alfa Romeo.",
    specs: [
      { label: "Вязкость", value: "0W-30" },
      { label: "Класс", value: "ACEA C2" },
      { label: "Допуски", value: "ACEA C2, Fiat 9.55535-DS1, Fiat 9.55535-GS1" },
      { label: "Плотность при 15°C", value: "0,844" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-54" }
    ]
  },
  {
    sku: "MOL-1050",
    name: "MOL Dynamic Star 5W-30",
    description: "Синтетическое моторное масло высшего сорта для большинства современных легковых автомобилей немецкого автопрома.",
    description_ro: "Ulei de motor sintetic de calitate superioară pentru majoritatea autoturismelor moderne germane.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "ACEA C3, API SN/CF" },
      { label: "Допуски", value: "MB 229.51, BMW Longlife-04" },
      { label: "Плотность при 15°C", value: "0,850" },
      { label: "Температура вспышки (по Кливленду)", value: "232" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-1052",
    name: "MOL Dynamic Gold 5W-30",
    description: "Синтетическое моторное масло высшего качества с повышенным запасом защитных свойств для бензиновых и дизельных двигателей.",
    description_ro: "Ulei de motor sintetic de calitate superioară cu rezervă crescută de protecție pentru motoare pe benzină și diesel.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "API SN/CF, ACEA A3/B4" },
      { label: "Допуски", value: "MB 229.5, VW 502.00/505.00" },
      { label: "Плотность при 15°C", value: "0,854" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-42" }
    ]
  },
  {
    sku: "MOL-1055",
    name: "MOL MSE 15W-40",
    description: "Минеральное моторное масло для транспортных средств более ранних моделей и стандартных условий эксплуатации.",
    description_ro: "Ulei de motor mineral pentru vehicule din generații anterioare și condiții standard de exploatare.",
    specs: [
      { label: "Вязкость", value: "15W-40" },
      { label: "Класс", value: "API SF/CC" },
      { label: "Допуски", value: "API SF/CC, MIL-L-46152B" },
      { label: "Плотность при 15°C", value: "0,879" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-27" }
    ]
  },
  {
    sku: "MOL-1061",
    name: "MOL Dynamic Gold Longlife 0W-30",
    description: "Синтетическое премиальное моторное масло для самых современных двигателей автомобилей VAG и BMW.",
    description_ro: "Ulei de motor sintetic premium pentru cele mai moderne motoare ale autoturismelor VAG și BMW.",
    specs: [
      { label: "Вязкость", value: "0W-30" },
      { label: "Класс", value: "ACEA C3" },
      { label: "Допуски", value: "VW 504 00/507 00, ACEA C3, BMW Longlife-04" },
      { label: "Плотность при 15°C", value: "0,843" },
      { label: "Температура вспышки (по Кливленду)", value: "240" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-1070",
    name: "MOL Dynamic Gold DX 5W-20",
    description: "Синтетическое моторное масло премиум качества для бензиновых двигателей японских, корейских и американских автомобилей.",
    description_ro: "Ulei de motor sintetic de calitate premium pentru motoare pe benzină ale mașinilor japoneze, coreene și americane.",
    specs: [
      { label: "Вязкость", value: "5W-20" },
      { label: "Класс", value: "API SP, ILSAC GF-6A" },
      { label: "Допуски", value: "API SP, Opel OV 040 1547 - A20, Ford WSS-M2C-960-A1, Chrysler MS-6395, ILSAC GF-6A" },
      { label: "Плотность при 15°C", value: "0,847" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-39" }
    ]
  },
  {
    sku: "MOL-DYN-ESS-5W30",
    name: "MOL Essence 5W-30",
    description: "Высокотехнологичное синтетическое моторное масло MOL Essence 5W-30 для максимальной защиты бензиновых и дизельных двигателей.",
    description_ro: "Ulei de motor sintetic de înaltă tehnologie MOL Essence 5W-30 pentru protecția maximă a motoarelor pe benzină și diesel.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "API SL/CF, ACEA A3/B4-04" },
      { label: "Допуски", value: "ACEA A3/B4-04, API SL/CF, VW 502 00/505 00, BMW Longlife-01" },
      { label: "Плотность при 15°C", value: "0,855" },
      { label: "Температура вспышки (по Кливленду)", value: "220" },
      { label: "Температура застывания", value: "-36" }
    ]
  },
  {
    sku: "MOL-DYN-ESS-C2-5W30",
    name: "MOL Essence DPF 5W-30",
    description: "Синтетическое ресурсосберегающее масло для двигателей с системами нейтрализации выхлопных газов и сажевыми фильтрами.",
    description_ro: "Ulei de motor sintetic economisitor de resurse pentru motoare cu sisteme de tratare a gazelor de eșapament și filtre DPF.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "API SN/CF, ACEA C2" },
      { label: "Допуски", value: "VW 502.00/505.00, Renault RN0700" },
      { label: "Плотность при 15°C", value: "0,852" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-39" }
    ]
  },
  {
    sku: "MOL-DYN-ESS-DSL-5W40",
    name: "MOL Essence Diesel 5W-40",
    description: "Синтетическое дизельное моторное масло повышенной надежности для легковых и легких грузовых автомобилей.",
    description_ro: "Ulei de motor sintetic pentru motoare diesel cu fiabilitate sporită pentru autoturisme și utilitare ușoare.",
    specs: [
      { label: "Вязкость", value: "5W-40" },
      { label: "Класс", value: "API SN/CF, ACEA A3/B4-08" },
      { label: "Допуски", value: "VW 502.00/505.00" },
      { label: "Плотность при 15°C", value: "0,854" },
      { label: "Температура вспышки (по Кливленду)", value: "240" },
      { label: "Температура застывания", value: "-39" }
    ]
  },
  {
    sku: "MOL-DYN-ESS-5W40",
    name: "MOL Essence 5W-40",
    description: "Синтетическое моторное масло MOL Essence 5W-40 с отличными противоизносными характеристиками для широкого парка авто.",
    description_ro: "Ulei de motor sintetic MOL Essence 5W-40 cu excelente caracteristici antiuzură pentru un parc auto larg.",
    specs: [
      { label: "Вязкость", value: "5W-40" },
      { label: "Класс", value: "API SN/CF, ACEA A3/B4-08" },
      { label: "Допуски", value: "API SN, ACEA A3/B4-08, VW 502 00/505 00, Renault RN0700/0710" },
      { label: "Плотность при 15°C", value: "0,857" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-42" }
    ]
  },
  {
    sku: "MOL-DYN-STAR-0W20",
    name: "MOL Dynamic Gold NG 0W-20",
    description: "Сверхлегкое синтетическое масло нового поколения с официальным допуском Ford для турбированных бензиновых двигателей.",
    description_ro: "Ulei de motor sintetic extrem de fluid din nouă generație cu aprobare oficială Ford pentru motoare turbo pe benzină.",
    specs: [
      { label: "Вязкость", value: "0W-20" },
      { label: "Класс", value: "ACEA C5" },
      { label: "Допуски", value: "Ford WSS-M2C-948-B" },
      { label: "Плотность при 15°C", value: "0,845" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-DYN-ESS-DSL-10W40",
    name: "MOL Essence Diesel 10W-40",
    description: "Полусинтетическое моторное масло для дизельных двигателей с турбонаддувом и без него.",
    description_ro: "Ulei de motor semisintetic pentru motoare diesel cu și fără turbocompresor.",
    specs: [
      { label: "Вязкость", value: "10W-40" },
      { label: "Класс", value: "API CF/SL, ACEA A3/B4" },
      { label: "Допуски", value: "VW 505.00" },
      { label: "Плотность при 15°C", value: "0,871" },
      { label: "Температура вспышки (по Кливленду)", value: "220" },
      { label: "Температура застывания", value: "-33" }
    ]
  },
  {
    sku: "MOL-DYN-ESS-15W40",
    name: "MOL Essence 15W-40",
    description: "Надежное минеральное масло для регулярного технического обслуживания классических бензиновых и дизельных двигателей.",
    description_ro: "Ulei de motor mineral fiabil pentru întreținerea tehnică regulată a motoarelor clasice pe benzină și diesel.",
    specs: [
      { label: "Вязкость", value: "15W-40" },
      { label: "Класс", value: "API SJ/CF" },
      { label: "Допуски", value: "API SJ/CF" },
      { label: "Плотность при 15°C", value: "0,879" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-27" }
    ]
  },
  {
    sku: "YUKO-CLASSIC-15W40",
    name: "Yuko Dynamic 15W-40",
    description: "Минеральное моторное масло YUKO Dynamic 15W-40 для бензиновых и дизельных двигателей легковых автомобилей.",
    description_ro: "Ulei de motor mineral YUKO Dynamic 15W-40 pentru motoare pe benzină și diesel ale autoturismelor.",
    specs: [
      { label: "Вязкость", value: "15W-40" },
      { label: "Класс", value: "API SF/CC" },
      { label: "Допуски", value: "API SF/CC, SAE 15W-40" },
      { label: "Плотность при 15°C", value: "0,885" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-27" }
    ]
  },
  {
    sku: "YUKO-VEGA-10W40",
    name: "Моторное масло YUKO VEGA SYNT 10W-40",
    description: "Полусинтетическое моторное масло YUKO VEGA SYNT 10W-40 с высокими защитными и моющими свойствами.",
    description_ro: "Ulei de motor semisintetic YUKO VEGA SYNT 10W-40 cu proprietăți înalte de protecție și spălare.",
    specs: [
      { label: "Вязкость", value: "10W-40" },
      { label: "Класс", value: "API SL/CF, ACEA A3/B4" },
      { label: "Допуски", value: "API SL/CF, ACEA A3/B4, MB 229.1, VW 501.01/505.00" },
      { label: "Плотность при 15°C", value: "0,872" },
      { label: "Температура вспышки (по Кливленду)", value: "220" },
      { label: "Температура застывания", value: "-32" }
    ]
  },
  {
    sku: "YUKO-SYNETIC-5W30",
    name: "Моторное масло YUKO Synetic 5W-30 (1 л)",
    description: "Современное синтетическое моторное масло YUKO Synetic 5W-30 для лёгкого запуска и экономии топлива.",
    description_ro: "Ulei de motor sintetic modern YUKO Synetic 5W-30 pentru pornire ușoară și economie de combustibil.",
    specs: [
      { label: "Вязкость", value: "5W-30" },
      { label: "Класс", value: "API SN/CF, ACEA A3/B4" },
      { label: "Допуски", value: "API SN/CF, ACEA A3/B4, MB 229.3, VW 502.00/505.00" },
      { label: "Плотность при 15°C", value: "0,855" },
      { label: "Температура вспышки (по Кливленду)", value: "225" },
      { label: "Температура застывания", value: "-38" }
    ]
  },
  {
    sku: "YUKO-SYNETIC-5W40",
    name: "Yuko Synthetic 5W-40",
    description: "Синтетическое моторное масло YUKO Synthetic 5W-40 для максимальной защиты двигателя в широком диапазоне температур.",
    description_ro: "Ulei de motor sintetic YUKO Synthetic 5W-40 pentru protecție maximă a motorului într-un domeniu larg de temperaturi.",
    specs: [
      { label: "Вязкость", value: "5W-40" },
      { label: "Класс", value: "API SN/CF, ACEA A3/B4" },
      { label: "Допуски", value: "API SN/CF, ACEA A3/B4, MB 229.3, VW 502.00/505.00" },
      { label: "Плотность при 15°C", value: "0,854" },
      { label: "Температура вспышки (по Кливленду)", value: "230" },
      { label: "Температура застывания", value: "-40" }
    ]
  },
  {
    sku: "MOL-DYN-PRIMA-5W40",
    name: "MOL Prima 5W-40",
    description: "Синтетическое малозольное масло MOL Prima 5W-40 DPF для автомобилей с системами доочистки выхлопных газов.",
    description_ro: "Ulei de motor sintetic Low SAPS MOL Prima 5W-40 DPF pentru autoturisme cu sisteme de post-tratare a gazelor de eșapament.",
    specs: [
      { label: "Вязкость", value: "5W-40" },
      { label: "Класс", value: "API SM/CF, ACEA C3" },
      { label: "Допуски", value: "DPF, API SM/CF, ACEA C3, VW 502 00/505 00/505 01, MB 229.51" },
      { label: "Плотность при 15°C", value: "0,854" },
      { label: "Температура вспышки (по Кливленду)", value: "235" },
      { label: "Температура застывания", value: "-42" }
    ]
  },
  {
    sku: "MOL-HYBRID-0W16",
    name: "MOL Dynamic Gold NG 0W-16",
    description: "Инновационное гибридное моторное масло сверхнизкой вязкости для гибридных и современных турбированных бензиновых двигателей.",
    description_ro: "Ulei de motor inovator hibrid cu vâscozitate extrem de scăzută pentru motoare hibride și moderne pe benzină cu turbocompresor.",
    specs: [
      { label: "Вязкость", value: "0W-16" },
      { label: "Класс", value: "API SP, ILSAC GF-6B" },
      { label: "Допуски", value: "API SP, ILSAC GF-6B" },
      { label: "Плотность при 15°C", value: "0,840" },
      { label: "Температура вспышки (по Кливленду)", value: "220" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-DYN-STAR-VL-0W30",
    name: "MOL Dynamic Star VL 0W-30",
    description: "Синтетическое энергосберегающее моторное масло высшего качества, специально разработанное для двигателей Volvo.",
    description_ro: "Ulei de motor sintetic economisitor de energie de calitate superioară, special dezvoltat pentru motoare Volvo.",
    specs: [
      { label: "Вязкость", value: "0W-30" },
      { label: "Класс", value: "ACEA A5/B5, A1/B1" },
      { label: "Допуски", value: "Volvo VCC 95200377" },
      { label: "Плотность при 15°C", value: "0,847" },
      { label: "Температура вспышки (по Кливленду)", value: "254" },
      { label: "Температура застывания", value: "-45" }
    ]
  },
  {
    sku: "MOL-ESSENCE-SL-10W40",
    name: "MOL Essence SL 10W-40",
    description: "Полусинтетическое моторное масло с высоким уровнем защиты от износа для бензиновых и дизельных двигателей.",
    description_ro: "Ulei de motor semisintetic cu nivel înalt de protecție împotriva uzurii pentru motoare pe benzină și diesel.",
    specs: [
      { label: "Вязкость", value: "10W-40" },
      { label: "Класс", value: "API SL/CF, ACEA A3/B4" },
      { label: "Допуски", value: "VW 501.01/505.00" },
      { label: "Плотность при 15°C", value: "0,871" },
      { label: "Температура вспышки (по Кливленду)", value: "220" },
      { label: "Температура застывания", value: "-33" }
    ]
  }
];

fs.writeFileSync('.agents/explorer_m3_3/m3_patch_spec.json', JSON.stringify(fullM3Specs, null, 2));
console.log('Successfully generated M3 Patch Spec with ' + fullM3Specs.length + ' items.');
