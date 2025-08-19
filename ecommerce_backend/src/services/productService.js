const prisma = require('../db/prisma');

class ProductService {
  // PUBLIC_INTERFACE
  async list({ page = 1, pageSize = 20, q, category }) {
    /** Returns paginated product list with optional search and category filter. */
    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { slug: category };
    }
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  // PUBLIC_INTERFACE
  async getById(id) {
    /** Returns product by id including category. */
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    return product;
  }
}

module.exports = new ProductService();
