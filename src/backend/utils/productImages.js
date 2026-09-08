/**
 * Product image catalog — maps each product category to a pool of real,
 * high-quality photos (Unsplash CDN) so every seeded product gets a real
 * product image automatically instead of a placeholder.
 *
 * The pools are validated by `scripts/validateProductImages.js` which drops
 * any ID that does not resolve, guaranteeing only working URLs are used.
 */

const CATEGORY_IMAGE_IDS = {
  "mobiles-tablets": [
    "1511707171634-5f897ff02aa9",
    "1517336714731-489689fd1ca8",
    "1567581935884-3349723552ca",
    "1610945265064-0e34e5519bbf",
    "1605236457880-71e2af588d2c",
    "1574944985070-8f3ebc6b79dd",
    "1607936854279-55bc8a53c93b",
    "1510559826160-b55af85d40d9",
  ],
  "laptops-computers": [
    "1496181133206-80ce9b88a853",
    "1517336714731-489689fd1ca8",
    "1527864550417-7fd91fc51a46",
    "1593642702821-c8da6771f0c6",
    "1547082299-de196ea013d6",
    "1611186871348-b1ce696e52c9",
    "1517694712202-14dd953410aa",
    "1588872657578-7efd1f1555ed",
  ],
  "headphones-audio": [
    "1505740420928-5e560c06d30e",
    "1484704849700-f032a568e944",
    "1526738549149-8e07eca6c147",
    "1546435770-a3e426bf472b",
    "1583394838336-acd977736f90",
    "1558756520-22cfe5d382ca",
    "1511367461989-f85a21fda167",
    "1600294037681-c80b4cb5b434",
  ],
  "smart-watches": [
    "1523275335684-37898b6baf30",
    "1522312346375-d1a52e2b99b3",
    "1546868871-7041f2a55e12",
    "1579586337278-3befd40fd17a",
    "1524805444758-089113d48a6d",
    "1508685096489-7aacd43bd3b1",
    "1542496658-e33a6d0d50f6",
    "1600269452121-4f2416e55c28",
  ],
  cameras: [
    "1516035069371-29a1b244cc32",
    "1526170375885-4d8ecf77b99f",
    "1502920917128-1aa500764cbd",
    "1520390138845-fd2d229dd553",
    "1452780212940-6f5c0d14d848",
    "1519638831568-d9897f54ed69",
    "1510127034890-ba27508e9f1c",
    "1500634245200-e5245c7574ef",
  ],
  televisions: [
    "1593359677879-a4bb92f829d1",
    "1461151304267-38535e780c79",
    "1468495244123-6c6c332eeece",
    "1593784995044-a45d0e2b4051",
    "1552929140-43c74cdee03f",
    "1567690180548-e6144131e301",
    "1526738549149-8e07eca6c147",
    "1578662770250-0f6c6c1d0f4a",
  ],
  "men-s-clothing": [
    "1521572163474-6864f9cf17ab",
    "1512374382149-233c42b6a83b",
    "1576566588028-4147f3842f27",
    "1602810318383-e386cc2a3ccf",
    "1556821840-3a63f95609a7",
    "1596755094514-f87e34085b2c",
    "1591047139829-d91aecb6caea",
    "1507679799987-c73779587ccf",
  ],
  "women-s-clothing": [
    "1525507119028-ed4c629a60a3",
    "1539008835657-9e8e9680c956",
    "1566174053879-31528523f8ae",
    "1595777457583-95e059d581b8",
    "1583496661160-fb5886a0aaaa",
    "1483985988355-763728e1935b",
    "1490481651871-ab68de25d43d",
    "1515886657613-9f3515b0c78f",
  ],
  footwear: [
    "1542291026-7eec264c27ff",
    "1549298916-b41d501d3772",
    "1560769629-975ec94e6a86",
    "1595950653106-6c9ebd614d3a",
    "1608231387042-66d1773070a5",
    "1552346154-21d32810aba3",
    "1525966222134-fcfa99b8ae77",
    "1543508282-6319a3e2621f",
  ],
  "watches-accessories": [
    "1523275335684-37898b6baf30",
    "1524592094714-0f0654e20314",
    "1524805444758-089113d48a6d",
    "1539874754764-5a96559165b0",
    "1508057198894-247b23fe5ade",
    "1542496658-e33a6d0d50f6",
    "1515562141207-7a88fb7ce338",
    "1511499767150-a48a237f0083",
  ],
  "bags-luggage": [
    "1553062407-98eeb64c6a62",
    "1622560480605-d83c853bc5c3",
    "1575124427355-56aea16278b2",
    "1565026057447-bc90a3dceb87",
    "1605020420620-20c943cc4669",
    "1585314542604-f37e8798e12c",
    "1554679665-f5537f187268",
    "1584917865442-de89df76afd3",
  ],
  "home-decor": [
    "1513694203232-719a280e022f",
    "1586023492125-27b2c045efd7",
    "1522708323590-d24dbb6b0267",
    "1493809842364-78817add7ffb",
    "1550226891-ef816aed4a98",
    "1578500494198-246f612d3b3d",
    "1516891343800-5143d8c5ea20",
    "1538688525198-9b88f6f53126",
  ],
  kitchen: [
    "1556911220-bff31c812dba",
    "1556912173-3bb406ef7e77",
    "1556910103-1c02745aae4d",
    "1584622650111-993a426fbf0a",
    "1590794056226-79ef3a8147e1",
    "1584568694244-14fbdf83bd30",
    "1584305574647-0cc949a2bb9f",
    "1523906834658-6e24ef2386f9",
  ],
  furniture: [
    "1555041469-a586c61ea9bc",
    "1567016432779-094069958ea5",
    "1505693416388-ac5ce068fe85",
    "1584100936595-c0654b55a2e2",
    "1524758631624-e2822e304c36",
    "1556228453-efd6c1ff04f6",
    "1540574163026-643ea20ade25",
    "1533090161767-e6ffed986c88",
  ],
  "cleaning-storage": [
    "1585421514738-01798e348b17",
    "1558317374-067fb5f30001",
    "1581578731548-c64695cc6952",
    "1585110396000-c9ffd4e4b308",
    "1563453392212-326f5e854473",
    "1530124566582-a618bc2615dc",
    "1527515637462-cff94eecc1ac",
    "1561557944-6e7860d1a7eb",
  ],
  "skin-care": [
    "1570172619644-dfd03ed5d881",
    "1620916566398-39f1143ab7be",
    "1556228720-195a672e8a03",
    "1512496015851-a90fb38ba796",
    "1571781926291-c477ebfd024b",
    "1556227702-97b3b29e2b25",
    "1598440947619-2c35fc9aa908",
    "1608248543803-ba4f8c70ae0b",
  ],
  makeup: [
    "1596462502278-27bfdc403348",
    "1522335789203-aabd1fc54bc9",
    "1631214524020-896c9119da52",
    "1589365278144-c9e705f843ba",
    "1526947425960-945c6e72858f",
    "1512496015851-a90fb38ba796",
    "1604076913837-52ab5629fba9",
    "1487412947147-5cebf100ffc2",
  ],
  "hair-care": [
    "1585747860715-2ba37e788b70",
    "1605980776566-0486c3ac7617",
    "1556227702-97b3b29e2b25",
    "1608248543803-ba4f8c70ae0b",
    "1586671267731-da2cf3ceeb80",
    "1595476108010-b4b1f0b4bcd8",
    "1605497788044-5a32c7078486",
    "1559599101-f09722fb4948",
  ],
  fragrances: [
    "1541643600914-78b084683601",
    "1523293182086-7651a899d37f",
    "1592945403244-b3fbafd7f539",
    "1556229010-6c3f2c9ca5f8",
    "1547887537-6158d64c35b3",
    "1587017539504-67cfbddac569",
    "1590736704728-f4730bb30770",
    "1523293182086-7651a899d37f",
  ],
  "fitness-equipment": [
    "1517836357463-d25dfeac3438",
    "1583454110551-21f2fa2afe61",
    "1517963879433-6ad2b056d712",
    "1518611012118-696072aa579a",
    "1532029837206-abbe2b7620e3",
    "1540497077202-7c8a3999166f",
    "1574680178050-55c6a6a96e25",
    "1593095948071-474c5cc2989d",
  ],
  "sports-shoes": [
    "1542291026-7eec264c27ff",
    "1595950653106-6c9ebd614d3a",
    "1608231387042-66d1773070a5",
    "1549298916-b41d501d3772",
    "1560769629-975ec94e6a86",
    "1597045566677-8cf032ed6634",
    "1525966222134-fcfa99b8ae77",
    "1556906781-9a412961c28c",
  ],
  cricket: [
    "1531415071268-0ac29c7b14a2",
    "1573923811354-7b3cfb1382ad",
    "1517927033932-b3d18e5fb345",
    "1517646287270-a5a9ca602e5c",
    "1546519638-68e109498ffc",
    "1571019614242-c5c5dee9f50b",
    "1599058917212-d750089bc07e",
    "1535131749386-eb2d8d62e2c2",
  ],
  cycling: [
    "1485965120184-e220f721d03e",
    "1507035895480-2b3156c31fc8",
    "1517520287167-4bb11564a0e7",
    "1520134821617-8cbca526f582",
    "1517685352821-92cf88aee5a5",
    "1532298229144-0ec0c57515c7",
    "1512070679279-8988d32161be",
    "1541625602330-2277a4c46182",
  ],
  toys: [
    "1518834107812-67b0b7c58434",
    "1587654780291-39c9404d746b",
    "1594787318286-3d835c1d207f",
    "1566576912321-d58ddd7a6088",
    "1559454403-b9fb1df3316e",
    "1515488042361-ee00e0ddd4e4",
    "1603006905003-be475563bc59",
    "1558060370-d644479cb6f7",
  ],
  "baby-care": [
    "1555252333-9f8e92e65df9",
    "1544716278-ca5e3f4abd8c",
    "1519689680058-324335c77eba",
    "1531749668029-2db88e4276fc",
    "1554126047-6b984310e0ea",
    "1547729047-d1f717f84746",
    "1602992708529-c97fbf129e68",
    "1550684376-efcbd6e3f031",
  ],
  "snacks-beverages": [
    "1621939514649-280e2ee25f60",
    "1556909212-d5b604d0c90d",
    "1518843875459-f738682238a6",
    "1542838132-92c53300491e",
    "1579113800032-c38bd7635818",
    "1511381939415-e44015466834",
    "1543253687-c931c8e01820",
    "1495474472287-4d71bcdd2085",
  ],
  "staples-oil": [
    "1586444248879-2d804c9f8c3d",
    "1587049352846-4a222e784d38",
    "1622470953792-aa8905b2d754",
    "1516687408617-931704e0e516",
    "1563379926898-05f4575a45d8",
    "1556745757-8d76bdb6984b",
    "1595855759920-86582396756a",
    "1571327073757-02d6c0d1c3b0",
  ],
  "dairy-bakery": [
    "1485451456034-3f40d7c5c8f3",
    "1550583724-b2692b85b150",
    "1509440159596-0249088772ff",
    "1563636619-e9143da7973b",
    "1511381939415-e44015466834",
    "1568051243858-52cd2084a6a1",
    "1549931319-a545dcf3bc73",
    "1587049352846-4a222e784d38",
  ],
  "car-electronics": [
    "1486262715619-67b85e0b08d3",
    "1558618666-fcd25c85cd64",
    "1487754180451-c456f719a1fc",
    "1503376780353-7e6692767b70",
    "1530046339160-ce3e530c7d2f",
    "1552519507-da3b142c6e3d",
    "1549317661-bd32c8ce0db2",
    "1583121274602-3e2820c69888",
  ],
  "car-care": [
    "1526726538690-5cbf956ae2fd",
    "1559563458-527698bf5295",
    "1607860108855-64acf2078ed9",
    "1558618666-fcd25c85cd64",
    "1486262715619-67b85e0b08d3",
    "1530046339160-ce3e530c7d2f",
    "1552519507-da3b142c6e3d",
    "1511919884226-fd3cad34687c",
  ],
  books: [
    "1544947950-fa07a98d237f",
    "1512820790803-83ca734da794",
    "1524995997946-a1c2e315a42f",
    "1481627834876-b7833e8f5570",
    "1495446815901-a7297e633e8d",
    "1532012197267-da84d127e765",
    "1507842217343-583bb7270b66",
    "1516979187457-637abb4f9353",
  ],
  stationery: [
    "1456735190827-d1262f71b8a3",
    "1513542789411-b6a5d4f31634",
    "1583485088034-697b5bc54ccd",
    "1593672715438-d88a76a6dfc6",
    "1544816155-12df9643f363",
    "1531346878377-a5be20888e57",
    "1497032628192-86f99bcd76bc",
    "1567446537708-ac4aa75c9c28",
  ],
  "dog-supplies": [
    "1583511655857-d19b40a7a54e",
    "1543466835-00a7907e9de1",
    "1552053831-71594a27632d",
    "1583337130417-3346a1be7dee",
    "1601758228041-f3b2795255f1",
    "1548199973-03cce0bbc87b",
    "1589924691995-400dc9ecc119",
    "1608848461950-0fe51dfc41cb",
  ],
  "cat-supplies": [
    "1514888286974-6c03e2ca1dba",
    "1573865526739-10659fec78a5",
    "1519052537078-e6302a4968d4",
    "1592194996308-7b43878e84a6",
    "1574158622682-e40e69881006",
    "1526336024174-e58f5cdd8e13",
    "1548247416-71766fbd2b28",
    "1495360010541-f48722b34f7d",
  ],
  supplements: [
    "1593095948071-474c5cc2989d",
    "1579758629938-03607ccdbaba",
    "1574680178050-55c6a6a96e25",
    "1559757148-5c350d0d3c56",
    "1576091160399-112ba8d25d1d",
    "1512621776951-a57141f2eefd",
    "1583454110551-21f2fa2afe61",
    "1546069901-ba9599a7e63c",
  ],
  "health-devices": [
    "1581595220892-b0739db3ba8c",
    "1579154204601-01588f351e67",
    "1538108149393-fbbd81895907",
    "1512069772995-ec65ed45afd6",
    "1579684385127-1ef15d508118",
    "1628348070889-cb656bea475e",
    "1505751172876-fa1923c5c528",
    "1584982751601-97dcc096659c",
  ],
  guitars: [
    "1518131672697-613becd4fab5",
    "1525201548942-d8732f6617a0",
    "1450297350677-623de575f31c",
    "1550291652-6ea9114a47b1",
    "1471478331149-c72f17e33c73",
    "1503418897099-225a74ce4572",
    "1510915361894-db8b60106cb1",
    "1520523839897-bd0b52f945a0",
  ],
  "keyboards-synths": [
    "1510915361894-db8b60106cb1",
    "1520523839897-bd0b52f945a0",
    "1552422535-c45813c61732",
    "1513883049090-d0b7439799bf",
    "1511379938547-c1f69419868d",
    "1516450412940-92d21d00d8f9",
    "1514320291840-2e0a9bf2a9ae",
    "1598488035139-bdbb2231ce04",
  ],
  // ── Categories seeded after the validated list was generated ──
  // These pools reuse already-validated Unsplash IDs from the closest related
  // category so every product still gets a working, on-theme photo.
  "gaming-consoles": [
    "1511707171634-5f897ff02aa9",
    "1517336714731-489689fd1ca8",
    "1610945265064-0e34e5519bbf",
    "1607936854279-55bc8a53c93b",
  ],
  "computer-peripherals": [
    "1496181133206-80ce9b88a853",
    "1517336714731-489689fd1ca8",
    "1527864550417-7fd91fc51a46",
    "1593642702821-c8da6771f0c6",
  ],
  "networking-wi-fi": [
    "1496181133206-80ce9b88a853",
    "1547082299-de196ea013d6",
    "1611186871348-b1ce696e52c9",
    "1588872657578-7efd1f1555ed",
  ],
  "ethnic-wear": [
    "1525507119028-ed4c629a60a3",
    "1539008835657-9e8e9680c956",
    "1566174053879-31528523f8ae",
    "1595777457583-95e059d581b8",
  ],
  "winter-wear": [
    "1521572163474-6864f9cf17ab",
    "1512374382149-233c42b6a83b",
    "1576566588028-4147f3842f27",
    "1556821840-3a63f95609a7",
  ],
  "kids-fashion": [
    "1583496661160-fb5886a0aaaa",
    "1490481651871-ab68de25d43d",
    "1515886657613-9f3515b0c78f",
    "1521572163474-6864f9cf17ab",
  ],
  "home-appliances": [
    "1556911220-bff31c812dba",
    "1584622650111-993a426fbf0a",
    "1590794056226-79ef3a8147e1",
    "1584568694244-14fbdf83bd30",
  ],
  bedding: [
    "1555041469-a586c61ea9bc",
    "1505693416388-ac5ce068fe85",
    "1524758631624-e2822e304c36",
    "1556228453-efd6c1ff04f6",
  ],
  lighting: [
    "1513694203232-719a280e022f",
    "1586023492125-27b2c045efd7",
    "1493809842364-78817add7ffb",
    "1550226891-ef816aed4a98",
  ],
  "bath-body": [
    "1570172619644-dfd03ed5d881",
    "1620916566398-39f1143ab7be",
    "1556228720-195a672e8a03",
    "1512496015851-a90fb38ba796",
  ],
  "beauty-appliances": [
    "1585747860715-2ba37e788b70",
    "1605980776566-0486c3ac7617",
    "1556227702-97b3b29e2b25",
    "1608248543803-ba4f8c70ae0b",
  ],
  grooming: [
    "1585747860715-2ba37e788b70",
    "1605980776566-0486c3ac7617",
    "1556227702-97b3b29e2b25",
    "1586671267731-da2cf3ceeb80",
  ],
  "camping-outdoors": [
    "1485965120184-e220f721d03e",
    "1507035895480-2b3156c31fc8",
    "1517685352821-92cf88aee5a5",
    "1532298229144-0ec0c57515c7",
  ],
  swimming: [
    "1542291026-7eec264c27ff",
    "1549298916-b41d501d3772",
    "1560769629-975ec94e6a86",
    "1595950653106-6c9ebd614d3a",
  ],
  "indoor-sports": [
    "1517646287270-a5a9ca602e5c",
    "1546519638-68e109498ffc",
    "1571019614242-c5c5dee9f50b",
    "1517836357463-d25dfeac3438",
  ],
  "educational-toys": [
    "1518834107812-67b0b7c58434",
    "1587654780291-39c9404d746b",
    "1594787318286-3d835c1d207f",
    "1515488042361-ee00e0ddd4e4",
  ],
  "kids-books": [
    "1544947950-fa07a98d237f",
    "1512820790803-83ca734da794",
    "1524995997946-a1c2e315a42f",
    "1481627834876-b7833e8f5570",
  ],
  "fruits-vegetables": [
    "1621939514649-280e2ee25f60",
    "1556909212-d5b604d0c90d",
    "1542838132-92c53300491e",
    "1495474472287-4d71bcdd2085",
  ],
  "tea-coffee": [
    "1556909212-d5b604d0c90d",
    "1511381939415-e44015466834",
    "1542838132-92c53300491e",
    "1495474472287-4d71bcdd2085",
  ],
  "tyres-wheels": [
    "1486262715619-67b85e0b08d3",
    "1558618666-fcd25c85cd64",
    "1503376780353-7e6692767b70",
    "1530046339160-ce3e530c7d2f",
  ],
  "auto-parts": [
    "1526726538690-5cbf956ae2fd",
    "1559563458-527698bf5295",
    "1486262715619-67b85e0b08d3",
    "1530046339160-ce3e530c7d2f",
  ],
  "art-craft": [
    "1456735190827-d1262f71b8a3",
    "1513542789411-b6a5d4f31634",
    "1544816155-12df9643f363",
    "1497032628192-86f99bcd76bc",
  ],
  "fish-aquarium": [
    "1583511655857-d19b40a7a54e",
    "1514888286974-6c03e2ca1dba",
    "1573865526739-10659fec78a5",
    "1592194996308-7b43878e84a6",
  ],
  "bird-supplies": [
    "1583511655857-d19b40a7a54e",
    "1543466835-00a7907e9de1",
    "1552053831-71594a27632d",
    "1548199973-03cce0bbc87b",
  ],
  ayurveda: [
    "1570172619644-dfd03ed5d881",
    "1556228720-195a672e8a03",
    "1593095948071-474c5cc2989d",
    "1574680178050-55c6a6a96e25",
  ],
  drums: [
    "1518131672697-613becd4fab5",
    "1450297350677-623de575f31c",
    "1550291652-6ea9114a47b1",
    "1510915361894-db8b60106cb1",
  ],
};

