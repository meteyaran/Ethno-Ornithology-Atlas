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
