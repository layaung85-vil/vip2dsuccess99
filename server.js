const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = '8831967571:AAEBDT3QYhzJqDiwICefvKvsba1rR6FcA1o';
const CHAT_ID = '8734240198';

let siteData = {
    depositRate: "0",
    customNumber: "0",
    updatedTime: "မရှိသေးပါ။"
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my_admin_secret_key',
    resave: false,
    saveUninitialized: true
}));

const ADMIN_USER = 'admin';
const ADMIN_PASS = '12345';

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.isAdmin = true;
        return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: 'Username သို့မဟုတ် Password မှားယွင်းနေပါသည်။' });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin.html');
});

app.get('/api/get-data', (req, res) => {
    res.json(siteData);
});

app.post('/api/update-data', async (req, res) => {
    if (!req.session || !req.session.isAdmin) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { depositRate, customNumber } = req.body;
    
    siteData.depositRate = depositRate;
    siteData.customNumber = customNumber;
    siteData.updatedTime = new Date().toLocaleString();

    const message = `🔄 *Manual Update Notification*\n\n💰 *Deposit နှုန်းထား:* \({depositRate}\n🔢 *ဂဏန်းအသစ်:*\){customNumber}\n⏱ *ချိန်ရာဇဝင်:* ${siteData.updatedTime}\n\n💬 ဆက်သွယ်ရန် Admin: t.me/myandigitalpay`;

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        res.json({ success: true, message: 'ဒေတာများကို အောင်မြင်စွာ ပြင်ဆင်ပြီး Telegram သို့ ပို့ပြီးပါပြီ။' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Telegram သို့ ပို့ရာတွင် အမှားအယွင်းရှိသည်။' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});