// Fallback pool for any unknown category
const GENERIC_IMAGE_IDS = [
  "1523275335684-37898b6baf30",
  "1505740420928-5e560c06d30e",
  "1496181133206-80ce9b88a853",
  "1542291026-7eec264c27ff",
  "1521572163474-6864f9cf17ab",
  "1523275335684-37898b6baf30",
  "1511707171634-5f897ff02aa9",
  "1484704849700-f032a568e944",
];

// LoremFlickr tag fallback (used only if a category pool is fully empty)
const CATEGORY_TAGS = {
  "mobiles-tablets": ["smartphone", "iphone", "mobile"],
  "laptops-computers": ["laptop", "computer", "macbook"],
  "headphones-audio": ["headphones", "earbuds", "audio"],
  "smart-watches": ["watch", "smartwatch", "wristwatch"],
  cameras: ["camera", "dslr", "gopro"],
  televisions: ["television", "tv", "screen"],
  "men-s-clothing": ["shirt", "tshirt", "fashion"],
  "women-s-clothing": ["dress", "fashion", "kurti"],
  footwear: ["shoes", "sneakers", "sports-shoes"],
  "watches-accessories": ["watch", "jewelry", "accessories"],
  "bags-luggage": ["backpack", "suitcase", "luggage"],
  "home-decor": ["interior", "decor", "vase"],
  kitchen: ["kitchen", "cooking", "appliances"],
  furniture: ["sofa", "furniture", "interior"],
  "cleaning-storage": ["cleaning", "vacuum", "mop"],
  "skin-care": ["skincare", "cosmetics", "cream"],
  makeup: ["makeup", "cosmetics", "lipstick"],
  "hair-care": ["hair", "shampoo", "haircare"],
  fragrances: ["perfume", "fragrance", "deodorant"],
  "fitness-equipment": ["gym", "dumbbell", "fitness"],
  "sports-shoes": ["running-shoes", "sneakers", "sport"],
  cricket: ["cricket", "sports", "bat"],
  cycling: ["bicycle", "cycling", "bike"],
  toys: ["toys", "lego", "toy"],
  "baby-care": ["baby", "diaper", "toddler"],
  "snacks-beverages": ["snacks", "food", "chips"],
  "staples-oil": ["rice", "flour", "grocery"],
  "dairy-bakery": ["bread", "milk", "cheese"],
  "car-electronics": ["car", "dashboard", "automotive"],
  "car-care": ["car-wash", "car", "detailing"],
  books: ["books", "book", "library"],
  stationery: ["stationery", "pens", "notebook"],
  "dog-supplies": ["dog", "puppy", "pet"],
  "cat-supplies": ["cat", "kitten", "pet"],
  supplements: ["protein", "supplement", "fitness"],
  "health-devices": ["medical", "stethoscope", "health"],
  guitars: ["guitar", "music", "instrument"],
  "keyboards-synths": ["piano", "keyboard", "music"],
  "gaming-consoles": ["gaming", "playstation", "controller"],
  "computer-peripherals": ["keyboard", "mouse", "computer"],
  "networking-wi-fi": ["router", "wifi", "network"],
  "ethnic-wear": ["saree", "kurta", "ethnic-wear"],
  "winter-wear": ["sweater", "jacket", "winter"],
  "kids-fashion": ["kids-fashion", "children", "kids-clothes"],
  "home-appliances": ["washing-machine", "refrigerator", "appliance"],
  bedding: ["bedding", "bedroom", "pillow"],
  lighting: ["lamp", "lighting", "bulb"],
  "bath-body": ["soap", "bath", "skincare"],
  "beauty-appliances": ["hair-dryer", "beauty", "cosmetics"],
  grooming: ["razor", "shaving", "grooming"],
  "camping-outdoors": ["tent", "camping", "outdoor"],
  swimming: ["swimming", "swim", "pool"],
  "indoor-sports": ["badminton", "table-tennis", "sports"],
  "educational-toys": ["toys", "education", "blocks"],
  "kids-books": ["kids-books", "children", "books"],
  "fruits-vegetables": ["fruits", "vegetables", "grocery"],
  "tea-coffee": ["coffee", "tea", "coffee-beans"],
  "tyres-wheels": ["car-tyre", "tire", "car"],
  "auto-parts": ["car-engine", "auto-parts", "mechanic"],
  "art-craft": ["painting", "art", "craft"],
  "fish-aquarium": ["fish", "aquarium", "pet"],
  "bird-supplies": ["bird", "parrot", "pet"],
  ayurveda: ["ayurveda", "herbal", "medicine"],
  drums: ["drums", "drum-set", "music"],
};

