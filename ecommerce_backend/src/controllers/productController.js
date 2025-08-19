const { ok, notFound, badRequest } = require('../utils/apiResponse');
const productService = require('../services/productService');

class ProductController {
  // PUBLIC_INTERFACE
  async list(req, res, next) {
    /** Lists products with pagination and filters: q (search), category (slug), page, pageSize. */
    try {
      const { q, category, page = '1', pageSize = '20' } = req.query;
      const pg = Math.max(1, parseInt(page, 10) || 1);
      const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
      const data = await productService.list({ page: pg, pageSize: ps, q, category });
      return ok(res, data, { totalPages: Math.ceil(data.total / ps) });
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC_INTERFACE
  async detail(req, res, next) {
    /** Returns product detail by :id. */
    try {
      const id = req.params.id;
      if (!/^\d+$/.test(id)) return badRequest(res, 'Invalid id');
      const product = await productService.getById(id);
      return ok(res, product);
    } catch (err) {
      if (err.statusCode === 404) return notFound(res, 'Product not found');
      next(err);
    }
  }
}

module.exports = new ProductController();
