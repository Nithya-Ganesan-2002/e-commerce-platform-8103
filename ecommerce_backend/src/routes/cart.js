const express = require('express');
const controller = require('../controllers/cartController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cart data }
 */
router.get('/', authRequired, controller.get.bind(controller));

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: integer }
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       200: { description: Updated cart }
 */
router.post('/', authRequired, controller.add.bind(controller));

/**
 * @swagger
 * /cart:
 *   put:
 *     summary: Update item quantity
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: integer }
 *               quantity: { type: integer }
 *     responses:
 *       200: { description: Updated cart }
 */
router.put('/', authRequired, controller.update.bind(controller));

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remove an item from cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated cart }
 */
router.delete('/:productId', authRequired, controller.remove.bind(controller));

/**
 * @swagger
 * /cart/clear:
 *   post:
 *     summary: Clear the cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cleared cart }
 */
router.post('/clear', authRequired, controller.clear.bind(controller));

module.exports = router;
