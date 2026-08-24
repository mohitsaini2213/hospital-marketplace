const sendSMS = async (mobile, otpCode) => {
  if (!process.env.MSG91_AUTH_KEY) {
    console.log(`[SMS:DEV] OTP for ${mobile}: ${otpCode}`);
    return { success: true, dev: true };
  }
  try {
    const res = await fetch('https://control.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: process.env.MSG91_AUTH_KEY },
      body: JSON.stringify({
        mobile,
        otp: otpCode,
        sender: process.env.MSG91_SENDER_ID,
        template_id: process.env.MSG91_TEMPLATE_ID,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('[MSG91] failed:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendSMS };
