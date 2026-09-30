exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { amount, notes } = JSON.parse(event.body || '{}');
    if (!amount || isNaN(amount) || amount <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) };
    }
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        notes: notes || {}
      })
    });
    const order = await res.json();
    if (!res.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Razorpay error', details: order }) };
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, amount: order.amount, currency: order.currency })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Order creation failed', details: err.message }) };
  }
};
