const { ok, badRequest, notFound } = require('../utils/apiResponse');
const checkoutService = require('../services/checkoutService');

class CheckoutController {
  // PUBLIC_INTERFACE
  async checkout(req, res, next) {
    /** Performs checkout for current user. Body may contain shippingAddress and payment details. */
    try {
      const result = await checkoutService.checkout(req.user.id, req.body || {});
      return ok(res, result);
    } catch (err) {
      if (err.statusCode === 400) return badRequest(res, err.message);
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async list(req, res, next) {
    /** Lists current user's orders. */
    try {
      const orders = await checkoutService.listOrders(req.user.id);
      return ok(res, orders);
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async detail(req, res, next) {
    /** Gets one order by id for current user. */
    try {
      const { id } = req.params;
      const order = await checkoutService.getOrder(req.user.id, id);
      return ok(res, order);
    } catch (err) {
      if (err.statusCode === 404) return notFound(res, 'Order not found');
      next(err);
    }
  }
}

module.exports = new CheckoutController();
