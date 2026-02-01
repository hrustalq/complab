import { PrismaClient } from '../src/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Note: DATABASE_URL must be set in environment
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.repairRequest.deleteMany();
  await prisma.repairService.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.promoCode.deleteMany();

  // =====================================================
  // USERS
  // =====================================================
  console.log('👤 Creating users...');
  const user1 = await prisma.user.create({
    data: {
      id: 'user-1',
      email: 'ivan@example.com',
      firstName: 'Иван',
      lastName: 'Петров',
      phone: '+7 (999) 123-45-67',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    },
  });

  // =====================================================
  // ADDRESSES
  // =====================================================
  console.log('🏠 Creating addresses...');
  await prisma.address.createMany({
    data: [
      {
        id: 'addr-1',
        userId: user1.id,
        title: 'Дом',
        fullName: 'Иван Петров',
        phone: '+7 (999) 123-45-67',
        city: 'Москва',
        street: 'ул. Тверская',
        building: '12',
        apartment: '45',
        postalCode: '125009',
        isDefault: true,
      },
      {
        id: 'addr-2',
        userId: user1.id,
        title: 'Офис',
        fullName: 'Иван Петров',
        phone: '+7 (999) 123-45-67',
        city: 'Москва',
        street: 'ул. Арбат',
        building: '24',
        apartment: '301',
        postalCode: '119002',
        isDefault: false,
      },
    ],
  });

  // =====================================================
  // CATEGORIES
  // =====================================================
  console.log('📁 Creating categories...');
  
  // Root categories
  const computers = await prisma.category.create({
    data: {
      id: '1',
      name: 'Компьютеры и ноутбуки',
      slug: 'computers',
      description: 'Настольные ПК, ноутбуки и моноблоки',
      icon: 'Monitor',
      order: 1,
      isActive: true,
    },
  });

  const components = await prisma.category.create({
    data: {
      id: '2',
      name: 'Комплектующие',
      slug: 'components',
      description: 'Процессоры, видеокарты, память и накопители',
      icon: 'Cpu',
      order: 2,
      isActive: true,
    },
  });

  const peripherals = await prisma.category.create({
    data: {
      id: '3',
      name: 'Периферия',
      slug: 'peripherals',
      description: 'Мониторы, клавиатуры, мыши и гарнитуры',
      icon: 'Mouse',
      order: 3,
      isActive: true,
    },
  });

  const networking = await prisma.category.create({
    data: {
      id: '4',
      name: 'Сетевое оборудование',
      slug: 'networking',
      description: 'Роутеры, коммутаторы и сетевые карты',
      icon: 'Wifi',
      order: 4,
      isActive: true,
    },
  });

  await prisma.category.create({
    data: {
      id: '5',
      name: 'Услуги ремонта',
      slug: 'repair-services',
      description: 'Профессиональный ремонт компьютерной техники',
      icon: 'Wrench',
      order: 5,
      isActive: true,
    },
  });

  // Child categories
  await prisma.category.createMany({
    data: [
      // Computers children
      { id: '1-1', name: 'Ноутбуки', slug: 'laptops', parentId: computers.id, order: 1, isActive: true },
      { id: '1-2', name: 'Настольные ПК', slug: 'desktop-pcs', parentId: computers.id, order: 2, isActive: true },
      { id: '1-3', name: 'Моноблоки', slug: 'all-in-one', parentId: computers.id, order: 3, isActive: true },
      // Components children
      { id: '2-1', name: 'Процессоры', slug: 'processors', parentId: components.id, order: 1, isActive: true },
      { id: '2-2', name: 'Видеокарты', slug: 'graphics-cards', parentId: components.id, order: 2, isActive: true },
      { id: '2-3', name: 'Оперативная память', slug: 'ram', parentId: components.id, order: 3, isActive: true },
      { id: '2-4', name: 'SSD накопители', slug: 'ssd', parentId: components.id, order: 4, isActive: true },
      { id: '2-5', name: 'Материнские платы', slug: 'motherboards', parentId: components.id, order: 5, isActive: true },
      { id: '2-6', name: 'Блоки питания', slug: 'power-supplies', parentId: components.id, order: 6, isActive: true },
      { id: '2-7', name: 'Корпуса', slug: 'cases', parentId: components.id, order: 7, isActive: true },
      { id: '2-8', name: 'Системы охлаждения', slug: 'cooling', parentId: components.id, order: 8, isActive: true },
      // Peripherals children
      { id: '3-1', name: 'Мониторы', slug: 'monitors', parentId: peripherals.id, order: 1, isActive: true },
      { id: '3-2', name: 'Клавиатуры', slug: 'keyboards', parentId: peripherals.id, order: 2, isActive: true },
      { id: '3-3', name: 'Мыши', slug: 'mice', parentId: peripherals.id, order: 3, isActive: true },
      { id: '3-4', name: 'Наушники и гарнитуры', slug: 'headsets', parentId: peripherals.id, order: 4, isActive: true },
      { id: '3-5', name: 'Веб-камеры', slug: 'webcams', parentId: peripherals.id, order: 5, isActive: true },
      // Networking children
      { id: '4-1', name: 'Wi-Fi роутеры', slug: 'routers', parentId: networking.id, order: 1, isActive: true },
      { id: '4-2', name: 'Сетевые карты', slug: 'network-cards', parentId: networking.id, order: 2, isActive: true },
    ],
  });

  // =====================================================
  // PRODUCTS
  // =====================================================
  console.log('📦 Creating products...');
  
  await prisma.product.createMany({
    data: [
      // Ноутбуки
      {
        id: 'prod-1',
        name: 'ASUS ROG Strix G16 Gaming Laptop',
        slug: 'asus-rog-strix-g16',
        description: 'Мощный игровой ноутбук с процессором Intel Core i7-13650HX и видеокартой NVIDIA GeForce RTX 4060.',
        shortDescription: 'Intel Core i7-13650HX, RTX 4060, 16GB RAM, 512GB SSD',
        price: 149990,
        oldPrice: 169990,
        images: [
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600',
          'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600',
        ],
        categoryId: '1-1',
        brand: 'ASUS',
        sku: 'ASUS-ROG-G16-001',
        inStock: true,
        stockQuantity: 15,
        specifications: [
          { name: 'Процессор', value: 'Intel Core i7-13650HX', group: 'Производительность' },
          { name: 'Видеокарта', value: 'NVIDIA GeForce RTX 4060 8GB', group: 'Производительность' },
          { name: 'Оперативная память', value: '16GB DDR5', group: 'Производительность' },
          { name: 'Накопитель', value: '512GB NVMe SSD', group: 'Хранение' },
        ],
        rating: 4.8,
        reviewsCount: 124,
        isNew: true,
        isFeatured: true,
        isOnSale: true,
      },
      {
        id: 'prod-2',
        name: 'Apple MacBook Pro 14" M3 Pro',
        slug: 'macbook-pro-14-m3-pro',
        description: 'Профессиональный ноутбук Apple с революционным чипом M3 Pro.',
        shortDescription: 'Apple M3 Pro, 18GB RAM, 512GB SSD, Liquid Retina XDR',
        price: 249990,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
        categoryId: '1-1',
        brand: 'Apple',
        sku: 'APPLE-MBP14-M3P',
        inStock: true,
        stockQuantity: 8,
        specifications: [
          { name: 'Процессор', value: 'Apple M3 Pro (12-core)', group: 'Производительность' },
          { name: 'GPU', value: '18-core GPU', group: 'Производительность' },
        ],
        rating: 4.9,
        reviewsCount: 89,
        isFeatured: true,
      },
      // Видеокарты
      {
        id: 'prod-3',
        name: 'NVIDIA GeForce RTX 4080 Super Founders Edition',
        slug: 'nvidia-rtx-4080-super-fe',
        description: 'Флагманская видеокарта NVIDIA с архитектурой Ada Lovelace.',
        shortDescription: '16GB GDDR6X, 2550MHz, 320-bit',
        price: 119990,
        oldPrice: 134990,
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600'],
        categoryId: '2-2',
        brand: 'NVIDIA',
        sku: 'NV-RTX4080S-FE',
        inStock: true,
        stockQuantity: 5,
        specifications: [
          { name: 'Видеопамять', value: '16GB GDDR6X', group: 'Память' },
          { name: 'CUDA ядра', value: '10240', group: 'Архитектура' },
        ],
        rating: 4.7,
        reviewsCount: 67,
        isOnSale: true,
        isFeatured: true,
      },
      {
        id: 'prod-4',
        name: 'AMD Radeon RX 7900 XTX',
        slug: 'amd-rx-7900-xtx',
        description: 'Топовая видеокарта AMD на архитектуре RDNA 3.',
        shortDescription: '24GB GDDR6, 2500MHz, 384-bit',
        price: 104990,
        images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600'],
        categoryId: '2-2',
        brand: 'AMD',
        sku: 'AMD-RX7900XTX',
        inStock: true,
        stockQuantity: 12,
        specifications: [
          { name: 'Видеопамять', value: '24GB GDDR6', group: 'Память' },
        ],
        rating: 4.6,
        reviewsCount: 45,
      },
      // Процессоры
      {
        id: 'prod-5',
        name: 'Intel Core i9-14900K',
        slug: 'intel-core-i9-14900k',
        description: 'Флагманский процессор Intel 14-го поколения.',
        shortDescription: '24 ядра, 32 потока, до 6.0 GHz, LGA1700',
        price: 54990,
        images: ['https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600'],
        categoryId: '2-1',
        brand: 'Intel',
        sku: 'INTEL-I9-14900K',
        inStock: true,
        stockQuantity: 20,
        specifications: [
          { name: 'Ядра/Потоки', value: '24 (8P+16E) / 32', group: 'Архитектура' },
          { name: 'Turbo частота', value: '6.0 GHz', group: 'Частоты' },
        ],
        rating: 4.8,
        reviewsCount: 156,
        isFeatured: true,
      },
      {
        id: 'prod-6',
        name: 'AMD Ryzen 9 7950X3D',
        slug: 'amd-ryzen-9-7950x3d',
        description: 'Лучший игровой процессор с технологией 3D V-Cache.',
        shortDescription: '16 ядер, 32 потока, до 5.7 GHz, AM5',
        price: 59990,
        images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600'],
        categoryId: '2-1',
        brand: 'AMD',
        sku: 'AMD-R9-7950X3D',
        inStock: true,
        stockQuantity: 10,
        specifications: [
          { name: 'Ядра/Потоки', value: '16 / 32', group: 'Архитектура' },
          { name: 'Кэш L3', value: '128MB (с 3D V-Cache)', group: 'Кэш' },
        ],
        rating: 4.9,
        reviewsCount: 98,
        isNew: true,
        isFeatured: true,
      },
      // Мониторы
      {
        id: 'prod-7',
        name: 'Samsung Odyssey G9 49" DQHD',
        slug: 'samsung-odyssey-g9-49',
        description: 'Ультраширокий изогнутый игровой монитор 49".',
        shortDescription: '49" VA, 5120x1440, 240Hz, 1ms, HDR1000',
        price: 129990,
        oldPrice: 149990,
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'],
        categoryId: '3-1',
        brand: 'Samsung',
        sku: 'SAM-G9-49-240',
        inStock: true,
        stockQuantity: 4,
        specifications: [
          { name: 'Диагональ', value: '49"', group: 'Дисплей' },
          { name: 'Разрешение', value: '5120x1440 (DQHD)', group: 'Дисплей' },
        ],
        rating: 4.7,
        reviewsCount: 34,
        isOnSale: true,
      },
      {
        id: 'prod-8',
        name: 'LG UltraGear 27GP850-B',
        slug: 'lg-ultragear-27gp850',
        description: 'Игровой монитор с Nano IPS матрицей.',
        shortDescription: '27" Nano IPS, 2560x1440, 180Hz, 1ms',
        price: 44990,
        images: ['https://images.unsplash.com/photo-1616763355603-9755a640a287?w=600'],
        categoryId: '3-1',
        brand: 'LG',
        sku: 'LG-27GP850-B',
        inStock: true,
        stockQuantity: 18,
        specifications: [
          { name: 'Диагональ', value: '27"', group: 'Дисплей' },
          { name: 'Частота обновления', value: '180Hz', group: 'Производительность' },
        ],
        rating: 4.6,
        reviewsCount: 78,
      },
      // SSD
      {
        id: 'prod-9',
        name: 'Samsung 990 Pro 2TB NVMe',
        slug: 'samsung-990-pro-2tb',
        description: 'Топовый NVMe SSD с интерфейсом PCIe 4.0.',
        shortDescription: '2TB, PCIe 4.0 x4, 7450/6900 MB/s',
        price: 18990,
        oldPrice: 22990,
        images: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600'],
        categoryId: '2-4',
        brand: 'Samsung',
        sku: 'SAM-990PRO-2TB',
        inStock: true,
        stockQuantity: 35,
        specifications: [
          { name: 'Объем', value: '2TB', group: 'Емкость' },
          { name: 'Скорость чтения', value: '7450 MB/s', group: 'Производительность' },
        ],
        rating: 4.9,
        reviewsCount: 234,
        isOnSale: true,
        isFeatured: true,
      },
      // Клавиатуры
      {
        id: 'prod-10',
        name: 'Keychron Q1 Pro Mechanical Keyboard',
        slug: 'keychron-q1-pro',
        description: 'Премиальная механическая клавиатура с беспроводным подключением.',
        shortDescription: '75%, Gateron G Pro, RGB, Bluetooth/USB-C',
        price: 17990,
        images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=600'],
        categoryId: '3-2',
        brand: 'Keychron',
        sku: 'KEY-Q1-PRO',
        inStock: true,
        stockQuantity: 22,
        specifications: [
          { name: 'Раскладка', value: '75% (84 клавиши)', group: 'Дизайн' },
          { name: 'Переключатели', value: 'Gateron G Pro (Hot-swap)', group: 'Механика' },
        ],
        rating: 4.8,
        reviewsCount: 56,
        isNew: true,
      },
      // Мыши
      {
        id: 'prod-11',
        name: 'Logitech G Pro X Superlight 2',
        slug: 'logitech-gpro-x-superlight-2',
        description: 'Ультралегкая беспроводная игровая мышь весом всего 60г.',
        shortDescription: '60г, HERO 2, 32000 DPI, LIGHTSPEED',
        price: 14990,
        images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=600'],
        categoryId: '3-3',
        brand: 'Logitech',
        sku: 'LOG-GPROX-SL2',
        inStock: true,
        stockQuantity: 28,
        specifications: [
          { name: 'Вес', value: '60г', group: 'Физические' },
          { name: 'DPI', value: 'до 32000', group: 'Сенсор' },
        ],
        rating: 4.9,
        reviewsCount: 189,
        isFeatured: true,
      },
      // RAM
      {
        id: 'prod-12',
        name: 'G.Skill Trident Z5 RGB DDR5-6400 32GB',
        slug: 'gskill-trident-z5-ddr5-6400-32gb',
        description: 'Комплект оперативной памяти DDR5 для энтузиастов.',
        shortDescription: '2x16GB, DDR5-6400, CL32, RGB',
        price: 21990,
        images: ['https://images.unsplash.com/photo-1562976540-1502c2145186?w=600'],
        categoryId: '2-3',
        brand: 'G.Skill',
        sku: 'GSK-TZ5-6400-32',
        inStock: true,
        stockQuantity: 14,
        specifications: [
          { name: 'Объем', value: '32GB (2x16GB)', group: 'Емкость' },
          { name: 'Частота', value: '6400MHz', group: 'Производительность' },
        ],
        rating: 4.7,
        reviewsCount: 67,
      },
    ],
  });

  // =====================================================
  // REVIEWS
  // =====================================================
  console.log('⭐ Creating reviews...');
  await prisma.review.createMany({
    data: [
      {
        productId: 'prod-1',
        userId: user1.id,
        userName: 'Алексей К.',
        rating: 5,
        title: 'Отличный игровой ноутбук!',
        content: 'Купил для игр и работы с 3D графикой. Очень доволен производительностью.',
        pros: ['Мощная видеокарта', 'Качественный экран', 'Хорошее охлаждение'],
        cons: ['Тяжеловат для переноски'],
        isVerified: true,
        helpfulCount: 24,
      },
      {
        productId: 'prod-3',
        userId: user1.id,
        userName: 'Дмитрий С.',
        rating: 5,
        title: 'Топ за свои деньги',
        content: 'Отличная видеокарта для 4K гейминга. Все игры летают на ультра настройках.',
        pros: ['Производительность в играх', 'DLSS 3', 'Ray Tracing'],
        cons: [],
        isVerified: true,
        helpfulCount: 45,
      },
      {
        productId: 'prod-9',
        userId: user1.id,
        userName: 'Игорь В.',
        rating: 5,
        title: 'Невероятная скорость!',
        content: 'После HDD это просто космос. Система грузится за секунды.',
        pros: ['Скорость чтения/записи', 'Надежность', 'Температурный режим'],
        cons: [],
        isVerified: true,
        helpfulCount: 67,
      },
    ],
  });

  // =====================================================
  // BANNERS
  // =====================================================
  console.log('🖼️ Creating banners...');
  await prisma.banner.createMany({
    data: [
      // Hero banners
      {
        type: 'HERO',
        title: 'Зимняя распродажа',
        subtitle: 'Скидки до 30% на видеокарты',
        description: 'Успейте приобрести топовые видеокарты RTX 4000 по лучшим ценам',
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&h=500&fit=crop',
        link: '/catalog/graphics-cards',
        buttonText: 'Смотреть каталог',
        backgroundColor: '#1a1a2e',
        textColor: '#ffffff',
        isActive: true,
        order: 1,
        discountPercent: 30,
      },
      {
        type: 'HERO',
        title: 'Новые ноутбуки 2024',
        subtitle: 'Игровые и профессиональные модели',
        description: 'Последние модели ASUS ROG, MSI и Apple MacBook уже в продаже',
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&h=500&fit=crop',
        link: '/catalog/laptops',
        buttonText: 'Выбрать ноутбук',
        backgroundColor: '#16213e',
        textColor: '#ffffff',
        isActive: true,
        order: 2,
      },
      {
        type: 'HERO',
        title: 'Профессиональный ремонт',
        subtitle: 'Гарантия на все работы 6 месяцев',
        description: 'Диагностика бесплатно при заказе ремонта',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1200&h=500&fit=crop',
        link: '/repair',
        buttonText: 'Оставить заявку',
        backgroundColor: '#0f3460',
        textColor: '#ffffff',
        isActive: true,
        order: 3,
      },
      // Promo banners
      {
        type: 'PROMO',
        title: 'Сборка ПК под ключ',
        subtitle: 'От 5000₽',
        image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop',
        link: '/services/pc-build',
        buttonText: 'Подробнее',
        isActive: true,
        order: 1,
      },
      {
        type: 'PROMO',
        title: 'Бесплатная доставка',
        subtitle: 'При заказе от 10 000₽',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
        link: '/delivery',
        buttonText: 'Условия',
        isActive: true,
        order: 2,
      },
      {
        type: 'PROMO',
        title: 'Рассрочка 0%',
        subtitle: 'На 12 месяцев',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
        link: '/credit',
        buttonText: 'Узнать больше',
        isActive: true,
        order: 3,
      },
    ],
  });

  // =====================================================
  // REPAIR SERVICES
  // =====================================================
  console.log('🔧 Creating repair services...');
  await prisma.repairService.createMany({
    data: [
      // Ноутбуки
      {
        id: 'rs-1',
        name: 'Замена матрицы ноутбука',
        description: 'Замена поврежденного или неисправного экрана ноутбука',
        category: 'LAPTOP',
        estimatedTime: '1-2 дня',
        priceFrom: 3500,
        priceTo: 15000,
        isPopular: true,
      },
      {
        id: 'rs-2',
        name: 'Замена клавиатуры ноутбука',
        description: 'Установка новой клавиатуры взамен поврежденной',
        category: 'LAPTOP',
        estimatedTime: '1-3 часа',
        priceFrom: 2000,
        priceTo: 8000,
        isPopular: true,
      },
      {
        id: 'rs-3',
        name: 'Чистка ноутбука от пыли',
        description: 'Профессиональная чистка системы охлаждения и замена термопасты',
        category: 'LAPTOP',
        estimatedTime: '1-2 часа',
        priceFrom: 1500,
        priceTo: 3000,
        isPopular: true,
      },
      // Desktop
      {
        id: 'rs-6',
        name: 'Сборка компьютера',
        description: 'Профессиональная сборка ПК из комплектующих заказчика',
        category: 'DESKTOP',
        estimatedTime: '2-4 часа',
        priceFrom: 3000,
        priceTo: 7000,
        isPopular: true,
      },
      {
        id: 'rs-7',
        name: 'Диагностика компьютера',
        description: 'Полная диагностика всех компонентов системного блока',
        category: 'DESKTOP',
        estimatedTime: '1 час',
        priceFrom: 500,
        priceTo: 1500,
      },
      // Data recovery
      {
        id: 'rs-11',
        name: 'Восстановление данных с HDD',
        description: 'Восстановление информации с поврежденного жесткого диска',
        category: 'DATA_RECOVERY',
        estimatedTime: '1-7 дней',
        priceFrom: 5000,
        priceTo: 30000,
        isPopular: true,
      },
      // Upgrade
      {
        id: 'rs-13',
        name: 'Установка SSD',
        description: 'Установка SSD с переносом системы и данных',
        category: 'UPGRADE',
        estimatedTime: '1-2 часа',
        priceFrom: 1000,
        priceTo: 2500,
        isPopular: true,
      },
    ],
  });

  // =====================================================
  // PROMO CODES
  // =====================================================
  console.log('🎟️ Creating promo codes...');
  await prisma.promoCode.createMany({
    data: [
      { code: 'WINTER10', discount: 10, discountType: 'PERCENTAGE', isActive: true },
      { code: 'WELCOME500', discount: 500, discountType: 'FIXED', isActive: true },
      { code: 'SALE15', discount: 15, discountType: 'PERCENTAGE', isActive: true },
    ],
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
