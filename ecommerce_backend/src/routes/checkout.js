const express = require('express');
const controller = require('../controllers/checkoutController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Checkout and order management
 */

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Checkout current cart and create an order
 *     tags: [Checkout]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress: { type: string }
 *               paymentMethod: { type: string, example: "card" }
 *               paymentToken: { type: string, description: "Token from payment provider" }
 *     responses:
 *       200: { description: Checkout result including order and paymentRef }
 */
router.post('/', authRequired, controller.checkout.bind(controller));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List current user's orders
 *     tags: [Checkout]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of orders }
 */
router.get('/orders', authRequired, controller.list.bind(controller));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Checkout]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200: { description: Order detail }
 *       404: { description: Not found }
 */
router.get('/orders/:id', authRequired, controller.detail.bind(controller));

module.exports = router;
