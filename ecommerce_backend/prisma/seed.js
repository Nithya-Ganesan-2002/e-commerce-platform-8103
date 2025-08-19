const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics' },
  });

  const apparel = await prisma.category.upsert({
    where: { slug: 'apparel' },
    update: {},
    create: { name: 'Apparel', slug: 'apparel' },
  });

  await prisma.product.upsert({
    where: { slug: 'smartphone-xyz' },
    update: {},
    create: {
      name: 'Smartphone XYZ',
      slug: 'smartphone-xyz',
      description: 'A powerful smartphone with great camera.',
      price: 699.99,
      stock: 100,
      imageUrl: 'https://via.placeholder.com/300x200',
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'wireless-headphones' },
    update: {},
    create: {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Noise-cancelling over-ear headphones.',
      price: 199.99,
      stock: 200,
      imageUrl: 'https://via.placeholder.com/300x200',
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'cotton-tshirt' },
    update: {},
    create: {
      name: 'Cotton T-shirt',
      slug: 'cotton-tshirt',
      description: 'Soft cotton T-shirt available in multiple sizes.',
      price: 19.99,
      stock: 500,
      imageUrl: 'https://via.placeholder.com/300x200',
      categoryId: apparel.id,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
