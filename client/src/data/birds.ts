export interface Bird {
  id: string;
  name: string;
  scientificName: string;
  region: string[];
  size: string;
  colors: string[];
  image: string;
  letter: string;
}

import robinImg from "@assets/generated_images/robin_in_flight.png";
import blueTitImg from "@assets/generated_images/blue_tit_flying.png";
import kingfisherImg from "@assets/generated_images/kingfisher_in_flight.png";
import goldfinchImg from "@assets/generated_images/goldfinch_flying.png";
import swallowImg from "@assets/generated_images/swallow_in_flight.png";
import jayImg from "@assets/generated_images/jay_flying.png";
import hoopoeImg from "@assets/generated_images/hoopoe_in_flight.png";
import storkImg from "@assets/generated_images/stork_soaring.png";
import woodpeckerImg from "@assets/generated_images/woodpecker_flying.png";
import nightingaleImg from "@assets/generated_images/nightingale_flying.png";
import eagleOwlImg from "@assets/generated_images/eagle_owl_soaring.png";
import craneImg from "@assets/generated_images/crane_in_flight.png";
import flamingoImg from "@assets/generated_images/flamingo_flying.png";
import ravenImg from "@assets/generated_images/raven_soaring.png";
import greatTitImg from "@assets/generated_images/great_tit_flying.png";
import magpieImg from "@assets/generated_images/magpie_in_flight.png";
import lapwingImg from "@assets/generated_images/lapwing_flying.png";
import quailImg from "@assets/generated_images/quail_in_flight.png";
import heronImg from "@assets/generated_images/heron_flying.png";
import wagtailImg from "@assets/generated_images/wagtail_flying.png";
import chaffinchImg from "@assets/generated_images/chaffinch_flying.png";
import yellowhammerImg from "@assets/generated_images/yellowhammer_flying.png";
import ospreyImg from "@assets/generated_images/osprey_diving.png";
import falconImg from "@assets/generated_images/falcon_in_flight.png";
import turtleDoveImg from "@assets/generated_images/turtle_dove_flying.png";
import nuthatchImg from "@assets/generated_images/nuthatch_flying.png";
import goldcrestImg from "@assets/generated_images/goldcrest_hovering.png";
import vultureImg from "@assets/generated_images/vulture_soaring.png";
import cuckooImg from "@assets/generated_images/cuckoo_in_flight.png";
import eiderDuckImg from "@assets/generated_images/eider_duck_flying.png";
import stiltImg from "@assets/generated_images/stilt_in_flight.png";
import slenderGullImg from "@assets/generated_images/slender-billed_gull_flying.png";
import yellowLeggedGullImg from "@assets/generated_images/yellow-legged_gull_soaring.png";
import ringedPloverImg from "@assets/generated_images/ringed_plover_flying.png";
import oystercatcherImg from "@assets/generated_images/oystercatcher_flying.png";
import medGullImg from "@assets/generated_images/mediterranean_gull_hovering.png";
import commonTernImg from "@assets/generated_images/common_tern_diving.png";
import sandwichTernImg from "@assets/generated_images/sandwich_tern_flying.png";
import littleGrebeImg from "@assets/generated_images/little_grebe_flying.png";
import crestedGrebeImg from "@assets/generated_images/crested_grebe_flying.png";
import blackNeckedGrebeImg from "@assets/generated_images/black-necked_grebe_flying.png";
import cormorantImg from "@assets/generated_images/cormorant_in_flight.png";
import shagImg from "@assets/generated_images/shag_flying.png";
import littleBitternImg from "@assets/generated_images/little_bittern_flying.png";
import squaccoHeronImg from "@assets/generated_images/squacco_heron_flying.png";
import littleEgretImg from "@assets/generated_images/little_egret_flying.png";
import greatEgretImg from "@assets/generated_images/great_egret_soaring.png";
import blackStorkImg from "@assets/generated_images/black_stork_soaring.png";
import spoonbillImg from "@assets/generated_images/spoonbill_in_flight.png";
import muteSwanImg from "@assets/generated_images/mute_swan_flying.png";
import whooperSwanImg from "@assets/generated_images/whooper_swan_flying.png";
import ruddyShelduckImg from "@assets/generated_images/ruddy_shelduck_flying.png";
import shelduckImg from "@assets/generated_images/shelduck_in_flight.png";
import wigeonImg from "@assets/generated_images/wigeon_flying.png";
import gadwallImg from "@assets/generated_images/gadwall_in_flight.png";
import tealImg from "@assets/generated_images/teal_flying.png";
import mallardImg from "@assets/generated_images/mallard_in_flight.png";
import pintailImg from "@assets/generated_images/pintail_flying.png";
import garganeyImg from "@assets/generated_images/garganey_flying.png";
import shovelerImg from "@assets/generated_images/shoveler_flying.png";
import redCrestedPochardImg from "@assets/generated_images/red-crested_pochard_flying.png";
import pochardImg from "@assets/generated_images/pochard_in_flight.png";
import ferruginousDuckImg from "@assets/generated_images/ferruginous_duck_flying.png";
import tuftedDuckImg from "@assets/generated_images/tufted_duck_flying.png";
import goldeneyeImg from "@assets/generated_images/goldeneye_flying.png";
import smewImg from "@assets/generated_images/smew_in_flight.png";
import merganserImg from "@assets/generated_images/merganser_flying.png";
import whiteHeadedDuckImg from "@assets/generated_images/white-headed_duck_flying.png";
import honeyBuzzardImg from "@assets/generated_images/honey_buzzard_soaring.png";

