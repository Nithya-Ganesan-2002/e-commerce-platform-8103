const { ok, badRequest, notFound } = require('../utils/apiResponse');
const cartService = require('../services/cartService');

class CartController {
  // PUBLIC_INTERFACE
  async get(req, res, next) {
    /** Returns user's current cart with items. Requires auth. */
    try {
      const cart = await cartService.getCart(req.user.id);
      return ok(res, cart);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async add(req, res, next) {
    /** Adds item to cart: body { productId, quantity }. */
    try {
      const { productId, quantity = 1 } = req.body || {};
      if (!productId || !/^\d+$/.test(String(productId))) return badRequest(res, 'Invalid productId');
      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      const cart = await cartService.addItem(req.user.id, Number(productId), qty);
      return ok(res, cart);
    } catch (err) {
      if (err.statusCode === 404) return notFound(res, 'Product not found');
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async update(req, res, next) {
    /** Updates item quantity: body { productId, quantity }. */
    try {
      const { productId, quantity } = req.body || {};
      if (!productId || !/^\d+$/.test(String(productId))) return badRequest(res, 'Invalid productId');
      if (quantity == null || isNaN(Number(quantity))) return badRequest(res, 'Invalid quantity');
      const qty = parseInt(quantity, 10);
      const cart = await cartService.updateItem(req.user.id, Number(productId), qty);
      return ok(res, cart);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async remove(req, res, next) {
    /** Removes an item by productId. */
    try {
      const { productId } = req.params;
      if (!productId || !/^\d+$/.test(String(productId))) return badRequest(res, 'Invalid productId');
      const cart = await cartService.removeItem(req.user.id, Number(productId));
      return ok(res, cart);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async clear(req, res, next) {
    /** Clears cart. */
    try {
      const cart = await cartService.clear(req.user.id);
      return ok(res, cart);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CartController();
