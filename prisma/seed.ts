import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@coffee.vn',
      password: adminPassword,
      name: 'Quản trị viên',
      role: 'admin'
    }
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@coffee.vn',
      password: userPassword,
      name: 'Nguyễn Văn A',
      role: 'user'
    }
  });

  console.log('✅ Users created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Cà phê hạt',
        slug: 'ca-phe-hat',
        description: 'Hạt cà phê nguyên chất được rang xay thủ công, giữ trọn hương vị tươi ngon',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Cà phê xay',
        slug: 'ca-phe-xay',
        description: 'Cà phê đã được xay sẵn với nhiều mức độ mịn phù hợp cho từng phương pháp pha',
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Cà phê gói',
        slug: 'ca-phe-goi',
        description: 'Cà phê hòa tan tiện lợi, phù hợp cho văn phòng và mang theo',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Cà phê rang mộc',
        slug: 'ca-phe-rang-moc',
        description: 'Cà phê rang mộc truyền thống, không tẩm ướp, giữ nguyên vị cà phê thuần khiết',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80'
      }
    })
  ]);

  console.log('✅ Categories created');

  // Create products with Unsplash images
  const products = [
    // Cà phê hạt (8 products)
    {
      name: 'Cà phê Arabica Cầu Đất Đà Lạt',
      slug: 'ca-phe-arabica-cau-dat-da-lat',
      description: 'Hạt cà phê Arabica Cầu Đất nổi tiếng với hương thơm nhẹ nhàng, vị chua thanh thoát và hậu vị ngọt dịu. Được trồng ở độ cao 1500m tại vùng Cầu Đất - Đà Lạt, thu hái thủ công và rang xay theo công nghệ hiện đại giữ trọn hương vị đặc trưng của vùng cao nguyên.',
      price: 289000,
      imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=800&q=80',
        'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80'
      ]),
      origin: 'Cầu Đất, Đà Lạt, Lâm Đồng',
      roastLevel: 'medium',
      weight: 500,
      stock: 120,
      featured: true,
      categoryId: categories[0].id
    },
    {
      name: 'Cà phê Robusta Buôn Ma Thuột',
      slug: 'ca-phe-robusta-buon-ma-thuot',
      description: 'Robusta Buôn Ma Thuột - vị đậm đà, hương thơm mạnh mẽ đặc trưng của Tây Nguyên. Hạt cà phê được tuyển chọn kỹ lưỡng, rang đậm kiểu Việt Nam phù hợp với khẩu vị truyền thống.',
      price: 199000,
      imageUrl: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80'
      ]),
      origin: 'Buôn Ma Thuột, Đắk Lắk',
      roastLevel: 'dark',
      weight: 500,
      stock: 200,
      featured: true,
      categoryId: categories[0].id
    },
    {
      name: 'Cà phê Blend House Special',
      slug: 'ca-phe-blend-house-special',
      description: 'Hỗn hợp Arabica và Robusta theo tỷ lệ vàng 60:40, tạo nên hương vị cân bằng giữa sự tinh tế và đậm đà. Đây là công thức độc quyền của Coffee Home Blend được phát triển qua nhiều năm.',
      price: 259000,
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80'
      ]),
      origin: 'Việt Nam',
      roastLevel: 'medium',
      weight: 500,
      stock: 85,
      featured: true,
      categoryId: categories[0].id
    },
    {
      name: 'Cà phê Arabica Honey Process',
      slug: 'ca-phe-arabica-honey-process',
      description: 'Quy trình chế biến mật ong độc đáo giúp giữ lại lượng đường tự nhiên trong hạt, tạo nên vị ngọt dịu đặc biệt và hương thơm phức hợp.',
      price: 349000,
      imageUrl: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'
      ]),
      origin: 'Lâm Viên, Lâm Đồng',
      roastLevel: 'light',
      weight: 250,
      stock: 60,
      featured: false,
      categoryId: categories[0].id
    },
    {
      name: 'Cà phê Robusta Honey',
      slug: 'ca-phe-robusta-honey',
      description: 'Robusta được chế biến theo phương pháp honey, mang đến hương vị độc đáo, ít đắng gắt và có hậu vị ngọt kéo dài.',
      price: 229000,
      imageUrl: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=800&q=80',
      origin: 'Đắk Nông',
      roastLevel: 'medium',
      weight: 500,
      stock: 75,
      featured: false,
      categoryId: categories[0].id
    },
    {
      name: 'Cà phê Espresso Đậm Đà',
      slug: 'ca-phe-espresso-dam-da',
      description: 'Hỗn hợp cà phê chuyên dụng cho máy Espresso, rang đậm kiểu Ý tạo lớp crema dày, hương vị đậm đà đúng chuẩn.',
      price: 279000,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80'
      ]),
      origin: 'Blend nhiều vùng',
      roastLevel: 'dark',
      weight: 1000,
      stock: 90,
      featured: true,
      categoryId: categories[0].id
    },
    {
      name: 'Cà phê Geisha Premium',
      slug: 'ca-phe-geisha-premium',
      description: 'Dòng cà phê cao cấp Geisha với hương thơm hoa quả nhiệt đới, vị chua thanh và hậu vị kéo dài. Sản lượng giới hạn, đẳng cấp thượng lưu.',
      price: 499000,
      imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80'
      ]),
      origin: 'Cầu Đất, Đà Lạt',
      roastLevel: 'light',
      weight: 200,
      stock: 25,
      featured: true,
      categoryId: categories[0].id
    },
    {
      name: 'Cà phê Cherry Natural',
      slug: 'ca-phe-cherry-natural',
      description: 'Cà phê Arabica chế biến tự nhiên từ quả chín, mang hương vị berry đặc trưng và vị ngọt tự nhiên hiếm có.',
      price: 319000,
      imageUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80',
      origin: 'Sơn La',
      roastLevel: 'medium',
      weight: 250,
      stock: 40,
      featured: false,
      categoryId: categories[0].id
    },

    // Cà phê xay (4 products)
    {
      name: 'Cà phê xay truyền thống',
      slug: 'ca-phe-xay-truyen-thong',
      description: 'Cà phê xay sẵn với độ mịn phù hợp cho phin, mang đậm hương vị cà phê sữa đá Việt Nam truyền thống.',
      price: 149000,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
      origin: 'Việt Nam',
      roastLevel: 'medium',
      weight: 500,
      stock: 250,
      featured: true,
      categoryId: categories[1].id
    },
    {
      name: 'Cà phê xay Espresso',
      slug: 'ca-phe-xay-espresso',
      description: 'Cà phê xay mịn chuyên dụng cho máy Espresso, giúp chiết xuất tối đa hương vị và crema.',
      price: 189000,
      imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
      origin: 'Blend Việt Nam',
      roastLevel: 'dark',
      weight: 500,
      stock: 130,
      featured: false,
      categoryId: categories[1].id
    },
    {
      name: 'Cà phê xay Pour Over',
      slug: 'ca-phe-xay-pour-over',
      description: 'Cà phê xay vừa chuyên dụng cho phương pháp Pour Over, giúp làm nổi bật hương vị tinh tế của hạt Arabica.',
      price: 219000,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      origin: 'Cầu Đất',
      roastLevel: 'light',
      weight: 500,
      stock: 95,
      featured: false,
      categoryId: categories[1].id
    },
    {
      name: 'Cà phê xay French Press',
      slug: 'ca-phe-xay-french-press',
      description: 'Cà phê xay thô dành cho French Press, giữ trọn vẹn hương vị đậm đà và body đầy đặn.',
      price: 199000,
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
      origin: 'Việt Nam',
      roastLevel: 'medium',
      weight: 500,
      stock: 110,
      featured: false,
      categoryId: categories[1].id
    },

    // Cà phê gói (4 products)
    {
      name: 'Cà phê hòa tan 3in1 Classic',
      slug: 'ca-phe-hoa-tan-3in1-classic',
      description: 'Cà phê hòa tan 3 trong 1 với công thức cổ điển, vị đậm đà quen thuộc, tiện lợi sử dụng mọi lúc mọi nơi.',
      price: 89000,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
      origin: 'Việt Nam',
      roastLevel: 'medium',
      weight: 320,
      stock: 500,
      featured: true,
      categoryId: categories[2].id
    },
    {
      name: 'Cà phê hòa tan Đen Đá',
      slug: 'ca-phe-hoa-tan-den-da',
      description: 'Cà phê hòa tan đen nguyên chất, không đường, dành cho người yêu thích vị đắng thuần khiết và tốt cho sức khỏe.',
      price: 99000,
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
      origin: 'Việt Nam',
      roastLevel: 'dark',
      weight: 40,
      stock: 320,
      featured: false,
      categoryId: categories[2].id
    },
    {
      name: 'Cà phê hòa tan sữa',
      slug: 'ca-phe-hoa-tan-sua',
      description: 'Cà phê sữa hòa tan thơm ngon, vị ngọt dịu, phù hợp cho gia đình và văn phòng.',
      price: 89000,
      imageUrl: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=800&q=80',
      origin: 'Việt Nam',
      roastLevel: 'medium',
      weight: 360,
      stock: 400,
      featured: false,
      categoryId: categories[2].id
    },
    {
      name: 'Cà phê hòa tan Cappuccino',
      slug: 'ca-phe-hoa-tan-cappuccino',
      description: 'Cappuccino hòa tan với hương vị Ý đặc trưng, lớp bọt sữa béo ngậy hoàn hảo ngay tại nhà.',
      price: 129000,
      imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80',
      origin: 'Việt Nam',
      roastLevel: 'medium',
      weight: 250,
      stock: 240,
      featured: true,
      categoryId: categories[2].id
    },

    // Cà phê rang mộc (4 products)
    {
      name: 'Cà phê rang mộc truyền thống',
      slug: 'ca-phe-rang-moc-truyen-thong',
      description: 'Cà phê rang mộc không tẩm ướp, giữ nguyên 100% hương vị cà phê thuần khiết. Rang thủ công theo phương pháp truyền thống Việt Nam.',
      price: 179000,
      imageUrl: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=800&q=80',
      origin: 'Buôn Ma Thuột',
      roastLevel: 'medium',
      weight: 500,
      stock: 180,
      featured: true,
      categoryId: categories[3].id
    },
    {
      name: 'Cà phê rang mộc hạt',
      slug: 'ca-phe-rang-moc-hat',
      description: 'Cà phê rang mộc nguyên hạt, không tẩm ướp, bảo quản hương vị tối đa và phù hợp cho người thích tự xay.',
      price: 199000,
      imageUrl: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=800&q=80',
      origin: 'Tây Nguyên',
      roastLevel: 'medium',
      weight: 500,
      stock: 150,
      featured: false,
      categoryId: categories[3].id
    },
    {
      name: 'Cà phê rang mộc Light Roast',
      slug: 'ca-phe-rang-moc-light-roast',
      description: 'Rang nhẹ giữ nguyên hương vị tự nhiên của hạt Arabica, vị chua thanh và hương hoa quả đặc trưng.',
      price: 239000,
      imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
      origin: 'Đà Lạt',
      roastLevel: 'light',
      weight: 250,
      stock: 70,
      featured: false,
      categoryId: categories[3].id
    },
    {
      name: 'Cà phê rang mộc Dark Roast',
      slug: 'ca-phe-rang-moc-dark-roast',
      description: 'Rang đậm kiểu Việt Nam, vị đắng đậm, hương khói mạnh mẽ, phù hợp với khẩu vị truyền thống.',
      price: 219000,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
      origin: 'Tây Nguyên',
      roastLevel: 'dark',
      weight: 500,
      stock: 95,
      featured: true,
      categoryId: categories[3].id
    }
  ];

  const createdProducts = await Promise.all(
    products.map((product) => prisma.product.create({ data: product }))
  );

  console.log('✅ Products created');

  // Create some reviews
  const reviewData = [
    { productId: createdProducts[0].id, userId: user.id, rating: 5, comment: 'Cà phê ngon tuyệt! Hương vị đậm đà, giao hàng nhanh.' },
    { productId: createdProducts[0].id, userId: admin.id, rating: 5, comment: 'Sản phẩm chất lượng cao, sẽ mua lại.' },
    { productId: createdProducts[1].id, userId: user.id, rating: 4, comment: 'Vị đắng đậm đúng chuẩn Việt Nam.' },
    { productId: createdProducts[2].id, userId: user.id, rating: 5, comment: 'Blend hoàn hảo! Phù hợp với mọi cách pha.' },
    { productId: createdProducts[5].id, userId: admin.id, rating: 5, comment: 'Crema dày, thơm ngon. Máy espresso nhập khẩu thích hợp.' },
    { productId: createdProducts[8].id, userId: user.id, rating: 4, comment: 'Tiện lợi, pha phin rất ngon.' },
    { productId: createdProducts[12].id, userId: user.id, rating: 5, comment: 'Đúng vị cà phê Việt, giao hàng nhanh.' },
  ];

  await Promise.all(reviewData.map((review) => prisma.review.create({ data: review })));

  console.log('✅ Reviews created');
  console.log('🎉 Seeding completed!');
  console.log('\n📋 Test credentials:');
  console.log('   Admin: admin@coffee.vn / admin123');
  console.log('   User:  user@coffee.vn / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