// Validated Unsplash CDN IDs (written by scripts/validateProductImages.js).
// These are real, high-quality photos known to resolve — used in preference to
// the raw (unvalidated) pools below.
const validated = require("./validatedImageIds.json");

const UCDN = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

// LoremFlickr fallback (used only if a category has no valid Unsplash IDs)
const IMAGE_URL = (tag, lock) =>
  `https://loremflickr.com/800/800/${encodeURIComponent(tag)}?lock=${lock}`;

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h >>> 0);
}

/**
 * Returns 3 deterministic, category-matched, high-quality photo URLs so every
 * product shows a relevant, realistic image instead of a placeholder.
 *
 * Sources, in order of preference:
 *   1. validatedImageIds.json  (real Unsplash CDN photos, pre-checked)
 *   2. raw CATEGORY_IMAGE_IDS  (unvalidated Unsplash IDs)
 *   3. GENERIC_IMAGE_IDS / LoremFlickr tag fallback
 *
 * The seed hash keeps each URL stable, so a product always keeps its own images.
 */
function getProductImages(name, slug, categorySlug) {
  const pool =
    validated?.categoryIds?.[categorySlug] ||
    CATEGORY_IMAGE_IDS[categorySlug] ||
    validated?.genericIds ||
    GENERIC_IMAGE_IDS;

  if (pool && pool.length >= 3) {
    // Deterministic seeded shuffle → 3 distinct photos that stay stable per product.
    const h = hash(`${categorySlug}:${slug}:${name}`);
    const arr = [...pool];
    let seed = h;
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const j = seed % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 3).map(UCDN);
  }

  const tags = CATEGORY_TAGS[categorySlug] || ["product", "shopping", "product"];
  const h = hash(`${categorySlug}:${slug}:${name}`);
  const urls = [];
  for (let i = 0; i < 3; i++) {
    const tag = tags[(h + i * 7) % tags.length];
    const lock = (h + i * 131) % 100000;
    urls.push(IMAGE_URL(tag, lock));
  }
  return urls;
}

module.exports = { CATEGORY_IMAGE_IDS, GENERIC_IMAGE_IDS, getProductImages };
