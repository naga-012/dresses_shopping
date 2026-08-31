const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Collection = require('./models/Collection');
const connectDB = require('./config/db');

dotenv.config();

const addProducts = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany();

    // Item 1: Vintage Washed Black Embroidery Cap (Cost ₹300)
    const capProduct = await Product.create({
      name: 'Vintage Washed Black Embroidery Cap',
      slug: 'vintage-washed-black-embroidery-cap',
      category: 'Caps',
      brand: 'URBAN FIT',
      collectionName: 'Vintage Streetwear 2026',
      description: 'Premium vintage washed cotton baseball cap featuring high-density 3D front embroidery, adjustable brass buckle strap, and breathable 6-panel eyelet construction.',
      price: 300,
      discountPrice: 300,
      sizes: [
        { size: 'Free Size', stock: 100 }
      ],
      colors: [
        { name: 'Washed Black', hex: '#222225' }
      ],
      stock: 100,
      images: [
        '/uploads/cap1.png',
        '/uploads/cap2.png',
        '/uploads/cap3.png',
        '/uploads/cap4.png',
        '/uploads/cap5.png'
      ],
      thumbnail: '/uploads/cap1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.9
    });

    // Item 2: Vintage Paisley Printed Black Cotton Bandana (Cost ₹250)
    const bandanaProduct = await Product.create({
      name: 'Vintage Paisley Printed Black Cotton Bandana',
      slug: 'vintage-paisley-printed-black-cotton-bandana',
      category: 'Accessories',
      brand: 'URBAN FIT',
      collectionName: 'Vintage Streetwear 2026',
      description: '100% premium woven cotton bandana featuring classic black and white paisley border graphics. Versatile accessory for headwear, neckerchief, or pocket accent.',
      price: 250,
      discountPrice: 250,
      sizes: [
        { size: 'Free Size', stock: 150 }
      ],
      colors: [
        { name: 'Paisley Black / White', hex: '#111115' }
      ],
      stock: 150,
      images: [
        '/uploads/bandana1.png',
        '/uploads/bandana2.png',
        '/uploads/bandana3.png',
        '/uploads/bandana4.png',
        '/uploads/bandana5.png'
      ],
      thumbnail: '/uploads/bandana1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.92
    });

    // Item 3: Masato Kawajo SECND SLF Oversized Long Sleeve (Cost ₹900)
    const shirtProduct = await Product.create({
      name: 'Masato Kawajo SECND SLF Oversized Long Sleeve',
      slug: 'masato-kawajo-secnd-slf-oversized-long-sleeve',
      category: 'Shirts',
      brand: 'URBAN FIT',
      collectionName: 'Contemporary Streetwear 2026',
      description: 'Heavyweight 320 GSM French terry cotton long-sleeve tee featuring custom electric blue Masato Kawajo SECND SLF shield graphics, drop shoulders, and ribbed cuffs.',
      price: 900,
      discountPrice: 900,
      sizes: [
        { size: 'S', stock: 20 },
        { size: 'M', stock: 40 },
        { size: 'L', stock: 40 },
        { size: 'XL', stock: 20 }
      ],
      colors: [
        { name: 'Jet Black / Electric Blue', hex: '#0a0a0c' }
      ],
      stock: 120,
      images: [
        '/uploads/shirt1.png',
        '/uploads/shirt2.png',
        '/uploads/shirt3.png',
        '/uploads/shirt4.png',
        '/uploads/shirt5.png'
      ],
      thumbnail: '/uploads/shirt1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 5.0
    });

    // Item 4: Vintage Washed Black Wide-Leg Chain & Bandana Jeans (Cost ₹1200)
    const pantsProduct = await Product.create({
      name: 'Vintage Washed Black Wide-Leg Chain & Bandana Jeans',
      slug: 'vintage-washed-black-wide-leg-chain-bandana-jeans',
      category: 'Jeans',
      brand: 'URBAN FIT',
      collectionName: 'Vintage Streetwear 2026',
      description: 'Heavyweight washed denim wide-leg jeans featuring detachable multi-layer silver pocket chains, paisley bandana accent, high-waisted relaxed silhouette, and branded leather back patch.',
      price: 1200,
      discountPrice: 1200,
      sizes: [
        { size: '26', stock: 15 },
        { size: '28', stock: 25 },
        { size: '30', stock: 35 },
        { size: '32', stock: 35 },
        { size: '34', stock: 25 },
        { size: '36', stock: 15 },
        { size: '38', stock: 10 }
      ],

      colors: [
        { name: 'Washed Charcoal Black', hex: '#1c1c20' }
      ],
      stock: 150,
      images: [
        '/uploads/pants1.png',
        '/uploads/pants2.png',
        '/uploads/pants3.png',
        '/uploads/pants4.png',
        '/uploads/pants5.png'
      ],
      thumbnail: '/uploads/pants1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.95
    });

    // Item 5: Puma Speedcat Suede Black & Silver Formstrip Sneakers (Cost ₹1800)
    const shoesProduct = await Product.create({
      name: 'Puma Speedcat Suede Black & Silver Formstrip Sneakers',
      slug: 'puma-speedcat-suede-black-silver-formstrip-sneakers',
      category: 'Shoes',
      brand: 'PUMA x URBAN FIT',
      collectionName: 'Motorsport Streetwear 2026',
      description: 'Iconic low-profile suede sneakers featuring metallic silver formstrip overlays, embroidered white cat emblem, low-profile rubber sole, and padded collar for all-day comfort.',
      price: 1800,
      discountPrice: 1800,
      sizes: [
        { size: '6', stock: 15 },
        { size: '7', stock: 25 },
        { size: '8', stock: 35 },
        { size: '9', stock: 35 },
        { size: '10', stock: 25 },
        { size: '11', stock: 15 }
      ],

      colors: [
        { name: 'Suede Black / Metallic Silver', hex: '#111116' }
      ],
      stock: 100,
      images: [
        '/uploads/shoes1.png',
        '/uploads/shoes2.png',
        '/uploads/shoes3.png',
        '/uploads/shoes4.png',
        '/uploads/shoes5.png'
      ],
      thumbnail: '/uploads/shoes1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.98
    });

    // Item 6: Monochrome Abstract Graphic Printed Shirt (Cost ₹700)
    const patternShirtProduct = await Product.create({
      name: 'Monochrome Abstract Graphic Printed Shirt',
      slug: 'monochrome-abstract-graphic-printed-shirt',
      category: 'Shirts',
      brand: 'URBAN FIT',
      collectionName: 'Contemporary Streetwear 2026',
      description: 'Premium woven cotton full-sleeve button-down shirt featuring an eye-catching abstract monochrome doodle graphic pattern. Tailored fit, spread collar, and 5-angle photo gallery view.',
      price: 700,
      discountPrice: 700,
      sizes: [
        { size: 'S', stock: 25 },
        { size: 'M', stock: 50 },
        { size: 'L', stock: 50 },
        { size: 'XL', stock: 25 }
      ],
      colors: [
        { name: 'Monochrome Pattern Black / White', hex: '#111115' }
      ],
      stock: 150,
      images: [
        '/uploads/pattern_shirt1.png',
        '/uploads/pattern_shirt2.png',
        '/uploads/pattern_shirt3.png',
        '/uploads/pattern_shirt4.png',
        '/uploads/pattern_shirt5.png'
      ],
      thumbnail: '/uploads/pattern_shirt1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.96
    });

    // Item 7: Grey Collar "Live to Love" Quarter-Zip Polo T-Shirt (Cost ₹600)
    const greyPoloProduct = await Product.create({
      name: 'Grey Collar "Live to Love" Quarter-Zip Polo T-Shirt',
      slug: 'grey-collar-live-to-love-quarter-zip-polo-t-shirt',
      category: 'T-Shirts',
      brand: 'URBAN FIT',
      collectionName: 'Contemporary Streetwear 2026',
      description: 'Vintage heather grey quarter-zip collar polo t-shirt featuring contrast white sleeve block bands, bold "Live to Love" calligraphy chest graphic, and "TO HATE IS EASY TRY" hem text signature.',
      price: 600,
      discountPrice: 600,
      sizes: [
        { size: 'S', stock: 25 },
        { size: 'M', stock: 50 },
        { size: 'L', stock: 50 },
        { size: 'XL', stock: 25 }
      ],
      colors: [
        { name: 'Heather Grey / White', hex: '#888890' }
      ],
      stock: 150,
      images: [
        '/uploads/grey_polo1.png',
        '/uploads/grey_polo2.png',
        '/uploads/grey_polo3.png',
        '/uploads/grey_polo4.png',
        '/uploads/grey_polo5.png'
      ],
      thumbnail: '/uploads/grey_polo1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.97
    });

    // Item 8: Pleated Light Grey Tailored Formal Trousers (Cost ₹900)
    const greyTrousersProduct = await Product.create({
      name: 'Pleated Light Grey Tailored Formal Trousers',
      slug: 'pleated-light-grey-tailored-formal-trousers',
      category: 'Pants',
      brand: 'URBAN FIT',
      collectionName: 'Vintage Streetwear 2026',
      description: 'Sophisticated light grey double-pleated tailored trousers featuring a mid-rise fit, slant side pockets, back buttoned welt pocket, belt loops, and smooth crease front line.',
      price: 900,
      discountPrice: 900,
      sizes: [
        { size: '28', stock: 20 },
        { size: '30', stock: 35 },
        { size: '32', stock: 35 },
        { size: '34', stock: 25 },
        { size: '36', stock: 15 }
      ],
      colors: [
        { name: 'Light Grey', hex: '#b0b0b8' }
      ],
      stock: 130,
      images: [
        '/uploads/grey_trousers1.png',
        '/uploads/grey_trousers2.png',
        '/uploads/grey_trousers3.png',
        '/uploads/grey_trousers4.png',
        '/uploads/grey_trousers5.png'
      ],
      thumbnail: '/uploads/grey_trousers1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.95
    });

    // Item 9: Nike Victori One Black & White Swoosh Slides (Cost ₹1800)
    const nikeSlidesProduct = await Product.create({
      name: 'Nike Victori One Black & White Swoosh Slides',
      slug: 'nike-victori-one-black-white-swoosh-slides',
      category: 'Shoes',
      brand: 'NIKE x URBAN FIT',
      collectionName: 'Motorsport Streetwear 2026',
      description: 'Iconic lightweight black sport slides featuring a soft padded strap with prominent white Nike Swoosh branding, contoured footbed, and textured grip sole.',
      price: 1800,
      discountPrice: 1800,
      sizes: [
        { size: '6', stock: 15 },
        { size: '7', stock: 25 },
        { size: '8', stock: 35 },
        { size: '9', stock: 35 },
        { size: '10', stock: 25 },
        { size: '11', stock: 15 }
      ],
      colors: [
        { name: 'Matte Black / White', hex: '#111115' }
      ],
      stock: 150,
      images: [
        '/uploads/nike_slides1.png',
        '/uploads/nike_slides2.png',
        '/uploads/nike_slides3.png',
        '/uploads/nike_slides4.png',
        '/uploads/nike_slides5.png'
      ],
      thumbnail: '/uploads/nike_slides1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.98
    });

    // Item 10: Nike Layered Dusty Pink & 3-Stripe Black Sleeve Shirt (Cost ₹900)
    const pinkLayeredShirtProduct = await Product.create({
      name: 'Nike Layered Dusty Pink & 3-Stripe Black Sleeve Shirt',
      slug: 'nike-layered-dusty-pink-3-stripe-black-sleeve-shirt',
      category: 'Shirts',
      brand: 'NIKE x URBAN FIT',
      collectionName: 'Contemporary Streetwear 2026',
      description: 'Modern streetwear layered shirt featuring a dusty pink short-sleeve button-down outer layer over attached black 3-stripe long sleeves, embroidered white Nike chest logo, and chest pocket.',
      price: 900,
      discountPrice: 900,
      sizes: [
        { size: 'S', stock: 20 },
        { size: 'M', stock: 40 },
        { size: 'L', stock: 40 },
        { size: 'XL', stock: 20 }
      ],
      colors: [
        { name: 'Dusty Pink / Black', hex: '#b88494' }
      ],
      stock: 120,
      images: [
        '/uploads/pink_layered_shirt1.png',
        '/uploads/pink_layered_shirt2.png',
        '/uploads/pink_layered_shirt3.png',
        '/uploads/pink_layered_shirt4.png',
        '/uploads/pink_layered_shirt5.png'
      ],
      thumbnail: '/uploads/pink_layered_shirt1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.97
    });

    // Item 11: Minimalist Jet Black Oversized Long Sleeve Shirt (Cost ₹800)
    const blackCampShirtProduct = await Product.create({
      name: 'Minimalist Jet Black Oversized Long Sleeve Shirt',
      slug: 'minimalist-jet-black-oversized-long-sleeve-shirt',
      category: 'Shirts',
      brand: 'URBAN FIT',
      collectionName: 'Vintage Streetwear 2026',
      description: 'Sleek jet black tailored long-sleeve camp collar shirt featuring a minimalist relaxed silhouette, button-down front, chest accent, and premium breathable woven fabric.',
      price: 800,
      discountPrice: 800,
      sizes: [
        { size: 'S', stock: 25 },
        { size: 'M', stock: 50 },
        { size: 'L', stock: 50 },
        { size: 'XL', stock: 25 }
      ],
      colors: [
        { name: 'Jet Black', hex: '#0a0a0d' }
      ],
      stock: 150,
      images: [
        '/uploads/black_camp_shirt1.png',
        '/uploads/black_camp_shirt2.png',
        '/uploads/black_camp_shirt3.png',
        '/uploads/black_camp_shirt4.png',
        '/uploads/black_camp_shirt5.png'
      ],
      thumbnail: '/uploads/black_camp_shirt1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.96
    });

    // Item 12: Pleated Classic Beige Tailored Trousers (Cost ₹800)
    const beigeTrousersProduct = await Product.create({
      name: 'Pleated Classic Beige Tailored Trousers',
      slug: 'pleated-classic-beige-tailored-trousers',
      category: 'Pants',
      brand: 'URBAN FIT',
      collectionName: 'Vintage Streetwear 2026',
      description: 'Elegant classic beige double-pleated tailored trousers featuring a mid-rise fit, slant front pockets, buttoned back welt pocket, and smooth crease front line.',
      price: 800,
      discountPrice: 800,
      sizes: [
        { size: '28', stock: 20 },
        { size: '30', stock: 35 },
        { size: '32', stock: 35 },
        { size: '34', stock: 25 },
        { size: '36', stock: 15 }
      ],
      colors: [
        { name: 'Classic Beige', hex: '#e3d7c5' }
      ],
      stock: 130,
      images: [
        '/uploads/beige_trousers1.png',
        '/uploads/beige_trousers2.png',
        '/uploads/beige_trousers3.png',
        '/uploads/beige_trousers4.png',
        '/uploads/beige_trousers5.png'
      ],
      thumbnail: '/uploads/beige_trousers1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.95
    });

    // Item 13: Vintage Acid Washed Grey Wide-Leg Straight Jeans (Cost ₹1100)
    const greyJeansProduct = await Product.create({
      name: 'Vintage Acid Washed Grey Wide-Leg Straight Jeans',
      slug: 'vintage-acid-washed-grey-wide-leg-straight-jeans',
      category: 'Jeans',
      brand: 'URBAN FIT',
      collectionName: 'Vintage Streetwear 2026',
      description: 'Heavyweight premium acid washed grey denim jeans featuring a wide-leg straight silhouette, traditional 5-pocket construction, branded metal button closure, and relaxed vintage drape.',
      price: 1100,
      discountPrice: 1100,
      sizes: [
        { size: '28', stock: 20 },
        { size: '30', stock: 35 },
        { size: '32', stock: 35 },
        { size: '34', stock: 25 },
        { size: '36', stock: 15 }
      ],
      colors: [
        { name: 'Acid Washed Grey', hex: '#6b6c70' }
      ],
      stock: 130,
      images: [
        '/uploads/grey_jeans1.png',
        '/uploads/grey_jeans2.png',
        '/uploads/grey_jeans3.png',
        '/uploads/grey_jeans4.png',
        '/uploads/grey_jeans5.png'
      ],
      thumbnail: '/uploads/grey_jeans1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.97
    });

    // Item 14: Minimalist Matte Black Dual Strap Comfort Slide Sandals (Cost ₹900)
    const blackSandalsProduct = await Product.create({
      name: 'Minimalist Matte Black Dual Strap Comfort Slide Sandals',
      slug: 'minimalist-matte-black-dual-strap-comfort-slide-sandals',
      category: 'Shoes',
      brand: 'URBAN FIT',
      collectionName: 'Motorsport Streetwear 2026',
      description: 'Sleek matte black dual wide-strap slides featuring an ergonomic molded footbed, thick cushioned sole, breathable open-toe design, and durable slip-resistant outsole.',
      price: 900,
      discountPrice: 900,
      sizes: [
        { size: '6', stock: 15 },
        { size: '7', stock: 25 },
        { size: '8', stock: 35 },
        { size: '9', stock: 35 },
        { size: '10', stock: 25 },
        { size: '11', stock: 15 }
      ],
      colors: [
        { name: 'Matte Black', hex: '#0e0e11' }
      ],
      stock: 150,
      images: [
        '/uploads/black_sandals1.png',
        '/uploads/black_sandals2.png',
        '/uploads/black_sandals3.png',
        '/uploads/black_sandals4.png',
        '/uploads/black_sandals5.png'
      ],
      thumbnail: '/uploads/black_sandals1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.96
    });

    // Item 15: Sky Blue Classic Oxford Formal Button-Down Shirt (Cost ₹800)
    const blueOxfordShirtProduct = await Product.create({
      name: 'Sky Blue Classic Oxford Formal Button-Down Shirt',
      slug: 'sky-blue-classic-oxford-formal-button-down-shirt',
      category: 'Shirts',
      brand: 'URBAN FIT',
      collectionName: 'Vintage Streetwear 2026',
      description: 'Classic sky blue crisp woven cotton Oxford formal shirt featuring a button-down collar, single chest pocket, buttoned cuffs, and tailored professional fit.',
      price: 800,
      discountPrice: 800,
      sizes: [
        { size: 'S', stock: 25 },
        { size: 'M', stock: 50 },
        { size: 'L', stock: 50 },
        { size: 'XL', stock: 25 }
      ],
      colors: [
        { name: 'Sky Blue', hex: '#8cb9f0' }
      ],
      stock: 150,
      images: [
        '/uploads/blue_oxford_shirt1.png',
        '/uploads/blue_oxford_shirt2.png',
        '/uploads/blue_oxford_shirt3.png',
        '/uploads/blue_oxford_shirt4.png',
        '/uploads/blue_oxford_shirt5.png'
      ],
      thumbnail: '/uploads/blue_oxford_shirt1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.98
    });

    // Item 16: Classic Jet Black Slim Fit Tailored Trousers (Cost ₹900)
    const blackTrousersProduct = await Product.create({
      name: 'Classic Jet Black Slim Fit Tailored Trousers',
      slug: 'classic-jet-black-slim-fit-tailored-trousers',
      category: 'Pants',
      brand: 'URBAN FIT',
      collectionName: 'Vintage Streetwear 2026',
      description: 'Sleek jet black slim-fit tailored trousers featuring clean flat front styling, slant side pockets, back buttoned welt pockets, and premium wrinkle-resistant stretch fabric.',
      price: 900,
      discountPrice: 900,
      sizes: [
        { size: '28', stock: 20 },
        { size: '30', stock: 35 },
        { size: '32', stock: 35 },
        { size: '34', stock: 25 },
        { size: '36', stock: 15 }
      ],
      colors: [
        { name: 'Jet Black', hex: '#0a0a0d' }
      ],
      stock: 130,
      images: [
        '/uploads/black_trousers1.png',
        '/uploads/black_trousers2.png',
        '/uploads/black_trousers3.png',
        '/uploads/black_trousers4.png',
        '/uploads/black_trousers5.png'
      ],
      thumbnail: '/uploads/black_trousers1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.97
    });

    // Item 17: Nike Offcourt Duo Black & White Swoosh Slides (Cost ₹1800)
    const nikeOffcourtSlidesProduct = await Product.create({
      name: 'Nike Offcourt Duo Black & White Swoosh Slides',
      slug: 'nike-offcourt-duo-black-white-swoosh-slides',
      category: 'Shoes',
      brand: 'NIKE',
      collectionName: 'Motorsport Streetwear 2026',
      description: 'Iconic Nike Offcourt slides featuring a bold white Nike logo across a padded black strap, dual-density foam footbed, deep flex grooves, and ultra-soft cushioning.',
      price: 1800,
      discountPrice: 1800,
      sizes: [
        { size: '6', stock: 15 },
        { size: '7', stock: 25 },
        { size: '8', stock: 35 },
        { size: '9', stock: 35 },
        { size: '10', stock: 25 },
        { size: '11', stock: 15 }
      ],
      colors: [
        { name: 'Black / White', hex: '#111111' }
      ],
      stock: 150,
      images: [
        '/uploads/nike_offcourt_slides1.png',
        '/uploads/nike_offcourt_slides2.png',
        '/uploads/nike_offcourt_slides3.png',
        '/uploads/nike_offcourt_slides4.png',
        '/uploads/nike_offcourt_slides5.png'
      ],
      thumbnail: '/uploads/nike_offcourt_slides1.png',
      isFeatured: true,
      isNewArrival: true,
      rating: 4.99
    });

    console.log('Successfully added all 17 product items to database:');
    console.log(`1. ${capProduct.name} - ₹300`);
    console.log(`2. ${bandanaProduct.name} - ₹250`);
    console.log(`3. ${shirtProduct.name} - ₹900`);
    console.log(`4. ${pantsProduct.name} - ₹1200`);
    console.log(`5. ${shoesProduct.name} - ₹1800`);
    console.log(`6. ${patternShirtProduct.name} - ₹700`);
    console.log(`7. ${greyPoloProduct.name} - ₹600`);
    console.log(`8. ${greyTrousersProduct.name} - ₹900`);
    console.log(`9. ${nikeSlidesProduct.name} - ₹1800`);
    console.log(`10. ${pinkLayeredShirtProduct.name} - ₹900`);
    console.log(`11. ${blackCampShirtProduct.name} - ₹800`);
    console.log(`12. ${beigeTrousersProduct.name} - ₹800`);
    console.log(`13. ${greyJeansProduct.name} - ₹1100`);
    console.log(`14. ${blackSandalsProduct.name} - ₹900`);
    console.log(`15. ${blueOxfordShirtProduct.name} - ₹800`);
    console.log(`16. ${blackTrousersProduct.name} - ₹900`);
    console.log(`17. ${nikeOffcourtSlidesProduct.name} - ₹1800`);
    process.exit(0);
  } catch (error) {
    console.error(`Error adding products: ${error.message}`);
    process.exit(1);
  }
};

addProducts();
