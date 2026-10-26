import express from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

/**
 * Validates Telegram Mini App initData according to Telegram's official specification.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramWebAppData(initData: string, botToken: string): {
  valid: boolean;
  user?: any;
  authDate?: number;
  reason?: string;
} {
  if (!initData || !botToken) {
    return { valid: false, reason: 'Missing initData or botToken' };
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return { valid: false, reason: 'No hash parameter found in initData' };
    }

    urlParams.delete('hash');

    // Sort parameters alphabetically
    const paramsList: string[] = [];
    urlParams.forEach((val, key) => {
      paramsList.push(`${key}=${val}`);
    });
    paramsList.sort();
    const dataCheckString = paramsList.join('\n');

    // secret_key = HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // calculated_hash = HMAC_SHA256(secretKey, dataCheckString)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const isValid = calculatedHash === hash;

    if (!isValid) {
      return { valid: false, reason: 'Cryptographic HMAC mismatch' };
    }

    const authDate = Number(urlParams.get('auth_date'));
    const userRaw = urlParams.get('user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    // Check freshness: reject if older than 24 hours (86400 seconds)
    const now = Math.floor(Date.now() / 1000);
    if (authDate && now - authDate > 86400) {
      return { valid: false, reason: 'initData has expired (>24 hours old)', user, authDate };
    }

    return { valid: true, user, authDate };
  } catch (error: any) {
    return { valid: false, reason: error?.message || 'Verification exception' };
  }
}

// Health and diagnostic endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    telegramVerificationReady: Boolean(process.env.TELEGRAM_BOT_TOKEN),
  });
});

// Telegram initData verification endpoint
app.post('/api/telegram/verify', (req, res) => {
  const { initData } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!initData) {
    return res.status(400).json({
      success: false,
      error: 'Missing "initData" payload in request body.',
    });
  }

  if (!botToken) {
    // If bot token is not configured in server environment yet,
    // we parse the payload safely and indicate that server validation is pending TELEGRAM_BOT_TOKEN
    try {
      const urlParams = new URLSearchParams(initData);
      const userRaw = urlParams.get('user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      const authDate = urlParams.get('auth_date');

      return res.json({
        success: false,
        verified: false,
        warning: 'TELEGRAM_BOT_TOKEN is not configured on the server yet. To enable cryptographic HMAC-SHA256 verification, set TELEGRAM_BOT_TOKEN in your environment.',
        parsedData: {
          user,
          authDate: authDate ? Number(authDate) : undefined,
          queryId: urlParams.get('query_id'),
        },
      });
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse initData string.',
      });
    }
  }

  const result = verifyTelegramWebAppData(initData, botToken);
  return res.json({
    success: result.valid,
    verified: result.valid,
    reason: result.reason,
    user: result.user,
    authDate: result.authDate,
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Telegram Monetag Mini App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
