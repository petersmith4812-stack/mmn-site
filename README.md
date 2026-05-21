# 🕌 Mini Muslims Nest — Website

Pakistan's First Mommy-Inclusive Preschool  
**minimuslimsnest@gmail.com · +92 306 505 8989 · Lahore**

---

## 🚀 Deploy in 5 Steps (No Coding Knowledge Needed)

### Step 1 — Install Node.js
Download and install from: **https://nodejs.org**  
Choose the version labelled **LTS (Recommended)**. Just click Next through the installer.

---

### Step 2 — Install Git
Download and install from: **https://git-scm.com/downloads**  
Again, just click Next through the installer.

---

### Step 3 — Create a Free GitHub Account
Go to **https://github.com** and sign up for a free account.

Then create a new repository:
- Click the **+** button (top right) → **New repository**
- Name it: `mini-muslims-nest`
- Make it **Public**
- Click **Create repository**

---

### Step 4 — Upload This Project to GitHub

Open a terminal (on Windows: search "Command Prompt"; on Mac: search "Terminal") and run these commands one by one:

```bash
cd mmn-site
git init
git add .
git commit -m "Mini Muslims Nest website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mini-muslims-nest.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

---

### Step 5 — Deploy on Vercel (Free)

1. Go to **https://vercel.com** and click **Sign Up with GitHub**
2. Click **Add New Project**
3. Find your `mini-muslims-nest` repo and click **Import**
4. Leave all settings as-is — Vercel detects React automatically
5. Click **Deploy**

✅ In about 60 seconds, your site will be live at:  
**`https://mini-muslims-nest.vercel.app`**

---

## 🌐 Connecting a Custom Domain (e.g. minimuslimsnest.com)

1. Buy your domain from **Namecheap** or **GoDaddy**
2. In Vercel dashboard → your project → **Settings** → **Domains**
3. Type your domain and follow the DNS instructions (copy-paste 2 values)
4. Done — live on your own domain within minutes!

---

## ✏️ Making Changes Later

To update any text or section:
1. Open `src/App.jsx` in any text editor (Notepad works)
2. Make your changes and save
3. Run in terminal:
```bash
git add .
git commit -m "Updated website content"
git push
```
Vercel automatically re-deploys within 30 seconds. No manual step needed.

---

## 📁 File Structure

```
mmn-site/
├── public/
│   └── index.html          ← Page title, SEO, favicon
├── src/
│   ├── App.jsx             ← THE ENTIRE WEBSITE (edit this)
│   └── index.js            ← React entry point (don't touch)
├── package.json            ← App dependencies
├── vercel.json             ← Vercel config
└── .gitignore              ← Files Git ignores
```

---

Built with ❤️ for Mini Muslims Nest · Lahore, Pakistan