export const birds: Bird[] = [
  {
    id: "1",
    name: "Akbaba",
    scientificName: "Gypaetus barbatus",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "100-115 cm",
    colors: ["Turuncu-kahverengi", "Siyah", "Beyaz"],
    image: vultureImg,
    letter: "A",
  },
  {
    id: "2",
    name: "Ak Kuyruksallayan",
    scientificName: "Motacilla alba",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "16-19 cm",
    colors: ["Siyah", "Beyaz", "Gri"],
    image: wagtailImg,
    letter: "A",
  },
  {
    id: "3",
    name: "Balıkçıl",
    scientificName: "Ardea cinerea",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "90-98 cm",
    colors: ["Gri", "Beyaz", "Siyah"],
    image: heronImg,
    letter: "B",
  },
  {
    id: "4",
    name: "Bülbül",
    scientificName: "Luscinia megarhynchos",
    region: ["Avrupa", "Asya", "Kuzey Afrika"],
    size: "15-17 cm",
    colors: ["Kahverengi", "Krem"],
    image: nightingaleImg,
    letter: "B",
  },
  {
    id: "5",
    name: "Bıldırcın",
    scientificName: "Coturnix coturnix",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "16-18 cm",
    colors: ["Kahverengi", "Bej", "Siyah çizgili"],
    image: quailImg,
    letter: "B",
  },
  {
    id: "6",
    name: "Doğan",
    scientificName: "Falco peregrinus",
    region: ["Dünya geneli"],
    size: "34-58 cm",
    colors: ["Mavi-gri", "Beyaz", "Siyah"],
    image: falconImg,
    letter: "D",
  },
  {
    id: "7",
    name: "Flamingo",
    scientificName: "Phoenicopterus roseus",
    region: ["Akdeniz", "Afrika", "Asya"],
    size: "110-150 cm",
    colors: ["Pembe", "Beyaz", "Kırmızı"],
    image: flamingoImg,
    letter: "F",
  },
  {
    id: "8",
    name: "Guguk Kuşu",
    scientificName: "Cuculus canorus",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "32-36 cm",
    colors: ["Gri", "Beyaz çizgili"],
    image: cuckooImg,
    letter: "G",
  },
  {
    id: "9",
    name: "İbibik",
    scientificName: "Upupa epops",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "25-29 cm",
    colors: ["Turuncu-pembe", "Siyah-beyaz kanatlar"],
    image: hoopoeImg,
    letter: "İ",
  },
  {
    id: "10",
    name: "İşkece",
    scientificName: "Pandion haliaetus",
    region: ["Dünya geneli"],
    size: "50-66 cm",
    colors: ["Kahverengi", "Beyaz"],
    image: ospreyImg,
    letter: "İ",
  },
  {
    id: "11",
    name: "Ispinoz",
    scientificName: "Fringilla coelebs",
    region: ["Avrupa", "Asya", "Kuzey Afrika"],
    size: "14-16 cm",
    colors: ["Pembe-kahverengi", "Mavi-gri", "Beyaz"],
    image: chaffinchImg,
    letter: "I",
  },
  {
    id: "12",
    name: "Kızılgerdan",
    scientificName: "Erithacus rubecula",
    region: ["Avrupa", "Kuzey Afrika", "Batı Asya"],
    size: "12-14 cm",
    colors: ["Turuncu-kırmızı", "Kahverengi", "Gri"],
    image: robinImg,
    letter: "K",
  },
  {
    id: "13",
    name: "Kuzgun",
    scientificName: "Corvus corax",
    region: ["Kuzey Yarımküre"],
    size: "54-67 cm",
    colors: ["Siyah"],
    image: ravenImg,
    letter: "K",
  },
  {
    id: "14",
    name: "Kırlangıç",
    scientificName: "Hirundo rustica",
    region: ["Dünya geneli"],
    size: "17-19 cm",
    colors: ["Mavi-siyah", "Kırmızı", "Beyaz"],
    image: swallowImg,
    letter: "K",
  },
  {
    id: "15",
    name: "Kızkurusu",
    scientificName: "Vanellus vanellus",
    region: ["Avrupa", "Asya"],
    size: "28-31 cm",
    colors: ["Yeşil-siyah", "Beyaz", "Mor yansıma"],
    image: lapwingImg,
    letter: "K",
  },
  {
    id: "16",
    name: "Kumru",
    scientificName: "Streptopelia turtur",
    region: ["Avrupa", "Asya", "Kuzey Afrika"],
    size: "26-28 cm",
    colors: ["Kahverengi", "Turuncu", "Siyah-beyaz"],
    image: turtleDoveImg,
    letter: "K",
  },
  {
    id: "17",
    name: "Leylek",
    scientificName: "Ciconia ciconia",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "100-115 cm",
    colors: ["Beyaz", "Siyah"],
    image: storkImg,
    letter: "L",
  },
  {
    id: "18",
    name: "Mavi Baştankara",
    scientificName: "Cyanistes caeruleus",
    region: ["Avrupa", "Batı Asya"],
    size: "11-12 cm",
    colors: ["Mavi", "Sarı", "Beyaz"],
    image: blueTitImg,
    letter: "M",
  },
  {
    id: "19",
    name: "Ötleyen Baştankara",
    scientificName: "Parus major",
    region: ["Avrupa", "Asya", "Kuzey Afrika"],
    size: "12-14 cm",
    colors: ["Sarı", "Siyah", "Beyaz"],
    image: greatTitImg,
    letter: "Ö",
  },
  {
    id: "20",
    name: "Puhu",
    scientificName: "Bubo bubo",
    region: ["Avrupa", "Asya"],
    size: "58-75 cm",
    colors: ["Kahverengi", "Turuncu", "Siyah"],
    image: eagleOwlImg,
    letter: "P",
  },
  {
    id: "21",
    name: "Saka Kuşu",
    scientificName: "Carduelis carduelis",
    region: ["Avrupa", "Asya", "Kuzey Afrika"],
    size: "12-13 cm",
    colors: ["Kırmızı", "Sarı", "Kahverengi", "Beyaz"],
    image: goldfinchImg,
    letter: "S",
  },
  {
    id: "22",
    name: "Saksağan",
    scientificName: "Pica pica",
    region: ["Avrupa", "Asya", "Kuzey Afrika"],
    size: "44-46 cm",
    colors: ["Siyah", "Beyaz", "Mavi-yeşil"],
    image: magpieImg,
    letter: "S",
  },
  {
    id: "23",
    name: "Sıvacıkuşu",
    scientificName: "Sitta europaea",
    region: ["Avrupa", "Asya"],
    size: "12-14 cm",
    colors: ["Mavi-gri", "Turuncu-bej"],
    image: nuthatchImg,
    letter: "S",
  },
  {
    id: "24",
    name: "Sarı Kırakuşu",
    scientificName: "Emberiza citrinella",
    region: ["Avrupa", "Asya"],
    size: "16-17 cm",
    colors: ["Sarı", "Kahverengi"],
    image: yellowhammerImg,
    letter: "S",
  },
  {
    id: "25",
    name: "Turna",
    scientificName: "Grus grus",
    region: ["Avrupa", "Asya"],
    size: "100-130 cm",
    colors: ["Gri", "Siyah", "Beyaz", "Kırmızı"],
    image: craneImg,
    letter: "T",
  },
  {
    id: "26",
    name: "Yalıçapkını",
    scientificName: "Alcedo atthis",
    region: ["Avrupa", "Asya", "Kuzey Afrika"],
    size: "16-17 cm",
    colors: ["Mavi", "Turuncu", "Yeşil"],
    image: kingfisherImg,
    letter: "Y",
  },
  {
    id: "27",
    name: "Ağaçkakan",
    scientificName: "Dendrocopos major",
    region: ["Avrupa", "Asya"],
    size: "20-24 cm",
    colors: ["Siyah", "Beyaz", "Kırmızı"],
    image: woodpeckerImg,
    letter: "A",
  },
  {
    id: "28",
    name: "Alakarga",
    scientificName: "Garrulus glandarius",
    region: ["Avrupa", "Asya", "Kuzey Afrika"],
    size: "32-35 cm",
    colors: ["Pembe-kahverengi", "Mavi", "Siyah", "Beyaz"],
    image: jayImg,
    letter: "A",
  },
  {
    id: "29",
    name: "Altınbaş",
    scientificName: "Regulus regulus",
    region: ["Avrupa", "Asya"],
    size: "8-9 cm",
    colors: ["Yeşil", "Sarı", "Siyah"],
    image: goldcrestImg,
    letter: "A",
  },
  {
    id: "30",
    name: "Pufla Ördeği",
    scientificName: "Somateria mollissima",
    region: ["Kuzey Avrupa", "Kuzey Amerika"],
    size: "50-71 cm",
    colors: ["Siyah", "Beyaz", "Yeşil"],
    image: eiderDuckImg,
    letter: "P",
  },
  {
    id: "31",
    name: "Bayağı Uzunbacak",
    scientificName: "Himantopus himantopus",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "33-36 cm",
    colors: ["Siyah", "Beyaz"],
    image: stiltImg,
    letter: "B",
  },
  {
    id: "32",
    name: "İnce Gagalı Martı",
    scientificName: "Larus genei",
    region: ["Akdeniz", "Orta Doğu", "Asya"],
    size: "37-43 cm",
    colors: ["Beyaz", "Gri"],
    image: slenderGullImg,
    letter: "İ",
  },
  {
    id: "33",
    name: "Gümüş Martı",
    scientificName: "Larus michahellis",
    region: ["Akdeniz", "Avrupa"],
    size: "52-58 cm",
    colors: ["Beyaz", "Gri", "Sarı"],
    image: yellowLeggedGullImg,
    letter: "G",
  },
  {
    id: "34",
    name: "Halkalı Küçük Cılıbıt",
    scientificName: "Charadrius dubius",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "14-15 cm",
    colors: ["Kahverengi", "Beyaz", "Siyah"],
    image: ringedPloverImg,
    letter: "H",
  },
  {
    id: "35",
    name: "Bayağı Poyraz Kuşu",
    scientificName: "Haematopus ostralegus",
    region: ["Avrupa", "Asya"],
    size: "40-45 cm",
    colors: ["Siyah", "Beyaz", "Turuncu"],
    image: oystercatcherImg,
    letter: "B",
  },
  {
    id: "36",
    name: "Akdeniz Martısı",
    scientificName: "Larus melanocephalus",
    region: ["Akdeniz", "Karadeniz"],
    size: "36-38 cm",
    colors: ["Beyaz", "Gri", "Siyah"],
    image: medGullImg,
    letter: "A",
  },
  {
    id: "37",
    name: "Sumru",
    scientificName: "Sterna hirundo",
    region: ["Dünya geneli"],
    size: "31-35 cm",
    colors: ["Beyaz", "Gri", "Siyah", "Kırmızı"],
    image: commonTernImg,
    letter: "S",
  },
  {
    id: "38",
    name: "Kara Gagalı Sumru",
    scientificName: "Sterna sandvicensis",
    region: ["Avrupa", "Afrika"],
    size: "36-41 cm",
    colors: ["Beyaz", "Siyah", "Sarı"],
    image: sandwichTernImg,
    letter: "K",
  },
  {
    id: "39",
    name: "Küçük Batağan",
    scientificName: "Tachybaptus ruficollis",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "23-29 cm",
    colors: ["Kahverengi", "Krem"],
    image: littleGrebeImg,
    letter: "K",
  },
  {
    id: "40",
    name: "Bahri",
    scientificName: "Podiceps cristatus",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "46-51 cm",
    colors: ["Kahverengi", "Beyaz", "Siyah"],
    image: crestedGrebeImg,
    letter: "B",
  },
  {
    id: "41",
    name: "Kara Boyunlu Batağan",
    scientificName: "Podiceps nigricollis",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "28-34 cm",
    colors: ["Siyah", "Sarı", "Beyaz"],
    image: blackNeckedGrebeImg,
    letter: "K",
  },
  {
    id: "42",
    name: "Karabatak",
    scientificName: "Phalacrocorax carbo",
    region: ["Dünya geneli"],
    size: "77-94 cm",
    colors: ["Siyah", "Bronz"],
    image: cormorantImg,
    letter: "K",
  },
  {
    id: "43",
    name: "Tepeli Karabatak",
    scientificName: "Phalacrocorax aristotelis",
    region: ["Avrupa", "Kuzey Afrika"],
    size: "68-78 cm",
    colors: ["Siyah", "Yeşil yansıma"],
    image: shagImg,
    letter: "T",
  },
  {
    id: "44",
    name: "Küçük Balaban",
    scientificName: "Ixobrychus minutus",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "33-38 cm",
    colors: ["Kahverengi", "Bej"],
    image: littleBitternImg,
    letter: "K",
  },
  {
    id: "45",
    name: "Alaca Balıkçıl",
    scientificName: "Ardeola ralloides",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "40-49 cm",
    colors: ["Bej-kahverengi", "Beyaz"],
    image: squaccoHeronImg,
    letter: "A",
  },
  {
    id: "46",
    name: "Küçük Ak Balıkçıl",
    scientificName: "Egretta garzetta",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "55-65 cm",
    colors: ["Beyaz"],
    image: littleEgretImg,
    letter: "K",
  },
  {
    id: "47",
    name: "Büyük Ak Balıkçıl",
    scientificName: "Casmerodius albus",
    region: ["Dünya geneli"],
    size: "85-102 cm",
    colors: ["Beyaz"],
    image: greatEgretImg,
    letter: "B",
  },
  {
    id: "48",
    name: "Kara Leylek",
    scientificName: "Ciconia nigra",
    region: ["Avrupa", "Asya"],
    size: "95-100 cm",
    colors: ["Siyah", "Beyaz", "Kırmızı"],
    image: blackStorkImg,
    letter: "K",
  },
  {
    id: "49",
    name: "Kaşıkçı",
    scientificName: "Platalea leucorodia",
    region: ["Avrupa", "Asya", "Afrika"],
    size: "80-93 cm",
    colors: ["Beyaz"],
    image: spoonbillImg,
    letter: "K",
  },
  {
    id: "50",
    name: "Kuğu",
    scientificName: "Cygnus olor",
    region: ["Avrupa", "Asya"],
    size: "125-170 cm",
    colors: ["Beyaz", "Turuncu"],
    image: muteSwanImg,
    letter: "K",
  },
  {
    id: "51",
    name: "Ötücü Kuğu",
    scientificName: "Cygnus cygnus",
    region: ["Kuzey Avrupa", "Asya"],
    size: "140-160 cm",
    colors: ["Beyaz", "Sarı", "Siyah"],
    image: whooperSwanImg,
    letter: "Ö",
  },
  {
    id: "52",
    name: "Angıt",
    scientificName: "Tadorna ferruginea",
    region: ["Asya", "Avrupa"],
    size: "61-67 cm",
    colors: ["Turuncu-kahverengi", "Beyaz"],
    image: ruddyShelduckImg,
    letter: "A",
  },
  {
    id: "53",
    name: "Suna",
    scientificName: "Tadorna tadorna",
    region: ["Avrupa", "Asya"],
    size: "58-67 cm",
    colors: ["Beyaz", "Kahverengi", "Yeşil", "Kırmızı"],
    image: shelduckImg,
    letter: "S",
  },
  {
    id: "54",
    name: "Fiyu",
    scientificName: "Anas penelope",
    region: ["Avrupa", "Asya"],
    size: "42-50 cm",
    colors: ["Gri", "Pembe-kahverengi", "Krem"],
    image: wigeonImg,
    letter: "F",
  },
  {
    id: "55",
    name: "Boz Ördek",
    scientificName: "Anas strepera",
    region: ["Kuzey Yarımküre"],
    size: "46-56 cm",
    colors: ["Gri-kahverengi", "Beyaz"],
    image: gadwallImg,
    letter: "B",
  },
  {
    id: "56",
    name: "Çamurcun",
    scientificName: "Anas crecca",
    region: ["Kuzey Yarımküre"],
    size: "34-38 cm",
    colors: ["Gri-kahverengi", "Yeşil", "Krem"],
    image: tealImg,
    letter: "Ç",
  },
  {
    id: "57",
    name: "Yeşilbaş",
    scientificName: "Anas platyrhynchos",
    region: ["Kuzey Yarımküre"],
    size: "50-65 cm",
    colors: ["Yeşil", "Kahverengi", "Gri", "Sarı"],
    image: mallardImg,
    letter: "Y",
  },
  {
    id: "58",
    name: "Kılkuyruk",
    scientificName: "Anas acuta",
    region: ["Kuzey Yarımküre"],
    size: "51-66 cm",
    colors: ["Gri", "Kahverengi", "Beyaz"],
    image: pintailImg,
    letter: "K",
  },
  {
    id: "59",
    name: "Çıkrıkçın",
    scientificName: "Anas querquedula",
    region: ["Avrupa", "Asya"],
    size: "37-41 cm",
    colors: ["Gri-kahverengi", "Beyaz", "Mavi-gri"],
    image: garganeyImg,
    letter: "Ç",
  },
  {
    id: "60",
    name: "Kaşıkgaga",
    scientificName: "Anas clypeata",
    region: ["Kuzey Yarımküre"],
    size: "44-52 cm",
    colors: ["Yeşil", "Beyaz", "Kahverengi"],
    image: shovelerImg,
    letter: "K",
  },
  {
    id: "61",
    name: "Macar Ördeği",
    scientificName: "Netta rufina",
    region: ["Avrupa", "Asya"],
    size: "53-57 cm",
    colors: ["Turuncu-kırmızı", "Siyah", "Beyaz"],
    image: redCrestedPochardImg,
    letter: "M",
  },
  {
    id: "62",
    name: "Elmabaş Patka",
    scientificName: "Aythya ferina",
    region: ["Avrupa", "Asya"],
    size: "42-49 cm",
    colors: ["Kahverengi", "Siyah", "Gri"],
    image: pochardImg,
    letter: "E",
  },
  {
    id: "63",
    name: "Pasbaş Patka",
    scientificName: "Aythya nyroca",
    region: ["Avrupa", "Asya"],
    size: "38-42 cm",
    colors: ["Kahverengi", "Beyaz"],
    image: ferruginousDuckImg,
    letter: "P",
  },
  {
    id: "64",
    name: "Tepeli Patka",
    scientificName: "Aythya fuligula",
    region: ["Avrupa", "Asya"],
    size: "40-47 cm",
    colors: ["Siyah", "Beyaz"],
    image: tuftedDuckImg,
    letter: "T",
  },
  {
    id: "65",
    name: "Altıngöz",
    scientificName: "Bucephala clangula",
    region: ["Kuzey Yarımküre"],
    size: "42-50 cm",
    colors: ["Siyah", "Beyaz"],
    image: goldeneyeImg,
    letter: "A",
  },
  {
    id: "66",
    name: "Sütlabi",
    scientificName: "Mergellus albellus",
    region: ["Kuzey Avrupa", "Asya"],
    size: "38-44 cm",
    colors: ["Beyaz", "Siyah"],
    image: smewImg,
    letter: "S",
  },
  {
    id: "67",
    name: "Tarakdiş",
    scientificName: "Mergus serrator",
    region: ["Kuzey Yarımküre"],
    size: "52-58 cm",
    colors: ["Gri", "Kahverengi", "Beyaz"],
    image: merganserImg,
    letter: "T",
  },
  {
    id: "68",
    name: "Dikkuyruk",
    scientificName: "Oxyura leucocephala",
    region: ["Avrupa", "Asya"],
    size: "43-48 cm",
    colors: ["Kahverengi", "Beyaz", "Mavi"],
    image: whiteHeadedDuckImg,
    letter: "D",
  },
  {
    id: "69",
    name: "Arı Şahini",
    scientificName: "Pernis apivorus",
    region: ["Avrupa", "Asya"],
    size: "52-60 cm",
    colors: ["Kahverengi", "Gri"],
    image: honeyBuzzardImg,
    letter: "A",
  },
];

export const groupBirdsByLetter = () => {
  const grouped: { [key: string]: Bird[] } = {};
  birds.forEach(bird => {
    if (!grouped[bird.letter]) {
      grouped[bird.letter] = [];
    }
    grouped[bird.letter].push(bird);
  });
  return grouped;
};

export const getAllLetters = () => {
  return Array.from(new Set(birds.map(b => b.letter))).sort((a, b) => a.localeCompare(b, 'tr'));
};
