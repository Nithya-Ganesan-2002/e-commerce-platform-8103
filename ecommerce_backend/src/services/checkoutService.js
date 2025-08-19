const prisma = require('../db/prisma');

class CheckoutService {
  /**
   * Calculates totals for the user's current cart.
   */
  async _calculateTotals(cart) {
    let total = 0;
    for (const item of cart.items) {
      total += Number(item.product.price) * item.quantity;
    }
    return { totalAmount: Number(total.toFixed(2)) };
  }

  // PUBLIC_INTERFACE
  async checkout(userId, payload) {
    /** Performs checkout: creates order from cart, runs payment capture (stub), clears cart. */
    // Load cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      const err = new Error('Cart is empty');
      err.statusCode = 400;
      throw err;
    }

    const { totalAmount } = await this._calculateTotals(cart);

    // Integration point: call payment provider here with payload.paymentMethod, etc.
    // Simulate payment success and return a reference id.
    const paymentRef = `PAY-${Date.now()}`;

    // Create order within a transaction
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PAID',
          paymentRef,
          shippingAddr: payload?.shippingAddress || 'N/A',
          items: {
            create: cart.items.map((ci) => ({
              productId: ci.productId,
              quantity: ci.quantity,
              unitPrice: ci.product.price,
            })),
          },
        },
        include: { items: true },
      });

      // Reduce stock
      for (const ci of cart.items) {
        await tx.product.update({
          where: { id: ci.productId },
          data: { stock: { decrement: ci.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return { order, paymentRef };
  }

  // PUBLIC_INTERFACE
  async listOrders(userId) {
    /** Returns orders for a user with items and products. */
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
  }

  // PUBLIC_INTERFACE
  async getOrder(userId, orderId) {
    /** Returns one order if it belongs to user. */
    const id = Number(orderId);
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }
    return order;
  }
}

module.exports = new CheckoutService();
