const Razorpay = require('razorpay');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { amount, notes } = JSON.parse(event.body || '{}');
    if (!amount || isNaN(amount) || amount <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) };
    }
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      notes: notes || {},
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, amount: order.amount, currency: order.currency }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Order creation failed', details: err.message }) };
  }
};
