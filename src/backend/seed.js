require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const { Op } = require("sequelize");
const { sequelize } = require("./config/database");
const {
  User,
  Customer,
  Category,
  Product,
  Address,
  Cart,
  CartItem,
  Wishlist,
  Order,
  OrderItem,
  Review,
  Return,
  LoginLog,
  GuestVisit,
  SignupLog,
} = require("./models");
const { getProductImages } = require("./utils/productImages");

const IMG = (label) =>
  `https://placehold.co/600x600/FFD814/111111?text=${encodeURIComponent(label)}`;

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─────────────────────────────────────────────────────────────
// CATEGORIES (top-level + subcategories)
// ─────────────────────────────────────────────────────────────
const CATEGORY_TREE = [
  {
    name: "Electronics",
    image: IMG("Electronics"),
    subs: [
      { name: "Mobiles & Tablets" },
      { name: "Laptops & Computers" },
      { name: "Headphones & Audio" },
      { name: "Smart Watches" },
      { name: "Cameras" },
      { name: "Televisions" },
      { name: "Gaming Consoles" },
      { name: "Computer Peripherals" },
      { name: "Networking & Wi-Fi" },
    ],
  },
  {
    name: "Fashion",
    image: IMG("Fashion"),
    subs: [
      { name: "Men's Clothing" },
      { name: "Women's Clothing" },
      { name: "Footwear" },
      { name: "Watches & Accessories" },
      { name: "Bags & Luggage" },
      { name: "Ethnic Wear" },
      { name: "Winter Wear" },
      { name: "Kids' Fashion" },
    ],
  },
  {
    name: "Home & Furniture",
    image: IMG("Home"),
    subs: [
      { name: "Home Decor" },
      { name: "Kitchen" },
      { name: "Furniture" },
      { name: "Cleaning & Storage" },
      { name: "Home Appliances" },
      { name: "Bedding" },
      { name: "Lighting" },
    ],
  },
  {
    name: "Beauty & Personal Care",
    image: IMG("Beauty"),
    subs: [
      { name: "Skin Care" },
      { name: "Makeup" },
      { name: "Hair Care" },
      { name: "Fragrances" },
      { name: "Bath & Body" },
      { name: "Beauty Appliances" },
      { name: "Grooming" },
    ],
  },
  {
    name: "Sports & Fitness",
    image: IMG("Sports"),
    subs: [
      { name: "Fitness Equipment" },
      { name: "Sports Shoes" },
      { name: "Cricket" },
      { name: "Cycling" },
      { name: "Camping & Outdoors" },
      { name: "Swimming" },
      { name: "Indoor Sports" },
    ],
  },
  {
    name: "Toys & Baby",
    image: IMG("Toys"),
    subs: [
      { name: "Toys" },
      { name: "Baby Care" },
      { name: "Educational Toys" },
      { name: "Kids' Books" },
    ],
  },
  {
    name: "Grocery & Food",
    image: IMG("Grocery"),
    subs: [
      { name: "Snacks & Beverages" },
      { name: "Staples & Oil" },
      { name: "Dairy & Bakery" },
      { name: "Fruits & Vegetables" },
      { name: "Tea & Coffee" },
    ],
  },
  {
    name: "Auto Accessories",
    image: IMG("Auto"),
    subs: [
      { name: "Car Electronics" },
      { name: "Car Care" },
      { name: "Tyres & Wheels" },
      { name: "Auto Parts" },
    ],
  },
  {
    name: "Books & Stationery",
    image: IMG("Books"),
    subs: [{ name: "Books" }, { name: "Stationery" }, { name: "Art & Craft" }],
  },
  {
    name: "Pet Supplies",
    image: IMG("Pets"),
    subs: [
      { name: "Dog Supplies" },
      { name: "Cat Supplies" },
      { name: "Fish & Aquarium" },
      { name: "Bird Supplies" },
    ],
  },
  {
    name: "Health & Nutrition",
    image: IMG("Health"),
    subs: [
      { name: "Supplements" },
      { name: "Health Devices" },
      { name: "Ayurveda" },
    ],
  },
  {
    name: "Musical Instruments",
    image: IMG("Music"),
    subs: [
      { name: "Guitars" },
      { name: "Keyboards & Synths" },
      { name: "Drums" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// PRODUCTS: [name, brand, categorySlug, price, originalPrice,
//            rating, reviewCount, stock, description, variants]
// ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── Mobiles & Tablets ──────────────────────────────────
  ["iPhone 15 Pro 256GB", "Apple", "mobiles-tablets", 134900, 159900, 4.6, 2304, 40, "6.1-inch Super Retina XDR display, A17 Pro chip, titanium design.", ["Natural Titanium", "Blue Titanium"]],
  ["Galaxy S24 Ultra 5G", "Samsung", "mobiles-tablets", 129999, 149999, 4.5, 1876, 35, "6.8-inch QHD+ Dynamic AMOLED, 200MP camera, S Pen included.", ["Titanium Gray", "Titanium Black"]],
  ["Redmi Note 13 Pro 5G", "Xiaomi", "mobiles-tablets", 24999, 29999, 4.4, 3201, 120, "200MP OIS camera, 67W fast charging, AMOLED display.", ["Midnight Black", "Ocean Blue"]],
  ["realme 12 Pro+ 5G", "Realme", "mobiles-tablets", 29999, 34999, 4.3, 1450, 80, "64MP periscope telephoto, curved AMOLED, 100W charging.", ["Submarine Blue", "Navigator Beige"]],
  ["OnePlus 12R 128GB", "OnePlus", "mobiles-tablets", 39999, 45999, 4.5, 2100, 60, "Snapdragon 8 Gen 2, 5500mAh battery, Hasselblad camera.", ["Iron Gray", "Cool Blue"]],
  ["iPad Air 11-inch Wi-Fi", "Apple", "mobiles-tablets", 59900, 64900, 4.7, 980, 25, "M2 chip, Liquid Retina display, 128GB storage.", ["Space Gray", "Starlight"]],
  ["Nothing Phone (2a) 5G", "Nothing", "mobiles-tablets", 23999, 27999, 4.3, 2100, 90, "Glyph interface, Dimensity 7200 Pro, 50MP dual camera.", ["Black", "Milk"]],
  ["iQOO Neo 9 Pro 5G", "iQOO", "mobiles-tablets", 34999, 39999, 4.5, 1800, 70, "Snapdragon 8 Gen 2, 120W charging, 50MP Sony camera.", ["Conqueror Black"]],
  ["Vivo V30 Pro", "Vivo", "mobiles-tablets", 41999, 46999, 4.4, 1200, 45, "50MP ZEISS triple camera, 120Hz curved AMOLED.", ["Andromeda Green"]],
  ["Motorola Edge 50 Pro", "Motorola", "mobiles-tablets", 31999, 36999, 4.4, 1500, 60, "125W TurboPower, Pantone-validated display, IP68.", ["Black Beauty"]],
  ["Samsung Galaxy Tab S9", "Samsung", "mobiles-tablets", 74999, 79999, 4.6, 740, 25, "11-inch Dynamic AMOLED 2X, Snapdragon 8 Gen 2, S Pen.", ["Beige", "Graphite"]],
  ["Lenovo Tab P12", "Lenovo", "mobiles-tablets", 26999, 29999, 4.2, 560, 40, "12.7-inch 3K display, JBL quad speakers, 10200mAh.", ["Storm Grey"]],
  // ── Laptops & Computers ────────────────────────────────
  ["MacBook Air 13-inch M3", "Apple", "laptops-computers", 114900, 124900, 4.7, 1540, 30, "8-core M3 chip, 16GB unified memory, all-day battery life.", ["Midnight", "Silver"]],
  ["ThinkPad E16 Gen 2", "Lenovo", "laptops-computers", 72990, 84990, 4.4, 620, 45, "Ryzen 7, 16GB RAM, 512GB SSD, business-grade build.", ["Black"]],
  ["Pavilion 15 (i5, 16GB)", "HP", "laptops-computers", 62990, 74990, 4.3, 1105, 50, "13th Gen Intel i5, 16GB RAM, 512GB SSD, FHD display.", ["Natural Silver"]],
  ["Vostro 3520 (i5)", "Dell", "laptops-computers", 56990, 65990, 4.2, 870, 55, "Intel i5-1235U, 8GB RAM, 512GB SSD, anti-glare display.", ["Black"]],
  ["ASUS Vivobook 16X OLED", "ASUS", "laptops-computers", 74990, 86990, 4.5, 740, 40, "16-inch OLED, Ryzen 7, 16GB RAM, 1TB SSD.", ["Quiet Blue"]],
  ["ROG Strix G16 Gaming", "ASUS", "laptops-computers", 119990, 134990, 4.4, 520, 18, "RTX 4060, 16-inch 165Hz display, 16GB RAM, 1TB SSD.", ["Eclipse Gray"]],
  ["Legion 5 Pro Gaming", "Lenovo", "laptops-computers", 132990, 149990, 4.5, 640, 20, "Ryzen 7 + RTX 4060, 16-inch WQXGA 165Hz, 16GB RAM.", ["Storm Grey"]],
  ["MacBook Pro 14-inch M3", "Apple", "laptops-computers", 169900, 199900, 4.8, 980, 20, "M3 Pro chip, 18GB RAM, 512GB SSD, Liquid Retina XDR.", ["Space Black", "Silver"]],
  ["Galaxy Book3 Pro", "Samsung", "laptops-computers", 98990, 109990, 4.4, 210, 12, "16-inch AMOLED, Intel i7, 16GB RAM, 512GB SSD.", ["Graphite"]],
  // ── Headphones & Audio ─────────────────────────────────
  ["AirPods Pro (2nd Gen)", "Apple", "headphones-audio", 24900, 26900, 4.6, 5210, 90, "Active Noise Cancellation, Adaptive Transparency, MagSafe.", ["White"]],
  ["boAt Rockerz 550", "boAt", "headphones-audio", 1799, 3999, 4.3, 68450, 500, "Bluetooth v5.0, 20hrs battery, 40mm drivers.", ["Carbon Black"]],
  ["Sony WH-1000XM5", "Sony", "headphones-audio", 28990, 33990, 4.7, 4320, 60, "Industry-leading noise cancellation, 30hrs battery.", ["Black", "Silver"]],
  ["JBL Tune 510BT", "JBL", "headphones-audio", 2499, 2999, 4.3, 32100, 300, "Pure Bass sound, 40hrs battery, quick charge.", ["Black", "Blue", "White"]],
  ["Marshall Major IV", "Marshall", "headphones-audio", 16990, 19990, 4.5, 980, 35, "80+ hours wireless playtime, iconic design.", ["Black"]],
  ["OnePlus Nord Buds 2", "OnePlus", "headphones-audio", 1999, 2999, 4.3, 32100, 400, "ANC, 12.4mm drivers, up to 36hrs total playtime.", ["Arctic White"]],
  ["Sony WF-1000XM5", "Sony", "headphones-audio", 23990, 26990, 4.7, 3210, 50, "Industry-leading ANC earbuds, 8hrs + case playtime.", ["Black", "Silver"]],
  ["JBL Charge 5", "JBL", "headphones-audio", 12999, 14999, 4.5, 6540, 80, "IP67 waterproof, 20hrs playtime, powerbank output.", ["Black", "Blue"]],
  // ── Smart Watches ──────────────────────────────────────
  ["Apple Watch Series 9 45mm", "Apple", "smart-watches", 43900, 45900, 4.6, 3210, 50, "Always-On Retina, advanced health features, fast charging.", ["Midnight", "Starlight"]],
  ["Galaxy Watch6 44mm", "Samsung", "smart-watches", 29999, 35999, 4.4, 1980, 70, "BIA sensor, sleep coaching, sapphire crystal glass.", ["Graphite", "Silver"]],
  ["Noise ColorFit Pro 5", "Noise", "smart-watches", 2499, 4999, 4.2, 45210, 400, "1.96-inch AMOLED display, BT calling, 7-day battery.", ["Jet Black", "Royal Blue"]],
  ["boAt Xtend Pro", "boAt", "smart-watches", 3299, 6499, 4.1, 28450, 350, "1.43-inch AMOLED, Bluetooth calling, health suite.", ["Deep Blue"]],
  ["Apple Watch SE 2", "Apple", "smart-watches", 29900, 31900, 4.6, 5400, 45, "Chip S8, crash detection, watchOS 10, always-on altimeter.", ["Midnight", "Starlight"]],
  ["Fire-Boltt Ninja Call Pro", "Fire-Boltt", "smart-watches", 1499, 3999, 4.1, 65400, 700, "1.52-inch TFT display, BT calling, IP67, 120+ sports modes.", ["Black", "Red"]],
  ["Garmin Venu Sq 2", "Garmin", "smart-watches", 21990, 24990, 4.5, 890, 30, "AMOLED display, GPS, health snapshot, 11-day battery.", ["Black", "Cream Gold"]],
  // ── Cameras ────────────────────────────────────────────
  ["Canon EOS R50", "Canon", "cameras", 65995, 69995, 4.5, 640, 25, "24.2MP mirrorless, 4K video, compact vlogging body.", ["Black", "White"]],
  ["Sony Alpha ZV-E10", "Sony", "cameras", 59990, 64990, 4.6, 880, 20, "24.2MP APS-C, vlogging-first, flip screen, mic input.", ["Black", "White"]],
  ["GoPro HERO12 Black", "GoPro", "cameras", 39999, 45999, 4.6, 1520, 45, "5.3K60 video, HyperSmooth 6.0, waterproof to 10m.", ["Black"]],
  ["Instax Mini 12", "Fujifilm", "cameras", 5999, 6999, 4.5, 9870, 200, "Instant camera with automatic exposure, selfie mirror.", ["Blossom Pink", "Sky Blue"]],
  ["Nikon Z50", "Nikon", "cameras", 74950, 79950, 4.5, 430, 15, "20.9MP DX mirrorless, 11fps burst, 4K UHD video.", ["Black"]],
  // ── Televisions ────────────────────────────────────────
  ["Sony Bravia 55-inch 4K XR", "Sony", "televisions", 109990, 124990, 4.5, 1340, 30, "Cognitive XR processor, Dolby Vision, XR OLED panel.", ["Black"]],
  ["LG 55-inch OLED C3", "LG", "televisions", 119990, 139990, 4.6, 890, 25, "OLED evo panel, α9 AI processor, Dolby Vision & Atmos.", ["Black"]],
  ["Samsung 65-inch Neo QLED", "Samsung", "televisions", 149990, 179990, 4.4, 560, 20, "Neo Quantum processor, Quantum HDR 2000, 120Hz.", ["Black"]],
  ["OnePlus 55-inch Q2 Pro", "OnePlus", "televisions", 55999, 62999, 4.4, 2340, 50, "QLED panel, 120Hz MEMC, 4K HDR, Dolby Atmos.", ["Black"]],
  ["Xiaomi 55-inch OLED", "Xiaomi", "televisions", 74999, 84999, 4.4, 980, 25, "OLED 4K, 120Hz, Dolby Vision IQ, Google TV.", ["Black"]],
  ["LG 43-inch 4K UHD", "LG", "televisions", 32990, 39990, 4.3, 2100, 60, "4K UHD, ThinQ AI, WebOS 23, HDR10 Pro.", ["Black"]],
  // ── Men's Clothing ─────────────────────────────────────
  ["Slim Fit Denim Jeans", "Levi's", "men-s-clothing", 1999, 3999, 4.4, 8450, 200, "Classic straight-leg jeans in 100% cotton denim.", ["Blue", "Black"]],
  ["Peter England Formal Shirt", "Peter England", "men-s-clothing", 1199, 2299, 4.2, 5210, 180, "Regular fit formal shirt, wrinkle-free fabric.", ["White", "Light Blue"]],
  ["Allen Solly Polo T-Shirt", "Allen Solly", "men-s-clothing", 899, 1799, 4.3, 9840, 250, "Soft combed cotton polo with branded embroidery.", ["Navy", "Red", "Black"]],
  ["Roadster Cargo Shorts", "Roadster", "men-s-clothing", 1099, 1999, 4.2, 6340, 150, "Multi-pocket cargo shorts, comfortable fit.", ["Khaki", "Olive"]],
  ["U.S. Polo Assn Polo Shirt", "U.S. Polo Assn", "men-s-clothing", 1499, 2999, 4.3, 7640, 220, "Premium pique cotton polo, slim fit with contrast collar.", ["Navy", "Grey"]],
  ["Van Heusen Formal Trousers", "Van Heusen", "men-s-clothing", 1999, 3999, 4.3, 3210, 180, "Slim-fit formal trousers, stretch fabric, flat front.", ["Charcoal", "Black"]],
  ["Jack & Jones Crew T-Shirt", "Jack & Jones", "men-s-clothing", 899, 1999, 4.2, 12450, 300, "Soft cotton crew-neck t-shirt, everyday essential.", ["White", "Black"]],
  ["Levi's Denim Trucker Jacket", "Levi's", "men-s-clothing", 3999, 6999, 4.4, 2340, 80, "Iconic trucker jacket in rigid denim, button front.", ["Rigid"]],
  // ── Women's Clothing ───────────────────────────────────
  ["Anarkali Kurti", "FabIndia", "women-s-clothing", 1699, 2999, 4.5, 2340, 90, "Hand-block printed cotton anarkali kurti.", ["Indigo", "Maroon"]],
  ["H&M Floral Midi Dress", "H&M", "women-s-clothing", 1999, 3999, 4.3, 4120, 110, "Flowy floral midi dress in soft viscose.", ["Multicolor"]],
  ["Zara Tailored Blazer", "Zara", "women-s-clothing", 4990, 7990, 4.4, 870, 40, "Structured single-breasted blazer.", ["Black", "Beige"]],
  ["Sari (Banarasi Silk)", "Manyavar", "women-s-clothing", 4999, 8999, 4.6, 650, 30, "Handwoven banarasi silk saree with zari border.", ["Gold", "Red"]],
  ["Biba Cotton Kurti", "Biba", "women-s-clothing", 1299, 2499, 4.4, 5430, 150, "Anarkali cotton kurti with block print, straight fit.", ["Teal", "Rust"]],
  ["Vero Moda Skinny Jeans", "Vero Moda", "women-s-clothing", 1899, 2999, 4.3, 3210, 120, "High-rise skinny jeans, stretchable comfort fabric.", ["Blue", "Black"]],
  ["Libas Embroidered Suit", "Libas", "women-s-clothing", 2499, 3999, 4.5, 2340, 90, "Three-piece embroidered suit in breathable georgette.", ["Maroon", "Peacock"]],
  // ── Footwear ───────────────────────────────────────────
  ["Nike Air Zoom Pegasus 40", "Nike", "footwear", 9995, 11995, 4.6, 6540, 80, "Everyday running shoe with Zoom Air unit.", ["Black/White", "Blue"]],
  ["adidas Ultraboost 22", "Adidas", "footwear", 15999, 19999, 4.6, 3210, 50, "Energy-returning boost midsole, Primeknit upper.", ["Core Black", "Cloud White"]],
  ["Puma RS-X Sneakers", "Puma", "footwear", 5999, 8999, 4.4, 7420, 120, "Chunky retro sneakers with cushioned sole.", ["White/Red", "Black"]],
  ["Bata Formal Shoes", "Bata", "footwear", 2499, 3999, 4.2, 18450, 300, "Classic leather-look formal shoes for office.", ["Black", "Brown"]],
  ["Reebok Running Shoes", "Reebok", "footwear", 3299, 5999, 4.3, 9870, 200, "Lightweight running shoes with cushioned sole.", ["Grey", "Black"]],
  ["Skechers Go Walk 5", "Skechers", "footwear", 4999, 6999, 4.5, 7650, 150, "Ultra-lite cushioned walking shoes with Goga Mat insole.", ["Navy", "Grey"]],
  ["Crocs Classic Clog", "Crocs", "footwear", 1999, 3999, 4.3, 15400, 300, "Iconic lightweight clog, ventilated, water-friendly.", ["White", "Black"]],
  ["Woodland Leather Boots", "Woodland", "footwear", 4499, 6999, 4.5, 5430, 100, "Durable leather boots with waterproof construction.", ["Brown", "Black"]],
  // ── Watches & Accessories ──────────────────────────────
  ["Titan Neo Analog Watch", "Titan", "watches-accessories", 2795, 4595, 4.5, 5430, 150, "Analog stainless steel watch, blue dial.", ["Blue"]],
  ["Fastrack Reflex Smartwatch", "Fastrack", "watches-accessories", 1795, 2995, 4.1, 21300, 400, "Bluetooth calling, 1.96-inch display, activity tracker.", ["Black"]],
  ["Casio G-Shock GA-2100", "Casio", "watches-accessories", 4995, 6995, 4.6, 8760, 180, "Carbon core guard, shock-resistant, world time.", ["Black"]],
  ["Timex Ironman Classic", "Timex", "watches-accessories", 2495, 3495, 4.3, 5430, 200, "Digital sports watch with 100-hour chronograph.", ["Black"]],
  ["Fossil Chronograph Watch", "Fossil", "watches-accessories", 12995, 17995, 4.5, 980, 40, "Stainless steel chronograph, quartz movement.", ["Silver"]],
  ["Daniel Wellington Classic", "Daniel Wellington", "watches-accessories", 14990, 17990, 4.4, 650, 30, "Minimalist thin case, interchangeable straps.", ["Silver", "Rose Gold"]],
  // ── Bags & Luggage ─────────────────────────────────────
  ["American Tourister Backpack", "American Tourister", "bags-luggage", 2549, 4499, 4.5, 8120, 160, "35L laptop backpack with USB port, water-resistant.", ["Black", "Navy"]],
  ["Skybags Polyester Trolley", "Skybags", "bags-luggage", 6999, 10999, 4.4, 3210, 70, "55cm cabin suitcase, 4 dual spinner wheels.", ["Teal", "Charcoal"]],
  ["Wildcraft 45L Rucksack", "Wildcraft", "bags-luggage", 1999, 3999, 4.3, 6540, 180, "Durable travel rucksack, water-resistant.", ["Olive", "Black"]],
  ["VIP Alpha 68cm Suitcase", "VIP", "bags-luggage", 4499, 6999, 4.3, 4320, 140, "Hard-shell trolley case with TSA lock, 4 wheels.", ["Blue", "Silver"]],
  ["Tommy Hilfiger Backpack", "Tommy Hilfiger", "bags-luggage", 3499, 5999, 4.4, 2340, 70, "Signature logo backpack, laptop compartment, padded straps.", ["Navy"]],
  // ── Home Decor ─────────────────────────────────────────
  ["Clay Decorative Vase", "CraftVilla", "home-decor", 499, 999, 4.3, 1230, 300, "Handcrafted terracotta vase, 12-inch.", ["Terracotta"]],
  ["Aroma Scented Candles Set", "Wicks And Aroma", "home-decor", 799, 1499, 4.5, 2340, 200, "Set of 4 soy wax candles, vanilla & lavender.", ["Beige"]],
  ["Wall Clock Modern Minimalist", "Chumbak", "home-decor", 1299, 2499, 4.4, 980, 150, "Silent sweep 12-inch wall clock.", ["Black"]],
  ["Wall Art Canvas Set", "CraftVilla", "home-decor", 1499, 2999, 4.4, 1230, 100, "Set of 3 abstract canvas prints, ready to hang.", ["Multicolor"]],
  ["Artificial Bonsai Plant", "Exotic Pebble", "home-decor", 599, 999, 4.3, 4320, 250, "Realistic indoor bonsai, potted, zero maintenance.", ["Green"]],
  // ── Kitchen ────────────────────────────────────────────
  ["Prestige Electric Kettle", "Prestige", "kitchen", 1099, 1999, 4.4, 21450, 250, "1.5L stainless steel kettle, 1500W.", ["Steel"]],
  ["Cello Copper Bottle 1L", "Cello", "kitchen", 799, 1499, 4.3, 32100, 400, "Copper water bottle with wooden cap.", ["Copper"]],
  ["Philips Air Fryer", "Philips", "kitchen", 8999, 12999, 4.5, 6540, 60, "6L air fryer, 8 preset programs, digital touch.", ["Black"]],
  ["Bajaj Mixer Grinder", "Bajaj", "kitchen", 2399, 3499, 4.4, 23450, 300, "750W juicer mixer grinder with 3 stainless jars.", ["White"]],
  ["Hawkins Pressure Cooker 5L", "Hawkins", "kitchen", 2599, 3999, 4.6, 15400, 200, "Hard-anodised pressure cooker, 5-litre capacity.", ["Steel"]],
  ["Wonderchef Nutri-Blend", "Wonderchef", "kitchen", 4499, 6999, 4.4, 6540, 120, "2-in-1 blender and chopper, 500W, 6 blades.", ["Black"]],
  // ── Furniture ──────────────────────────────────────────
  ["Engineered Wood Study Table", "HomeCentre", "furniture", 5499, 8499, 4.3, 1890, 50, "Compact study table with drawer and shelf.", ["Wenge"]],
  ["Recliner Sofa 1-Seater", "Wakefit", "furniture", 18999, 25999, 4.5, 980, 20, "Electric recliner with cup holder, fabric finish.", ["Grey", "Brown"]],
  ["Memory Foam Mattress", "SleepyHead", "furniture", 8999, 15999, 4.6, 5430, 40, "72x30x6 inch queen memory foam mattress.", ["White"]],
  ["Pepperfry Dining Table", "Pepperfry", "furniture", 24999, 34999, 4.4, 320, 15, "6-seater solid wood dining table set.", ["Teak"]],
  ["Ergonomic Study Chair", "Wakefit", "furniture", 5999, 8999, 4.3, 1230, 50, "Adjustable height, lumbar support, mesh back.", ["Black"]],
  // ── Cleaning & Storage ─────────────────────────────────
  ["Dyson V8 Cordless Vacuum", "Dyson", "cleaning-storage", 34900, 44900, 4.6, 2340, 30, "Cordless stick vacuum, 40-min runtime, HEPA.", ["Iron"]],
  ["Garment Storage Boxes (6)", "NeoLiv", "cleaning-storage", 999, 1999, 4.3, 3210, 200, "Vacuum-seal storage boxes for wardrobe.", ["White"]],
  ["3M Scotch-Brite Spin Mop", "3M", "cleaning-storage", 699, 1199, 4.3, 9870, 300, "Spin mop with bucket, 360° rotation.", ["Blue"]],
  ["Usha Steam Iron", "Usha", "cleaning-storage", 1299, 2199, 4.4, 15400, 250, "1200W steam iron with non-stick soleplate.", ["Blue"]],
  ["Roborock S8 Robot Vacuum", "Roborock", "cleaning-storage", 59999, 74999, 4.5, 540, 15, "LiDAR navigation, 6000Pa suction, mopping robot.", ["White"]],
  // ── Beauty & Personal Care ─────────────────────────────
  ["Himalaya Face Wash Combo", "Himalaya", "skin-care", 249, 498, 4.4, 45210, 500, "Neem + Aloe Vera face wash, 2x150ml.", ["Green"]],
  ["Nivea Body Lotion 400ml", "Nivea", "skin-care", 599, 899, 4.5, 32100, 400, "Deep moisture body lotion for dry skin.", ["White"]],
  ["Lakmé Sunscreen SPF 50", "Lakmé", "skin-care", 449, 749, 4.3, 18450, 350, "PA+++ sunscreen gel, non-sticky.", ["Yellow"]],
  ["Cetaphil Cleanser 500ml", "Cetaphil", "skin-care", 1199, 1499, 4.6, 23450, 350, "Gentle skin cleanser for all skin types.", ["White"]],
  ["Mamaearth Aloe Face Wash", "Mamaearth", "skin-care", 299, 499, 4.3, 32100, 500, "Aloe vera gel face wash, gentle daily cleanse.", ["Green"]],
  ["CeraVe Moisturizing Cream", "CeraVe", "skin-care", 1899, 2299, 4.6, 9870, 200, "With 3 essential ceramides, hyaluronic acid.", ["White"]],
  // ── Makeup ─────────────────────────────────────────────
  ["Maybelline Lipstick Set", "Maybelline", "makeup", 899, 1399, 4.4, 9870, 220, "Set of 3 creamy matte lipsticks.", ["Red", "Pink", "Nude"]],
  ["L'Oréal Paris Foundation", "L'Oréal Paris", "makeup", 1099, 1599, 4.3, 18750, 300, "Infallible 24H fresh wear foundation.", ["Porcelain", "Rose Beige"]],
  ["MAC Matte Lipstick", "MAC", "makeup", 2190, 2590, 4.5, 5430, 150, "Long-wearing matte lipstick, iconic shade range.", ["Ruby Woo"]],
  ["Kay Beauty Kajal", "Kay Beauty", "makeup", 349, 599, 4.3, 15400, 400, "Smudge-proof kajal, 24-hour wear.", ["Black"]],
  ["Nykaa Compact Powder", "Nykaa", "makeup", 549, 849, 4.2, 12300, 350, "Soft matte finishing compact powder.", ["Natural"]],
  // ── Hair Care ──────────────────────────────────────────
  ["Dove Hair Therapy Shampoo", "Dove", "hair-care", 598, 998, 4.4, 28700, 450, "Daily shine shampoo 340ml x2.", ["White"]],
  ["Dabur Amla Hair Oil 1L", "Dabur", "hair-care", 349, 599, 4.3, 36500, 500, "Amla hair oil, ayurvedic formula.", ["Green"]],
  ["Pantene Advanced Shampoo", "Pantene", "hair-care", 399, 699, 4.3, 43200, 600, "Strengthens hair, 650ml bottle.", ["White"]],
  ["TRESemmé Conditioner", "TRESemmé", "hair-care", 449, 799, 4.3, 32100, 500, "Keratin smooth conditioner, 575ml.", ["White"]],
  ["Philips Hair Dryer", "Philips", "hair-care", 1799, 2999, 4.4, 8760, 200, "1600W ionic hair dryer, cool shot.", ["Black"]],
  // ── Fragrances ─────────────────────────────────────────
  ["Fogg Perfume Deodorant", "Fogg", "fragrances", 199, 399, 4.2, 21450, 600, "Long-lasting body spray 150ml.", ["Black"]],
  ["Park Avenue Body Spray", "Park Avenue", "fragrances", 349, 599, 4.2, 32100, 500, "Magnetic mild fragrance, 150ml.", ["Aqua"]],
  ["Davidoff Cool Water", "Davidoff", "fragrances", 3499, 4999, 4.5, 3210, 100, "Iconic masculine fragrance, 125ml EDP.", ["Blue"]],
  ["Ajmal Royal Perfume", "Ajmal", "fragrances", 1799, 2999, 4.4, 5430, 120, "Long-lasting oriental perfume oil, 12ml.", ["Gold"]],
  // ── Fitness Equipment ──────────────────────────────────
  ["Cock Cricket Bat", "MRF", "cricket", 2999, 4999, 4.4, 3210, 100, "English willow full-size cricket bat.", ["Natural"]],
  ["Yonex Badminton Racket", "Yonex", "fitness-equipment", 1999, 3499, 4.3, 6540, 150, "Lightweight graphite racket.", ["Black"]],
  ["Kettler Exercise Cycle", "Kettler", "fitness-equipment", 8999, 12999, 4.2, 1230, 40, "Magnetic upright exercise bike.", ["Black"]],
  ["Decathlon Yoga Mat", "Decathlon", "fitness-equipment", 999, 1799, 4.4, 18450, 300, "10mm TPE exercise mat with carry strap.", ["Purple"]],
  ["HealthKart Creatine", "HealthKart", "fitness-equipment", 899, 1499, 4.4, 23450, 400, "Micronised creatine monohydrate, 250g.", ["Unflavoured"]],
  ["Probody Dumbbell Set", "Probody", "fitness-equipment", 2999, 4999, 4.3, 4320, 120, "Adjustable pair, 2 x 10kg with rack.", ["Black"]],
  // ── Sports Shoes ───────────────────────────────────────
  ["Asics Gel-Kayano 29", "Asics", "sports-shoes", 12999, 15999, 4.5, 2340, 60, "Premium stability running shoe with GEL technology.", ["Black", "White"]],
  ["Puma Fast-Runner", "Puma", "sports-shoes", 3999, 6999, 4.3, 6540, 140, "Lightweight mesh running shoes, cushioned midsole.", ["White/Red"]],
  ["Sparx Sports Shoes", "Sparx", "sports-shoes", 1299, 2299, 4.2, 23450, 400, "Breathable mesh running shoes, daily wear.", ["Grey", "Blue"]],
  ["Under Armour Charged", "Under Armour", "sports-shoes", 6999, 8999, 4.4, 3210, 80, "Charged cushioning running shoes.", ["Black"]],
  ["Adidas Stan Smith", "Adidas", "sports-shoes", 8999, 10999, 4.5, 5430, 90, "Timeless tennis sneaker in leather.", ["White"]],
  // ── Cricket ────────────────────────────────────────────
  ["SG Cricket Bat", "SG", "cricket", 3499, 5499, 4.4, 5430, 120, "Grade-1 English willow bat, full size.", ["Natural"]],
  ["SS Cricket Helmet", "SS", "cricket", 1999, 3499, 4.3, 2340, 100, "Full-protection cricket helmet with steel grill.", ["Black"]],
  ["Nivia Cricket Ball Pack", "Nivia", "cricket", 899, 1499, 4.3, 6540, 250, "Pack of 4 cork tennis balls for practice.", ["Red"]],
  ["GM T20 Cricket Bat", "GM", "cricket", 6999, 8999, 4.5, 980, 40, "Pro-grade T20 bat with power sweet spot.", ["Natural"]],
  // ── Cycling ────────────────────────────────────────────
  ["Hero Sprint Cycle", "Hero", "cycling", 8499, 11999, 4.2, 2340, 60, "26-inch steel mountain bike, 21-speed.", ["Black"]],
  ["Firefox Cyclone", "Firefox", "cycling", 15499, 19999, 4.3, 1230, 40, "Dual-suspension mountain bike, 21-speed.", ["Red"]],
  ["Btwin Rockrider 340", "Btwin", "cycling", 8999, 11999, 4.4, 3210, 70, "Hardtail MTB with 24-speed drivetrain.", ["Grey"]],
  ["Cycle Helmet with Light", "WOF", "cycling", 999, 1799, 4.2, 5430, 200, "Ventilated road helmet with rear LED.", ["Black"]],
  // ── Toys ───────────────────────────────────────────────
  ["Lego Technic Sports Car", "Lego", "toys", 5499, 6999, 4.7, 2340, 80, "421-part building set, ages 9+.", ["Red"]],
  ["Barbie Dreamhouse", "Mattel", "toys", 12499, 14999, 4.6, 980, 25, "Three-storey dream house with 10 rooms.", ["Pink"]],
  ["Hot Wheels 20-Car Pack", "Mattel", "toys", 1999, 2999, 4.5, 5430, 200, "Assorted die-cast cars, 20 pack.", ["Multicolor"]],
  ["NERF Elite Blaster", "Hasbro", "toys", 1499, 2499, 4.4, 6540, 180, "Motorised blaster, fires up to 90ft.", ["Blue"]],
  ["Monopoly Classic Board Game", "Hasbro", "toys", 699, 999, 4.5, 23450, 300, "The classic property trading board game.", ["Multicolor"]],
  ["Rubik's Cube 3x3", "Rubik's", "toys", 299, 499, 4.3, 32100, 500, "Original speed cube, smooth turning.", ["Multicolor"]],
  // ── Baby Care ──────────────────────────────────────────
  ["Fisher-Price Baby Bouncer", "Fisher-Price", "baby-care", 3999, 5999, 4.5, 3210, 90, "Soothing vibrations, 2 reclining positions.", ["Grey"]],
  ["MamyPoko Pants Diapers", "MamyPoko", "baby-care", 999, 1499, 4.5, 23450, 350, "Extra absorbent pants, pack of 64.", ["White"]],
  ["Johnson's Baby Lotion", "Johnson's", "baby-care", 349, 549, 4.4, 32100, 400, "24-hour moisture baby lotion, 400ml.", ["White"]],
  ["Chicco Stroller", "Chicco", "baby-care", 12999, 16999, 4.5, 980, 30, "Lightweight foldable stroller, 3-point harness.", ["Grey"]],
  ["Pampers Premium Pants", "Pampers", "baby-care", 1099, 1599, 4.5, 15400, 300, "Diaper pants with 12-hour absorption.", ["White"]],
  // ── Snacks & Beverages ────────────────────────────────
  ["Lay's Classic Chips", "Lay's", "snacks-beverages", 20, 30, 4.2, 98700, 1000, "Classic salted potato chips, 52g pack.", ["Classic"]],
  ["Oreo Cookies", "Oreo", "snacks-beverages", 50, 75, 4.5, 87650, 900, "Chocolate sandwich cookies, 120g.", ["Chocolate"]],
  ["Red Bull Energy Drink", "Red Bull", "snacks-beverages", 115, 140, 4.2, 54300, 800, "Energy drink 250ml can, 4 pack.", ["Classic"]],
  ["Nescafé Classic 100g", "Nescafé", "snacks-beverages", 599, 799, 4.4, 43200, 700, "Roasted and ground instant coffee, 100g.", ["Classic"]],
  ["Cadbury Dairy Milk", "Cadbury", "snacks-beverages", 140, 175, 4.6, 76500, 950, "Smooth milk chocolate bar, 118g.", ["Milk"]],
  ["Haldiram's Bhujia", "Haldiram's", "snacks-beverages", 65, 90, 4.4, 65400, 850, "Crispy bhujia sev namkeen, 200g.", ["Spicy"]],
  ["Kurkure Masala Munch", "Kurkure", "snacks-beverages", 20, 30, 4.2, 87650, 1100, "Crunchy masala puffs, 65g.", ["Masala"]],
  // ── Staples & Oil ──────────────────────────────────────
  ["Aashirvaad Atta 5kg", "Aashirvaad", "staples-oil", 199, 255, 4.4, 54300, 800, "Chakki fresh whole wheat flour, 5kg.", ["Wheat"]],
  ["Fortune Sunflower Oil 1L", "Fortune", "staples-oil", 195, 235, 4.3, 43200, 750, "Refined sunflower oil, 1 litre.", ["Sunflower"]],
  ["Tata Salt 1kg", "Tata", "staples-oil", 26, 35, 4.4, 76500, 1000, "Vacuum-evaporated iodised salt, 1kg.", ["Iodised"]],
  ["Daawat Basmati Rice 5kg", "Daawat", "staples-oil", 899, 1199, 4.5, 23400, 500, "Premium long grain basmati rice, 5kg.", ["Basmati"]],
  ["Maggi Noodles Pack", "Nestlé", "staples-oil", 30, 40, 4.4, 87650, 1100, "Instant masala noodles, pack of 8.", ["Masala"]],
  // ── Dairy & Bakery ─────────────────────────────────────
  ["Amul Butter 500g", "Amul", "dairy-bakery", 54, 60, 4.5, 65400, 900, "Creamy table butter, 500g pack.", ["Salted"]],
  ["Britannia Bread", "Britannia", "dairy-bakery", 35, 45, 4.3, 54300, 800, "Soft milk bread loaf, 400g.", ["White"]],
  ["Mother Dairy Curd", "Mother Dairy", "dairy-bakery", 35, 50, 4.3, 43200, 750, "Fresh set curd, 400g cup.", ["Fresh"]],
  ["Amul Cheese Slices", "Amul", "dairy-bakery", 180, 215, 4.5, 32100, 650, "Processed cheese slices, 200g.", ["Processed"]],
  ["McCain French Fries", "McCain", "dairy-bakery", 199, 299, 4.2, 12300, 400, "Crinkle cut potato fries, 750g.", ["Crinkle"]],
  // ── Car Electronics ────────────────────────────────────
  ["Blaupunkt 2DIN Stereo", "Blaupunkt", "car-electronics", 3499, 4999, 4.3, 2340, 60, "2DIN touchscreen car stereo with BT.", ["Black"]],
  ["Philips H4 Headlight Bulb", "Philips", "car-electronics", 899, 1299, 4.4, 5430, 150, "Crystal vision halogen headlamp bulb.", ["White"]],
  ["70mai Dash Cam", "70mai", "car-electronics", 3999, 5999, 4.4, 3210, 80, "Full HD dash cam with 3D DSR.", ["Black"]],
  ["BOSCH Air Filter", "Bosch", "car-electronics", 499, 799, 4.4, 6540, 200, "High-quality engine air filter.", ["Standard"]],
  // ── Car Care ───────────────────────────────────────────
  ["3M Car Wax Polish", "3M", "car-care", 999, 1499, 4.4, 5430, 150, "Premium car polish with UV protection.", ["Liquid"]],
  ["Formula 1 Car Shampoo", "Formula 1", "car-care", 549, 899, 4.3, 6540, 180, "High-foam car wash shampoo, 1L.", ["Citrus"]],
  ["Sonax Interior Cleaner", "Sonax", "car-care", 699, 1099, 4.4, 2340, 120, "Multi-purpose interior foam cleaner.", ["Cleaner"]],
  ["Michelin Tyre Inflator", "Michelin", "car-care", 2499, 3499, 4.4, 1230, 70, "Portable digital tyre inflator with pump.", ["Black"]],
  // ── Books ──────────────────────────────────────────────
  ["Atomic Habits", "James Clear", "books", 499, 699, 4.7, 23450, 300, "An easy & proven way to build good habits and break bad ones.", ["Paperback"]],
  ["Rich Dad Poor Dad", "Robert Kiyosaki", "books", 299, 499, 4.5, 54300, 400, "What the rich teach their kids about money.", ["Paperback"]],
  ["Wings of Fire", "APJ Abdul Kalam", "books", 279, 399, 4.8, 43200, 350, "An autobiography of the missile man of India.", ["Paperback"]],
  ["The Alchemist", "Paulo Coelho", "books", 249, 399, 4.6, 32100, 280, "A fable about following your dream.", ["Paperback"]],
  ["The Psychology of Money", "Morgan Housel", "books", 349, 499, 4.7, 32100, 250, "Timeless lessons on wealth, greed, and happiness.", ["Hardcover"]],
  // ── Stationery ─────────────────────────────────────────
  ["Camlin Geometry Box", "Camlin", "stationery", 199, 349, 4.3, 5430, 300, "Full geometry box with compass and set squares.", ["Blue"]],
  ["Parker Vector Fountain Pen", "Parker", "stationery", 499, 799, 4.4, 2340, 150, "Classic fountain pen with fine nib.", ["Black"]],
  ["Classmate Notebooks Pack", "Classmate", "stationery", 299, 499, 4.4, 6540, 350, "Pack of 6 long notebook, 240 pages.", ["Multicolor"]],
  ["Faber-Castell Colour Pencils", "Faber-Castell", "stationery", 449, 699, 4.5, 4320, 200, "Set of 36 watercolour pencils.", ["Assorted"]],
  ["Reynolds Gel Pens", "Reynolds", "stationery", 199, 349, 4.3, 9870, 400, "Pack of 10 blue gel pens, 0.5mm.", ["Blue"]],
  // ── Dog Supplies ───────────────────────────────────────
  ["Pedigree Dog Food 3kg", "Pedigree", "dog-supplies", 1899, 2499, 4.4, 2340, 200, "Adult chicken & vegetable dry dog food.", ["Chicken"]],
  ["Drools Adult Dog Food", "Drools", "dog-supplies", 2149, 2799, 4.3, 1870, 180, "High-protein chicken dry food, 3kg.", ["Chicken"]],
  ["Dog Leash & Collar Set", "Happy Pet", "dog-supplies", 499, 799, 4.2, 2340, 150, "Adjustable nylon leash with collar.", ["Red", "Blue"]],
  ["Dog Grooming Kit", "PetGroom", "dog-supplies", 1299, 1999, 4.3, 1230, 100, "Brush, comb, nail clipper and shampoo set.", ["Multicolor"]],
  // ── Cat Supplies ───────────────────────────────────────
  ["Whiskas Adult Cat Food", "Whiskas", "cat-supplies", 899, 1299, 4.4, 1870, 180, "Tuna flavour adult cat food, 1.2kg.", ["Tuna"]],
  ["Me-O Cat Food", "Me-O", "cat-supplies", 749, 1099, 4.3, 2340, 200, "Ocean fish flavour dry cat food, 1.4kg.", ["Fish"]],
  ["Cat Litter Sand", "Happy Cat", "cat-supplies", 999, 1499, 4.3, 3210, 250, "Clumping bentonite cat litter, 10kg.", ["Unscented"]],
  ["Cat Toy Bundle", "PetGroom", "cat-supplies", 349, 599, 4.2, 5430, 300, "Set of 6 interactive cat toys.", ["Assorted"]],
  // ── Supplements ────────────────────────────────────────
  ["MuscleBlaze Whey Protein", "MuscleBlaze", "supplements", 2499, 3499, 4.5, 6540, 150, "24g protein per scoop, 1kg, chocolate.", ["Chocolate"]],
  ["HealthKart Omega-3", "HealthKart", "supplements", 499, 899, 4.3, 4320, 200, "Fish oil softgels, 60 capsules.", ["Capsules"]],
  ["Himalaya Ashwagandha", "Himalaya", "supplements", 349, 599, 4.4, 5430, 250, "Stress relief ayurvedic tablets, 60 tabs.", ["Tablets"]],
  ["GNC Pro Performance Whey", "GNC", "supplements", 4999, 6499, 4.6, 2340, 80, "25g protein, 4.5kg premium whey.", ["Vanilla"]],
  ["Dabur Chyawanprash", "Dabur", "supplements", 499, 699, 4.5, 8760, 300, "Immunity booster ayurvedic jam, 1kg.", ["Original"]],
  // ── Health Devices ─────────────────────────────────────
  ["Omron BP Monitor", "Omron", "health-devices", 2599, 3499, 4.5, 6540, 150, "Digital automatic blood pressure monitor.", ["White"]],
  ["Dr. Morepen Thermometer", "Dr. Morepen", "health-devices", 499, 899, 4.3, 9870, 300, "Non-contact infrared digital thermometer.", ["White"]],
  ["Philips Glucometer", "Philips", "health-devices", 1499, 1999, 4.3, 5430, 200, "Blood glucose monitor with 25 strips.", ["White"]],
  ["Dr Trust Pulse Oximeter", "Dr. Trust", "health-devices", 1499, 2499, 4.4, 6540, 180, "Fingertip SpO2 monitor with OLED display.", ["White"]],
  ["Lifelong Massage Gun", "Lifelong", "health-devices", 2999, 4999, 4.4, 3210, 100, "4-speed percussive deep tissue massager.", ["Black"]],
  // ── Guitars ────────────────────────────────────────────
  ["Fender Squier Stratocaster", "Fender", "guitars", 18999, 24999, 4.5, 320, 15, "Electric guitar, rosewood fretboard, 3 single coils.", ["Sunburst"]],
  ["Yamaha F310", "Yamaha", "guitars", 9999, 12999, 4.5, 1230, 40, "Full-size acoustic guitar, spruce top.", ["Natural"]],
  ["Kadence Acoustic Guitar", "Kadence", "guitars", 4999, 6999, 4.3, 2340, 60, "Cutaway acoustic guitar with free kit.", ["Natural"]],
  ["Epiphone Les Paul", "Epiphone", "guitars", 29999, 34999, 4.6, 210, 10, "Electric guitar, humbuckers, iconic body.", ["Heritage Cherry"]],
  // ── Keyboards & Synths ────────────────────────────────
  ["Yamaha PSR-E273", "Yamaha", "keyboards-synths", 15999, 18999, 4.5, 540, 20, "61-key portable keyboard with 400 tones.", ["Black"]],
  ["Casio CT-S300", "Casio", "keyboards-synths", 12999, 14999, 4.4, 430, 25, "61-key slim keyboard, battery powered.", ["Black"]],
  ["Alesis Melody 61", "Alesis", "keyboards-synths", 8999, 11999, 4.3, 320, 30, "61-key beginner keyboard with lessons.", ["Black"]],
  // ── Gaming Consoles ────────────────────────────────────
  ["PlayStation 5 Slim Disc", "Sony", "gaming-consoles", 54990, 59990, 4.7, 2340, 40, "Next-gen console with ultra-fast SSD and DualSense controller.", ["Standard"]],
  ["Xbox Series X", "Microsoft", "gaming-consoles", 54990, 59990, 4.6, 1560, 30, "12 teraflops of power, 4K gaming, Quick Resume.", ["Black"]],
  ["Nintendo Switch OLED", "Nintendo", "gaming-consoles", 26999, 29999, 4.7, 2340, 35, "Vivid 7-inch OLED screen, handheld + docked play.", ["White"]],
  ["PlayStation DualSense Controller", "Sony", "gaming-consoles", 5999, 7499, 4.6, 5430, 120, "Adaptive triggers, haptic feedback, built-in mic.", ["White"]],
  ["Xbox Wireless Controller", "Microsoft", "gaming-consoles", 4999, 5999, 4.5, 6540, 150, "Textured grips, share button, Bluetooth enabled.", ["Black"]],
  ["Steam Deck 256GB", "Valve", "gaming-consoles", 39999, 44999, 4.5, 540, 12, "Handheld PC gaming with your entire Steam library.", ["Black"]],
  ["boAt Immortal 1300 Controller", "boAt", "gaming-consoles", 2999, 4999, 4.2, 3210, 90, "Wireless gamepad with RGB lighting and turbo mode.", ["Black"]],
  // ── Computer Peripherals ───────────────────────────────
  ["Logitech MX Master 3S", "Logitech", "computer-peripherals", 7995, 9995, 4.7, 4320, 80, "8K DPI sensor, silent clicks, MagSpeed scrolling.", ["Graphite"]],
  ["Logitech G102 LIGHTSYNC Mouse", "Logitech", "computer-peripherals", 1299, 1799, 4.4, 23450, 400, "8,000 DPI gaming mouse with RGB.", ["Black"]],
  ["Keychron K2 Mechanical Keyboard", "Keychron", "computer-peripherals", 7999, 9999, 4.6, 1230, 60, "Hot-swappable 75% keyboard, Bluetooth + wired.", ["Gateron Red"]],
  ["Samsung T7 1TB Portable SSD", "Samsung", "computer-peripherals", 10999, 12999, 4.7, 3210, 70, "Up to 1050MB/s, USB 3.2 Gen 2, pocket-sized.", ["Black"]],
  ["BenQ GW2480 24-inch Monitor", "BenQ", "computer-peripherals", 12999, 14999, 4.4, 2340, 50, "Full HD IPS panel with eye-care technology.", ["Black"]],
  ["Cooler Master 650W PSU", "Cooler Master", "computer-peripherals", 5999, 7999, 4.4, 1230, 45, "80+ Bronze certified modular power supply.", ["Black"]],
  // ── Networking & Wi-Fi ─────────────────────────────────
  ["TP-Link Archer AX55 Router", "TP-Link", "networking-wi-fi", 5999, 7999, 4.4, 4320, 80, "AX3000 dual-band gigabit Wi-Fi 6 router.", ["Black"]],
  ["TP-Link Deco X20 Mesh", "TP-Link", "networking-wi-fi", 9999, 12999, 4.5, 1230, 40, "Whole-home mesh Wi-Fi 6, 2-pack, app control.", ["White"]],
  ["Netgear Nighthawk RAX40", "Netgear", "networking-wi-fi", 15999, 19999, 4.5, 650, 25, "Wi-Fi 6 router with 4-stream AX3000 speeds.", ["Black"]],
  ["JioFi 5G Hotspot", "Jio", "networking-wi-fi", 3499, 4499, 4.2, 5430, 90, "Pocket-sized 5G Wi-Fi hotspot with long battery.", ["White"]],
  ["D-Link Range Extender", "D-Link", "networking-wi-fi", 1499, 2499, 4.1, 3210, 120, "AC750 dual-band Wi-Fi range extender.", ["White"]],
  // ── Ethnic Wear ────────────────────────────────────────
  ["Men's Kurta Set", "Fabindia", "ethnic-wear", 1499, 2499, 4.4, 5430, 150, "Cotton straight-fit kurta with pyjama.", ["White"]],
  ["Kunal Anarkali Suit", "Manyavar", "ethnic-wear", 2999, 4999, 4.5, 2340, 80, "Chanderi anarkali suit with gota work.", ["Gold"]],
  ["Silk Blend Banarasi Saree", "Biba", "ethnic-wear", 1999, 3999, 4.4, 3210, 100, "Handloom silk-blend saree with zari border.", ["Maroon"]],
  ["Women's Lehenga Choli", "Libas", "ethnic-wear", 3999, 6999, 4.5, 980, 40, "Embroidered lehenga set with dupatta.", ["Peacock"]],
  ["Nehru Jacket", "Raymond", "ethnic-wear", 1999, 3499, 4.3, 1230, 60, "Tailored Nehru jacket, self-fabric buttons.", ["Black"]],
  ["Chikankari Cotton Kurta", "Vishudh", "ethnic-wear", 1299, 2499, 4.4, 4320, 140, "Hand-embroidered chikankari kurta, breathable.", ["Ivory"]],
  ["Embroidered Anarkali Gown", "Soch", "ethnic-wear", 3499, 5499, 4.4, 1230, 50, "Floor-length anarkali gown with sequin work.", ["Burgundy"]],
  // ── Winter Wear ────────────────────────────────────────
  ["Puffer Jacket", "U.S. Polo Assn", "winter-wear", 2499, 4999, 4.4, 3210, 80, "Quilted insulated puffer, water-resistant.", ["Navy"]],
  ["Wool Overcoat", "Arrow", "winter-wear", 4999, 8999, 4.4, 1230, 40, "Tailored wool-blend overcoat, slim fit.", ["Charcoal"]],
  ["Men's Sweater", "Peter England", "winter-wear", 1499, 2999, 4.3, 4320, 120, "Knitted wool-blend crew-neck sweater.", ["Maroon"]],
  ["Sweatshirt", "H&M", "winter-wear", 1299, 2499, 4.3, 6540, 150, "Fleece-lined hooded sweatshirt.", ["Grey"]],
  ["Women's Cardigan", "Vero Moda", "winter-wear", 1799, 2999, 4.3, 2340, 90, "Open-front knit cardigan with long sleeves.", ["Beige"]],
  ["Thermal Innerwear Set", "Jockey", "winter-wear", 899, 1599, 4.4, 8760, 250, "Warm cotton thermals for winter comfort.", ["Black"]],
  ["Kids' Winter Jacket", "H&M", "winter-wear", 1699, 2999, 4.3, 2340, 100, "Warm padded kids' jacket with hood.", ["Red"]],
  // ── Kids' Fashion ──────────────────────────────────────
  ["Kids' Denim Jacket", "Levi's", "kids-fashion", 1499, 2499, 4.3, 1230, 60, "Classic denim trucker jacket for kids.", ["Blue"]],
  ["Girls' Printed Frock", "H&M", "kids-fashion", 999, 1999, 4.3, 2340, 90, "Soft cotton floral frock, a-line fit.", ["Pink"]],
  ["Boys' Shirt Set", "Allen Solly", "kids-fashion", 1199, 2199, 4.3, 2340, 100, "Two-piece shirt and trouser set.", ["Light Blue"]],
  ["Kids' Sports Shoes", "Puma", "kids-fashion", 1999, 3499, 4.4, 3210, 100, "Breathable running shoes for kids.", ["White/Red"]],
  ["Baby Romper Set", "Cutewalk", "kids-fashion", 699, 1299, 4.3, 5430, 150, "Comfy cotton romper set, pack of 3.", ["Multicolor"]],
  // ── Home Appliances ────────────────────────────────────
  ["LG 6.5kg Front Load Washer", "LG", "home-appliances", 28990, 34990, 4.5, 2340, 30, "Smart front-load washing machine with AI DD.", ["White"]],
  ["Samsung 236L Refrigerator", "Samsung", "home-appliances", 23490, 27990, 4.4, 3210, 40, "Double-door fridge, smart converter compressor.", ["Silver"]],
  ["LG 28L Convection Microwave", "LG", "home-appliances", 9999, 12999, 4.4, 5430, 50, "Convection oven with 10 auto-cook menus.", ["Black"]],
  ["Voltas 1.5T Inverter AC", "Voltas", "home-appliances", 35990, 42990, 4.4, 1870, 25, "Adjustable inverter split AC, 4-star rating.", ["White"]],
  ["IFB 13-Place Dishwasher", "IFB", "home-appliances", 39990, 45990, 4.3, 540, 12, "Freestanding dishwasher with fruit wash cycle.", ["Silver"]],
  ["Symphony 55L Air Cooler", "Symphony", "home-appliances", 11999, 14999, 4.3, 2340, 40, "Honeycomb pad air cooler, 1600 CFM.", ["Blue"]],
  ["Havells 1200W Iron", "Havells", "home-appliances", 899, 1499, 4.4, 9870, 250, "Dry steam iron with ceramic soleplate.", ["Blue"]],
  // ── Bedding ────────────────────────────────────────────
  ["700 GSM Microfiber Comforter", "SleepyHead", "bedding", 2999, 4999, 4.4, 2340, 60, "Ultra-soft double-size comforter, washable.", ["White"]],
  ["Cotton King Size Bedsheet", "HomeCentre", "bedding", 999, 1799, 4.3, 5430, 150, "Pure cotton fitted bedsheet with pillow covers.", ["Beige"]],
  ["Memory Foam Pillow", "SleepyHead", "bedding", 999, 1999, 4.4, 6540, 200, "Contour memory foam pillow with cooling cover.", ["White"]],
  ["Fleece Blanket", "HomeCentre", "bedding", 799, 1499, 4.3, 4320, 150, "Warm fleece throw blanket, 3 sizes.", ["Grey"]],
  ["Quilted Mattress Protector", "SleepyHead", "bedding", 1499, 2499, 4.3, 1230, 80, "Waterproof quilted protector, elastic straps.", ["White"]],
  ["Duvet Set with Cover", "HomeCentre", "bedding", 4999, 7999, 4.4, 1230, 50, "Premium duvet with soft cotton cover.", ["Ivory"]],
  // ── Lighting ───────────────────────────────────────────
  ["Philips Smart LED Bulb", "Philips", "lighting", 499, 899, 4.3, 23450, 400, "Wi-Fi smart bulb, 16 million colours.", ["White"]],
  ["Wipro LED Strip Lights", "Wipro", "lighting", 799, 1499, 4.3, 12300, 250, "5m RGB LED strip with music sync.", ["Multicolor"]],
  ["Syska Table Lamp", "Syska", "lighting", 899, 1499, 4.2, 5430, 200, "Adjustable desk lamp with 3 colour modes.", ["Black"]],
  ["Havells LED Spotlight Set", "Havells", "lighting", 1299, 1999, 4.2, 2340, 120, "Set of 4 warm-white recessed spotlights.", ["Warm White"]],
  ["Havells Crystal Chandelier", "Havells", "lighting", 4999, 6999, 4.3, 540, 30, "6-light crystal chandelier for living rooms.", ["Champagne"]],
  ["Panasonic Rechargeable Lamp", "Panasonic", "lighting", 1299, 1799, 4.3, 2340, 90, "Emergency rechargeable lamp with USB out.", ["White"]],
  // ── Bath & Body ────────────────────────────────────────
  ["Dove Body Wash 600ml", "Dove", "bath-body", 349, 599, 4.4, 23450, 500, "Deep moisture body wash for all skin types.", ["White"]],
  ["Nivea Shower Gel 400ml", "Nivea", "bath-body", 299, 499, 4.3, 18750, 450, "Care & protect shower gel with 72h deo.", ["Blue"]],
  ["Aveeno Daily Moisturising Lotion", "Aveeno", "bath-body", 999, 1499, 4.5, 5430, 180, "Colloidal oatmeal lotion for dry skin, 354ml.", ["White"]],
  ["Bath & Body Works Mist", "Bath & Body Works", "bath-body", 2499, 2999, 4.5, 2340, 100, "Japanese cherry blossom body mist, 236ml.", ["Pink"]],
  ["Dettol Handwash Refill 6L", "Dettol", "bath-body", 199, 349, 4.4, 32100, 600, "Antibacterial liquid handwash refill.", ["Orange"]],
  ["Cinthol Deo Soap Pack", "Cinthol", "bath-body", 219, 349, 4.3, 23450, 500, "Pack of 4 original deo soaps, 100g each.", ["Blue"]],
  // ── Beauty Appliances ──────────────────────────────────
  ["Philips Hair Straightener", "Philips", "beauty-appliances", 1999, 2999, 4.3, 5430, 150, "Ceramic straightener with quick heat-up.", ["Purple"]],
  ["Havells Professional Hair Dryer", "Havells", "beauty-appliances", 1299, 1999, 4.3, 3210, 120, "2000W ionic hair dryer with diffuser.", ["Black"]],
  ["Philips Beard Trimmer", "Philips", "beauty-appliances", 1499, 2499, 4.4, 9870, 250, "Precision trimmer with 20 length settings.", ["Black"]],
  ["Braun Silk-épil Epilator", "Braun", "beauty-appliances", 3499, 4999, 4.2, 1230, 60, "Wet & dry epilator with skin shield.", ["Purple"]],
  ["Oral-B Pro 2 Toothbrush", "Oral-B", "beauty-appliances", 2999, 3999, 4.5, 6540, 180, "2D oscillating-rotating electric toothbrush.", ["Blue"]],
  ["Philips Sonicare Clean", "Philips", "beauty-appliances", 3999, 4999, 4.5, 3210, 120, "Sonic electric toothbrush with timer.", ["White"]],
  // ── Grooming ───────────────────────────────────────────
  ["Gillette Mach3 Turbo Razor", "Gillette", "grooming", 349, 599, 4.4, 23450, 500, "5-blade razor with Lubrastrip, pack of 4.", ["Blue"]],
  ["Philips S1100 Shaver", "Philips", "grooming", 999, 1499, 4.3, 5430, 200, "Rotary shaver, cordless with pop-up trimmer.", ["Black"]],
  ["BIC Comfort 5 Razor", "BIC", "grooming", 249, 399, 4.2, 12300, 350, "5-blade refillable razors, pack of 4.", ["Silver"]],
  ["Godrej Shaving Kit", "Godrej", "grooming", 199, 349, 4.2, 6540, 250, "Complete grooming kit with shave cream.", ["Green"]],
  ["Wild Stone Deo Gift Set", "Wild Stone", "grooming", 799, 1499, 4.3, 3210, 150, "Perfume + deodorant + talc gift box.", ["Edge"]],
  ["Vega Grooming Combo", "Vega", "grooming", 1299, 2199, 4.2, 2340, 90, "Trimmer with grooming kit for men.", ["Black"]],
  // ── Camping & Outdoors ─────────────────────────────────
  ["Quechua 2-Person Tent", "Decathlon", "camping-outdoors", 4999, 6999, 4.4, 1230, 40, "Waterproof 2-person pop-up tent.", ["Blue"]],
  ["Coleman Sleeping Bag", "Coleman", "camping-outdoors", 2499, 3499, 4.3, 2340, 60, "Comfort-rated mummy sleeping bag.", ["Grey"]],
  ["Wildcraft 60L Trekking Backpack", "Wildcraft", "camping-outdoors", 2999, 4999, 4.4, 4320, 80, "Ergonomic backpack with rain cover.", ["Orange"]],
  ["Coleman Camping Chair", "Coleman", "camping-outdoors", 1299, 1999, 4.2, 2340, 90, "Foldable camping chair with cup holder.", ["Green"]],
  ["Headlamp 200 Lumens", "WOF", "camping-outdoors", 699, 1199, 4.3, 5430, 200, "Rechargeable LED headlamp, red mode.", ["Black"]],
  ["Milton Insulated Bottle 1L", "Milton", "camping-outdoors", 899, 1499, 4.4, 6540, 180, "Stainless steel thermosteel bottle.", ["Silver"]],
  // ── Swimming ───────────────────────────────────────────
  ["Speedo Goggles", "Speedo", "swimming", 999, 1499, 4.3, 2340, 100, "Anti-fog swimming goggles, UV protection.", ["Black/Blue"]],
  ["Speedo Swim Cap", "Speedo", "swimming", 349, 599, 4.2, 3210, 150, "Silicone swim cap, one-size-fits-all.", ["Blue"]],
  ["Arena Swim Trunks", "Arena", "swimming", 1499, 2499, 4.3, 1230, 80, "Quick-dry swim trunks, adjustable drawstring.", ["Navy"]],
  ["Decathlon Kickboard", "Decathlon", "swimming", 699, 999, 4.2, 2340, 120, "Foam swim kickboard for training.", ["Yellow"]],
  ["Swim Nose Clip Set", "Decathlon", "swimming", 199, 349, 4.1, 5430, 300, "Nose clip and ear plugs for swimming.", ["White"]],
  // ── Indoor Sports ──────────────────────────────────────
  ["Stag Table Tennis Racket", "Stag", "indoor-sports", 899, 1499, 4.2, 5430, 180, "ITTF approved paddle with case.", ["Red/Black"]],
  ["Synco Wooden Carrom Board", "Synco", "indoor-sports", 1999, 2999, 4.3, 2340, 100, "25mm seasoned board with striker set.", ["Natural"]],
  ["Wooden Chess Board", "Synco", "indoor-sports", 1499, 2499, 4.3, 1230, 80, "Foldable chess set with storage.", ["Walnut"]],
  ["Nivia Dart Board Set", "Nivia", "indoor-sports", 699, 1199, 4.2, 2340, 120, "12-inch dartboard with 6 darts.", ["Black"]],
  ["Nivia Badminton Net", "Nivia", "indoor-sports", 899, 1499, 4.2, 1230, 90, "Portable foldable badminton net.", ["Green"]],
  // ── Educational Toys ───────────────────────────────────
  ["Melissa & Doug Puzzle Set", "Melissa & Doug", "educational-toys", 1499, 2499, 4.5, 2340, 100, "12-piece wooden puzzles for toddlers.", ["Multicolor"]],
  ["Frank Alphabet Board", "Frank", "educational-toys", 499, 899, 4.3, 5430, 250, "Wooden alphabet tracing board.", ["Natural"]],
  ["Skillmatics Write & Wipe Kit", "Skillmatics", "educational-toys", 1999, 2999, 4.3, 1230, 80, "Reusable learning mats for ages 3-6.", ["Multicolor"]],
  ["CREST Science Kit", "CREST", "educational-toys", 1499, 2499, 4.4, 2340, 120, "100+ STEM experiments for kids.", ["Multicolor"]],
  ["Wooden Blocks Set", "Frank", "educational-toys", 999, 1799, 4.3, 3210, 150, "100-piece colourful building blocks.", ["Multicolor"]],
  ["Electronic Learning Toy", "Mattel", "educational-toys", 2499, 3999, 4.3, 1230, 60, "Interactive talking alphabet toy.", ["Blue"]],
  // ── Kids' Books ────────────────────────────────────────
  ["Panchatantra Story Book", "Wonder House", "kids-books", 299, 499, 4.6, 5430, 300, "Classic Indian tales, illustrated.", ["Paperback"]],
  ["My First 1000 Words", "Wonder House", "kids-books", 399, 699, 4.5, 4320, 250, "Picture dictionary for early learners.", ["Hardcover"]],
  ["Activity Book Pack", "Dreamland", "kids-books", 499, 899, 4.3, 3210, 200, "Fun activity books with stickers.", ["Paperback"]],
  ["Pop-Up Fairy Tales", "Usborne", "kids-books", 699, 1199, 4.6, 1230, 120, "Interactive pop-up fairy tale classics.", ["Hardcover"]],
  ["Illustrated World Atlas", "DK", "kids-books", 1999, 2999, 4.7, 980, 80, "Visual world atlas for curious kids.", ["Hardcover"]],
  // ── Fruits & Vegetables ────────────────────────────────
  ["Alphonso Mangoes (6 pcs)", "Fresho", "fruits-vegetables", 299, 399, 4.4, 12300, 400, "Premium ratnagiri alphonso mangoes.", ["Premium"]],
  ["Organic Bananas (12 pcs)", "Fresho", "fruits-vegetables", 89, 120, 4.3, 23450, 600, "Farm-fresh organic bananas.", ["Organic"]],
  ["Fresh Tomatoes 1kg", "Fresho", "fruits-vegetables", 40, 60, 4.2, 32100, 700, "Firm vine-ripened tomatoes.", ["Fresh"]],
  ["Onions 1kg", "Fresho", "fruits-vegetables", 35, 50, 4.2, 28700, 700, "Medium-sized red onions.", ["Fresh"]],
  ["Spinach Bunch 250g", "Fresho", "fruits-vegetables", 30, 45, 4.1, 15400, 500, "Fresh leafy palak, cleaned bunch.", ["Fresh"]],
  ["Watermelon 4kg", "Fresho", "fruits-vegetables", 149, 199, 4.3, 9870, 300, "Sweet red-fleshed watermelon.", ["Fresh"]],
  ["Avocado Pack of 4", "Fresho", "fruits-vegetables", 399, 599, 4.3, 5430, 200, "Ripe hass avocados, ready to eat.", ["Hass"]],
  // ── Tea & Coffee ───────────────────────────────────────
  ["Tata Tea Gold 500g", "Tata", "tea-coffee", 265, 315, 4.4, 23450, 600, "Premium leaf tea blend, 500g pack.", ["Gold"]],
  ["Brooke Bond Red Label 500g", "Brooke Bond", "tea-coffee", 250, 300, 4.3, 21300, 600, "Classic strong tea blend.", ["Red"]],
  ["Bru Instant Coffee 100g", "Bru", "tea-coffee", 349, 449, 4.3, 18750, 500, "Gold roast instant coffee, rich aroma.", ["Gold"]],
  ["Davidoff Espresso 57", "Davidoff", "tea-coffee", 899, 1199, 4.5, 5430, 200, "Premium espresso ground coffee, 100g.", ["Espresso"]],
  ["Lipton Green Tea 100 Bags", "Lipton", "tea-coffee", 399, 599, 4.4, 8760, 300, "Natural green tea with antioxidants.", ["Green"]],
  ["MDH Chai Masala", "MDH", "tea-coffee", 99, 149, 4.3, 12300, 400, "Signature tea masala blend, 100g.", ["Masala"]],
  // ── Tyres & Wheels ─────────────────────────────────────
  ["MRF Tubeless Car Tyre", "MRF", "tyres-wheels", 5999, 7499, 4.4, 2340, 80, "205/55 R16 radial tubeless tyre.", ["205/55 R16"]],
  ["CEAT Tubeless Tyre", "CEAT", "tyres-wheels", 5499, 6999, 4.3, 1870, 70, "185/65 R15 all-season tyre.", ["185/65 R15"]],
  ["Apollo All-Season Tyre", "Apollo", "tyres-wheels", 6499, 7999, 4.3, 1230, 60, "215/60 R16 durable tyre.", ["215/60 R16"]],
  ["MRF Tyre Tube", "MRF", "tyres-wheels", 499, 799, 4.2, 3210, 150, "Bicycle/motorcycle tyre tube.", ["Standard"]],
  ["Alloy Wheel 15-inch", "OZ Racing", "tyres-wheels", 8999, 11999, 4.3, 540, 30, "Silver 5-spoke alloy wheel.", ["Silver"]],
  // ── Auto Parts ─────────────────────────────────────────
  ["Bosch Wiper Blades", "Bosch", "auto-parts", 699, 999, 4.4, 5430, 200, "Quiet-clean windscreen wiper pair.", ["Standard"]],
  ["Philips Crystal Vision Headlamp", "Philips", "auto-parts", 1299, 1799, 4.3, 2340, 120, "Crystal Vision H7 headlight bulbs.", ["White"]],
  ["Castrol Engine Oil 5W-30", "Castrol", "auto-parts", 2499, 3199, 4.5, 5430, 180, "Synthetic engine oil, 5-litre can.", ["5L"]],
  ["Exide Car Battery", "Exide", "auto-parts", 7999, 9999, 4.4, 1230, 50, "12V 60Ah maintenance-free battery.", ["60Ah"]],
  ["Michelin Digital Tyre Inflator", "Michelin", "auto-parts", 2499, 3499, 4.4, 2340, 70, "Digital portable air compressor.", ["Digital"]],
  // ── Art & Craft ────────────────────────────────────────
  ["Camel Sketch Pen Set 24", "Camel", "art-craft", 299, 499, 4.3, 5430, 250, "24 colour sketch pens, fine tip.", ["Assorted"]],
  ["Fevicryl Acrylic Paint Set", "Fevicryl", "art-craft", 449, 699, 4.3, 3210, 200, "18 shades of acrylic colour paints.", ["Assorted"]],
  ["Art Canvas 12x16 (5 pack)", "Fevicryl", "art-craft", 799, 1299, 4.2, 2340, 150, "Stretched canvases for painting.", ["White"]],
  ["Camlin Origami Paper Pack", "Camlin", "art-craft", 149, 249, 4.2, 5430, 300, "Foil and textured origami sheets.", ["Assorted"]],
  ["Parker Calligraphy Set", "Parker", "art-craft", 1299, 1999, 4.4, 1230, 80, "Vector calligraphy fountain pen kit.", ["Black"]],
  ["DOMS Painting Kit", "DOMS", "art-craft", 499, 799, 4.3, 5430, 200, "Beginner oil pastel and colour set.", ["Assorted"]],
  // ── Fish & Aquarium ────────────────────────────────────
  ["AquaZone Aquarium 20L", "AquaZone", "fish-aquarium", 3499, 4999, 4.3, 1230, 50, "Glass tank with filter and LED light.", ["Clear"]],
  ["AquaZone Fish Food Flakes", "AquaZone", "fish-aquarium", 199, 349, 4.3, 2340, 150, "Balanced flakes for tropical fish.", ["Flakes"]],
  ["Aquarium Air Pump", "AquaZone", "fish-aquarium", 499, 799, 4.2, 1230, 100, "Silent dual-outlet air pump.", ["Black"]],
  ["Decorative Aquarium Gravel", "AquaZone", "fish-aquarium", 299, 499, 4.2, 3210, 200, "Coloured pebbles for aquarium base.", ["Multicolor"]],
  ["LED Aquarium Light", "AquaZone", "fish-aquarium", 799, 1199, 4.3, 1230, 90, "Submersible RGB LED light strip.", ["White"]],
  // ── Bird Supplies ──────────────────────────────────────
  ["PetFed Bird Cage", "PetFed", "bird-supplies", 2499, 3999, 4.3, 980, 40, "Spacious cage with perch and feeder.", ["Black"]],
  ["PetFed Parrot Food Mix", "PetFed", "bird-supplies", 499, 799, 4.3, 1230, 80, "Nutritious seed and grain mix.", ["Mixed"]],
  ["PetFed Bird Bath Bowl", "PetFed", "bird-supplies", 349, 599, 4.2, 2340, 120, "Detachable hanging bath bowl.", ["Green"]],
  ["PetFed Bird Feeder", "PetFed", "bird-supplies", 299, 499, 4.2, 3210, 180, "Seed feeder with perch hooks.", ["White"]],
  ["PetFed Bird Toys", "PetFed", "bird-supplies", 199, 349, 4.1, 2340, 150, "Set of 3 hanging chew toys.", ["Assorted"]],
  // ── Ayurveda ───────────────────────────────────────────
  ["Patanjali Chyawanprash", "Patanjali", "ayurveda", 299, 449, 4.3, 5430, 250, "Immunity booster, 1kg bottle.", ["Original"]],
  ["Dabur Triphala Churna", "Dabur", "ayurveda", 249, 399, 4.3, 4320, 200, "Classic triphala detox powder, 200g.", ["Powder"]],
  ["Zandu Pancharishta", "Zandu", "ayurveda", 399, 599, 4.2, 2340, 150, "Ayurvedic tonic for strength, 450ml.", ["Tonic"]],
  ["Himalaya Neem Face Pack", "Himalaya", "ayurveda", 149, 249, 4.2, 6540, 300, "Neem and tulsi herbal face pack.", ["Green"]],
  ["Baidyanath Shankhpushpi", "Baidyanath", "ayurveda", 179, 299, 4.2, 3210, 200, "Brain tonic syrup for memory, 450ml.", ["Syrup"]],
  ["Vedik Roots Ashwagandha", "Vedik Roots", "ayurveda", 349, 599, 4.4, 4320, 180, "Organic ashwagandha capsules, 60 caps.", ["Capsules"]],
  // ── Drums ──────────────────────────────────────────────
  ["Stagg Junior Drum Kit", "Stagg", "drums", 25999, 32999, 4.4, 320, 10, "Complete 5-piece junior drum set.", ["Red"]],
  ["XDrum Cajon", "XDrum", "drums", 4999, 6999, 4.3, 540, 25, "Portable wooden box drum.", ["Natural"]],
  ["Yamaha DTX402 E-Drum", "Yamaha", "drums", 54999, 64999, 4.6, 210, 8, "Compact electronic drum kit.", ["Black"]],
  ["Stagg Drumsticks Pair", "Stagg", "drums", 599, 999, 4.2, 1230, 60, "5A hickory wood drumsticks.", ["Natural"]],
  ["Stagg Practice Pad", "Stagg", "drums", 1299, 1999, 4.3, 540, 40, "8-inch rubber practice pad with stand.", ["Black"]],
  // ── Extra Mobiles & Tablets ────────────────────────────
  ["Google Pixel 8", "Google", "mobiles-tablets", 69999, 75999, 4.6, 1870, 35, "Google Tensor G3, 8GB RAM, 50MP camera.", ["Obsidian", "Hazel"]],
  ["Samsung Galaxy A55 5G", "Samsung", "mobiles-tablets", 33999, 37999, 4.4, 2100, 60, "6.6-inch AMOLED, 50MP triple camera.", ["Awesome Navy"]],
  ["Oppo Reno 12 Pro", "Oppo", "mobiles-tablets", 38999, 42999, 4.4, 1450, 45, "64MP telephoto, 80W SUPERVOOC.", ["Fluid Black"]],
  ["Infinix Note 40 Pro", "Infinix", "mobiles-tablets", 18999, 21999, 4.3, 2340, 80, "120Hz AMOLED, 108MP camera, 68W fast charge.", ["Vintage Green"]],
  ["Xiaomi Pad 6", "Xiaomi", "mobiles-tablets", 26999, 29999, 4.5, 1230, 40, "11-inch 144Hz 2.8K display, Snapdragon 870.", ["Mist Blue"]],
  // ── Extra Laptops ──────────────────────────────────────
  ["HP Omen 16 Gaming", "HP", "laptops-computers", 129990, 149990, 4.4, 430, 15, "RTX 4070, Ryzen 9, 16GB RAM, 1TB SSD.", ["Shadow Black"]],
  ["Acer Swift Go 14", "Acer", "laptops-computers", 54990, 64990, 4.4, 540, 20, "Intel i5 Ultra, OLED display, 16GB RAM.", ["Steel Gray"]],
  ["MSI Katana 15 Gaming", "MSI", "laptops-computers", 104990, 119990, 4.4, 320, 12, "RTX 4060, 144Hz FHD display, 16GB RAM.", ["Black"]],
  ["Dell Inspiron 14 Plus", "Dell", "laptops-computers", 74990, 85990, 4.4, 540, 25, "Intel Core Ultra 7, 16GB RAM, 512GB SSD.", ["Ice Blue"]],
  // ── Extra Audio ────────────────────────────────────────
  ["Apple AirPods Max", "Apple", "headphones-audio", 59900, 62900, 4.6, 1230, 25, "Over-ear headphones with computational audio.", ["Space Gray"]],
  ["Sennheiser Momentum 4", "Sennheiser", "headphones-audio", 25990, 32990, 4.7, 980, 30, "Adaptive noise cancellation, 60hrs battery.", ["Black"]],
  ["JBL Flip 6 Speaker", "JBL", "headphones-audio", 10999, 12999, 4.5, 4320, 60, "Portable waterproof speaker, 12hrs playtime.", ["Red"]],
  ["Marshall Emberton II", "Marshall", "headphones-audio", 16999, 19999, 4.5, 1230, 40, "Compact portable speaker, 30hrs battery.", ["Black"]],
  // ── Extra Watches ──────────────────────────────────────
  ["Seiko 5 Automatic", "Seiko", "watches-accessories", 18990, 22990, 4.6, 980, 30, "Automatic movement, 21 jewels, day-date.", ["Steel"]],
  ["Citizen Eco-Drive", "Citizen", "watches-accessories", 17990, 21990, 4.5, 650, 25, "Solar-powered, never needs a battery.", ["Silver"]],
  ["HMT Janata Watch", "HMT", "watches-accessories", 2999, 3999, 4.3, 2340, 120, "Classic Indian-made mechanical watch.", ["Silver"]],
  ["Tommy Hilfiger Chrono", "Tommy Hilfiger", "watches-accessories", 9999, 14999, 4.4, 540, 30, "Multi-function chronograph watch.", ["Silver"]],
  // ── Extra Bags ─────────────────────────────────────────
  ["Safari 70cm Trolley", "Safari", "bags-luggage", 5999, 8999, 4.4, 2340, 70, "Hard-shell trolley with spinner wheels.", ["Navy"]],
  ["Dell Casual Backpack", "Dell", "bags-luggage", 1499, 2499, 4.3, 5430, 180, "15.6-inch laptop backpack, padded.", ["Black"]],
  ["Urban Forest Sling Bag", "Urban Forest", "bags-luggage", 999, 1799, 4.3, 2340, 120, "Minimal crossbody sling bag.", ["Beige"]],
  ["Safari Laptop Backpack", "Safari", "bags-luggage", 1799, 2999, 4.4, 6540, 200, "Anti-theft backpack with USB port.", ["Black"]],
  // ── Extra Footwear ─────────────────────────────────────
  ["New Balance 574 Classic", "New Balance", "footwear", 7999, 9999, 4.5, 2340, 50, "Iconic retro sneaker in suede.", ["Navy/Red"]],
  ["Nike Revolution 6", "Nike", "footwear", 4995, 6995, 4.4, 6540, 120, "Everyday cushioned running shoe.", ["Black/White"]],
  ["adidas Duramo SL", "Adidas", "footwear", 4499, 6499, 4.3, 5430, 140, "Lightweight training shoe.", ["Cloud White"]],
  ["Fila Women's Sneakers", "Fila", "footwear", 3499, 5499, 4.3, 2340, 100, "Chunky retro sneakers for women.", ["White"]],
  // ── Extra Home Decor & Kitchen ─────────────────────────
  ["Homesake Wall Shelf", "Homesake", "home-decor", 1999, 3499, 4.4, 1230, 60, "Floating wooden wall shelf, 2-tier.", ["Teak"]],
  ["Borosil Glasses Set", "Borosil", "kitchen", 699, 999, 4.4, 6540, 250, "Set of 6 borosilicate glass tumblers.", ["Clear"]],
  ["Butterfly Chimney", "Butterfly", "kitchen", 4999, 6999, 4.3, 2340, 60, "Wall-mounted kitchen chimney 60cm.", ["Silver"]],
  ["Milton Thermosteel Bottle", "Milton", "kitchen", 499, 799, 4.4, 9870, 300, "500ml vacuum flask for hot/cold.", ["Steel"]],
  ["Stovekraft Non-stick Pan", "Stovekraft", "kitchen", 1299, 1999, 4.4, 4320, 200, "Granite-coated kadhai with lid.", ["Granite"]],
  ["The Sleep Company Mattress", "The Sleep Company", "furniture", 14999, 21999, 4.6, 1230, 30, "SmartGRID air-tech king mattress.", ["White"]],
  ["Godrej Interio Bookcase", "Godrej Interio", "furniture", 12999, 17999, 4.3, 430, 15, "5-shelf engineered wood bookcase.", ["Wenge"]],
  // ── Extra Beauty ───────────────────────────────────────
  ["The Ordinary Niacinamide", "The Ordinary", "skin-care", 599, 799, 4.5, 23450, 400, "10% niacinamide + zinc serum, 30ml.", ["Serum"]],
  ["Minimalist Vitamin C", "Minimalist", "skin-care", 699, 999, 4.4, 18750, 350, "10% vitamin C face serum, 30ml.", ["Serum"]],
  ["Plum Green Tea Toner", "Plum", "skin-care", 499, 699, 4.3, 15400, 300, "Alcohol-free green tea toner, 200ml.", ["Toner"]],
  ["Sugar Matte Lipstick", "Sugar", "makeup", 549, 799, 4.3, 12300, 300, "Vegan matte lipstick, transfer-proof.", ["Red"]],
  ["Insight Cosmetics Eyeshadow", "Insight", "makeup", 349, 549, 4.2, 9870, 250, "12-shade palette, highly pigmented.", ["Neutral"]],
  ["Swiss Beauty Compact", "Swiss Beauty", "makeup", 349, 549, 4.2, 6540, 220, "Matte finish compact powder.", ["Natural"]],
  ["WOW Skin Science Serum", "WOW Skin Science", "hair-care", 699, 999, 4.3, 12300, 250, "Onion oil hair serum, 100ml.", ["Hair"]],
  ["Parachute Coconut Oil", "Parachute", "hair-care", 215, 265, 4.4, 23450, 500, "100% pure coconut hair oil, 600ml.", ["Pure"]],
  ["Livon Hair Serum", "Livon", "hair-care", 219, 349, 4.3, 18750, 450, "Anti-frizz leave-in serum, 100ml.", ["Serum"]],
  ["Bella Vita Perfume", "Bella Vita", "fragrances", 999, 1799, 4.4, 5430, 200, "Long-lasting unisex EDP, 100ml.", ["Oud"]],
  ["Ustraa Perfume", "Ustraa", "fragrances", 899, 1499, 4.3, 4320, 180, "Beardo-esque woody fragrance, 100ml.", ["Woody"]],
  ["Engage Perfume", "Engage", "fragrances", 399, 699, 4.3, 9870, 350, "Everyday fresh deodorant perfume.", ["Fresh"]],
  // ── Extra Fitness & Sports ─────────────────────────────
  ["Decathlon Quick-Dry Tee", "Decathlon", "fitness-equipment", 699, 999, 4.3, 12300, 300, "Breathable training t-shirt.", ["Navy"]],
  ["Hercules Grip Trainer", "Hercules", "fitness-equipment", 499, 799, 4.3, 6540, 250, "Adjustable hand grip strengthener.", ["Black"]],
  ["Asics Gel-Excite 10", "Asics", "sports-shoes", 4999, 6999, 4.4, 5430, 110, "Everyday running shoe with GEL.", ["Blue"]],
  ["SG Rubber Cricket Ball", "SG", "cricket", 449, 699, 4.3, 5430, 300, "Leather hard cricket ball.", ["Red"]],
  ["Firefox BMX Cycle", "Firefox", "cycling", 13499, 17999, 4.3, 980, 30, "Stunt BMX bike with pegs.", ["Black"]],
  // ── Extra Books ────────────────────────────────────────
  ["Ikigai", "Francesc Miralles", "books", 349, 499, 4.6, 54300, 500, "The Japanese secret to a long and happy life.", ["Paperback"]],
  ["Deep Work", "Cal Newport", "books", 399, 599, 4.6, 23450, 300, "Rules for focused success in a distracted world.", ["Paperback"]],
  ["Sapiens", "Yuval Noah Harari", "books", 549, 799, 4.7, 32100, 350, "A brief history of humankind.", ["Paperback"]],
  ["Zero to One", "Peter Thiel", "books", 349, 499, 4.5, 18750, 250, "Notes on startups, or how to build the future.", ["Paperback"]],
  ["The Monk Who Sold His Ferrari", "Robin Sharma", "books", 299, 399, 4.5, 23450, 280, "A fable about fulfilling your dreams.", ["Paperback"]],
  // ── Extra Pets & Supplements ───────────────────────────
  ["Royal Canin Dog Food 3kg", "Royal Canin", "dog-supplies", 2799, 3499, 4.5, 2340, 150, "Medium adult dry dog food.", ["Chicken"]],
  ["Purepet Cat Food", "Purepet", "cat-supplies", 849, 1199, 4.3, 2340, 200, "Chicken & rice adult cat food, 1.4kg.", ["Chicken"]],
  ["Optimum Nutrition Whey", "Optimum Nutrition", "supplements", 5499, 6999, 4.7, 6540, 120, "Gold standard 100% whey, 1kg.", ["Double Rich Chocolate"]],
  ["Big Muscles Creatine", "Big Muscles", "supplements", 1299, 1999, 4.4, 5430, 180, "Monohydrate creatine, 300g.", ["Unflavoured"]],
  ["AccuSure Glucometer", "AccuSure", "health-devices", 999, 1499, 4.3, 5430, 200, "Blood glucose monitor with strips.", ["White"]],
];

// Idempotent schema migrations — add new columns to existing tables so the
// app keeps working on a database created before the latest model changes.
async function ensureSchema() {
  const [rows] = await sequelize.query(
    "SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS " +
      "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_details'"
  );
  if (!rows.length) {
    await sequelize.query("ALTER TABLE orders ADD COLUMN payment_details JSON NULL AFTER payment_method");
    console.log("✅ Migration: added orders.payment_details");
  }
}

async function seed() {
  const force = process.argv.includes("--force");
  await sequelize.authenticate();

  if (force) {
    const modelNames = Object.keys(sequelize.models);
    console.log(`♻️  Dropping ${modelNames.length} tables...`);
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await sequelize.drop({ cascade: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    await sequelize.sync();
  } else {
    await sequelize.sync();
  }

  await ensureSchema();

  // 0) Demo accounts — run before the product check so a plain `npm run seed`
  //    still deletes the legacy demo accounts and provisions fresh ones.
  const legacyCustomers = await Customer.findAll({ where: { email: { [Op.like]: "%@shoplogo.com" } } });
  for (const c of legacyCustomers) {
    const orders = await Order.findAll({ where: { customerId: c.id } });
    for (const o of orders) {
      await OrderItem.destroy({ where: { orderId: o.id } });
      await Return.destroy({ where: { orderId: o.id } });
    }
    await Order.destroy({ where: { customerId: c.id } });
    await Review.destroy({ where: { customerId: c.id } });
    await Wishlist.destroy({ where: { customerId: c.id } });
    await Address.destroy({ where: { customerId: c.id } });
    const cart = await Cart.findOne({ where: { customerId: c.id } });
    if (cart) await CartItem.destroy({ where: { cartId: cart.id } });
    await Cart.destroy({ where: { customerId: c.id } });
    await c.destroy();
  }
  if (legacyCustomers.length) {
    console.log(`🗑️  Deleted ${legacyCustomers.length} legacy demo account(s).`);
  }

  // Fresh demo accounts — customers in `customers`, staff in `users`
  const [admin, adminCreated] = await User.findOrCreate({
    where: { email: "admin@flipkart.store" },
    defaults: { name: "Store Admin", email: "admin@flipkart.store", password: "Admin@1234", role: "admin", phone: "+91 90000 00001" },
  });
  const [customer, customerCreated] = await Customer.findOrCreate({
    where: { email: "customer@flipkart.store" },
    defaults: { name: "Demo Customer", email: "customer@flipkart.store", password: "Customer@1234", phone: "+91 90000 00002" },
  });
  const [reviewer, reviewerCreated] = await Customer.findOrCreate({
    where: { email: "reviewer@flipkart.store" },
    defaults: { name: "Reviewer", email: "reviewer@flipkart.store", password: "Reviewer@1234", phone: "+91 90000 00003" },
  });

  if (customerCreated || reviewerCreated) {
    await Cart.create({ customerId: customer.id }).catch(() => {});
    await Cart.create({ customerId: reviewer.id }).catch(() => {});
  }

  await Address.create({
    customerId: customer.id,
    label: "Home",
    fullName: "Demo Customer",
    phone: "+91 90000 00002",
    street: "22 MG Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    zip: "560001",
    country: "India",
    isDefault: true,
  }).catch(() => {});

  console.log("✅ Users: admin@flipkart.store / Admin@1234 (admin) | customer@flipkart.store / Customer@1234 (customer)");

  const existing = await Product.count();
  let created = 0;
  let uniqueBrands = new Set();
  let categoryBySlug = {};

  if (existing > 0 && !force) {
    console.log(`⚠️  Database already has ${existing} products. Skipping category/product reseed and continuing with demo activity data.`);
  } else {
    // 1) Categories
    categoryBySlug = {};
    for (const top of CATEGORY_TREE) {
      const parent = await Category.create({ name: top.name, slug: slugify(top.name), image: top.image });
      categoryBySlug[parent.slug] = parent;
      for (const sub of top.subs) {
        const child = await Category.create({
          name: sub.name,
          slug: slugify(sub.name),
          parentId: parent.id,
          image: parent.image,
        });
        categoryBySlug[child.slug] = child;
      }
    }
    console.log(`✅ Categories: ${CATEGORY_TREE.length} top-level + ${CATEGORY_TREE.reduce((n, c) => n + c.subs.length, 0)} subcategories`);

    // 2) Products
    for (const [name, brand, catSlug, price, originalPrice, rating, reviewCount, stock, description, variants] of PRODUCTS) {
      const category = categoryBySlug[catSlug];
      if (!category) {
        console.warn(`  ⚠️  Missing category "${catSlug}" for "${name}" — skipped.`);
        continue;
      }
      await Product.create({
        name,
        slug: slugify(name),
        brand,
        categoryId: category.id,
        price,
        originalPrice,
        rating,
        reviewCount,
        stockQuantity: stock,
        description,
        variants,
        images: getProductImages(name, slugify(name), catSlug),
        isActive: true,
      });
      uniqueBrands.add(brand);
      created += 1;
    }
    console.log(`✅ Products: ${created} created across ${Object.keys(categoryBySlug).length} categories`);
    console.log(`✅ Brands: ${uniqueBrands.size} unique brands`);
  }

  // 3) Demo customer activity so the admin dashboard has data immediately
  const existingSignup = await SignupLog.count({ where: { customerId: customer.id } });
  if (!existingSignup) {
    await SignupLog.create({
      customerId: customer.id,
      email: customer.email,
      ip: "203.0.113.10",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    });
  }

  const existingLogins = await LoginLog.count({ where: { customerId: customer.id } });
  if (existingLogins < 3) {
    for (let i = 0; i < 3; i++) {
      await LoginLog.create({
        customerId: customer.id,
        email: customer.email,
        ip: i % 2 === 0 ? "203.0.113.10" : "198.51.100.12",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      });
    }
  }

  const existingVisits = await GuestVisit.count();
  if (existingVisits < 5) {
    for (let i = 0; i < 5; i++) {
      await GuestVisit.create({
        sessionId: `demo-guest-${i + 1}`,
        ip: `203.0.113.${i + 10}`,
        userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
        page: i % 2 === 0 ? "/products" : "/",
      });
    }
  }

  const existingOrderCount = await Order.count({ where: { customerId: customer.id } });
  if (!existingOrderCount) {
    const sampleProduct = await Product.findOne({ where: { isActive: true }, order: [["createdAt", "ASC"]] });
    if (sampleProduct) {
      const shippingAddress = {
        label: "Home",
        fullName: customer.name,
        phone: customer.phone,
        street: "22 MG Road, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        zip: "560001",
        country: "India",
      };

      const order = await Order.create({
        customerId: customer.id,
        subtotal: Number(sampleProduct.price) * 2,
        shippingCost: 0,
        total: Number(sampleProduct.price) * 2,
        shippingAddress,
        paymentMethod: "COD",
        paymentDetails: { method: "cod" },
        paymentStatus: "paid",
        status: "Delivered",
      });

      await OrderItem.create({
        orderId: order.id,
        productId: sampleProduct.id,
        name: sampleProduct.name,
        image: sampleProduct.images?.[0],
        price: sampleProduct.price,
        quantity: 2,
      });

      await sampleProduct.decrement("stockQuantity", { by: 2 });
    }
  }

  // 3) Demo users
  //    (Created in step 0 above — before the product count guard — so the
  //    legacy @shoplogo.com accounts are always removed automatically.)

  // 4) Reviews on a few products
  const sample = await Product.findAll({ limit: 8 });
  const reviewUsers = [customer.id, reviewer.id];
  const comments = [
    "Excellent product, delivered on time!",
    "Value for money, highly recommended.",
    "Good quality but packaging could be better.",
    "Works exactly as described. Five stars.",
    "Decent buy, would recommend.",
    "Great deal during the sale.",
  ];
  let reviews = 0;
  for (let i = 0; i < sample.length; i++) {
    const p = sample[i];
    for (let r = 0; r < 2; r++) {
      const user = reviewUsers[(i + r) % 2];
      await Review.findOrCreate({
        where: { productId: p.id, customerId: user },
        defaults: {
          rating: 4 + (r % 2),
          comment: comments[(i + r) % comments.length],
          isVerifiedPurchase: true,
        },
      });
      reviews += 1;
    }
  }
  console.log(`✅ Reviews: ${reviews} added`);

  console.log(`\n🎉 Seed complete! ${created} products, ${uniqueBrands.size} brands. Demo customer activity and order data were also added.`);
  console.log("→ Run:  npm run dev:server   (backend on http://localhost:5000)");
  console.log("→ Run:  npm run dev:client   (frontend on http://localhost:5173)");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
