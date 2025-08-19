const prisma = require('../db/prisma');

class CartService {
  // PUBLIC_INTERFACE
  async getCart(userId) {
    /** Returns the authenticated user's cart with items and product info. */
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    if (!cart) {
      // Create a new cart if missing (safety)
      return prisma.cart.create({
        data: { userId: userId },
        include: { items: { include: { product: true } } },
      });
    }
    return cart;
  }

  // PUBLIC_INTERFACE
  async addItem(userId, productId, quantity = 1) {
    /** Adds or increments an item in the user's cart. */
    const cart = await this.getCart(userId);
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    const item = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId: product.id, quantity },
      include: { product: true },
    });
    return this.getCart(userId);
  }

  // PUBLIC_INTERFACE
  async updateItem(userId, productId, quantity) {
    /** Updates quantity of an existing item; removes if quantity <= 0. */
    const cart = await this.getCart(userId);
    const key = { cartId_productId: { cartId: cart.id, productId: Number(productId) } };
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: key }).catch(() => {});
      return this.getCart(userId);
    }
    await prisma.cartItem.update({ where: key, data: { quantity } });
    return this.getCart(userId);
  }

  // PUBLIC_INTERFACE
  async removeItem(userId, productId) {
    /** Removes an item from cart. */
    const cart = await this.getCart(userId);
    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId: Number(productId) } },
    }).catch(() => {});
    return this.getCart(userId);
  }

  // PUBLIC_INTERFACE
  async clear(userId) {
    /** Clears the user's cart. */
    const cart = await this.getCart(userId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }
}

module.exports = new CartService();
