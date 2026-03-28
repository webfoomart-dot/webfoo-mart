"use server"

export async function sendTelegramAlertAction(totalAmount: number, address: string, phone: string, name: string, items: any[]) {
  // Ye seedha .env tijori se token uthayega, kisi ko dikhega nahi
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram credentials missing in .env");
    return;
  }

  let itemsText = "";
  items.forEach((item) => {
    itemsText += `▪️ ${item.quantity}x ${item.name}\n`;
  });

  const message = `🚨 *NAYA ORDER AAYA HAI!* 🚨\n\n👤 *Customer:* ${name}\n📞 *Phone:* ${phone}\n\n🛒 *Items:*\n${itemsText}\n💰 *Final Bill:* ₹${totalAmount}\n📍 *Address:* ${address}\n\nJaldi WebFoo Mart Admin Panel check kar! 🚀`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

  try {
    await fetch(url);
  } catch (error) {
    console.error("Telegram alert fail ho gaya", error);
  }
}
