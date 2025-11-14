// app/api/pump-rank-test/route.ts
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

// Konfigurasi Chromium
chromium.setGraphicsMode = false;
const CHROMIUM_VERSION = '126.0.0';

// Generate client_id dinamis sesuai tanggal
function generateClientId() {
  const now = new Date();
  return `gmgn_web_${now.getFullYear()}.${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}.${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maksimal timeout 60 detik

export async function GET(req: Request) {
  const targetUrl = new URL(req.url);
  const searchParams = new URLSearchParams(targetUrl.search);
  
  try {
    // 1. Konfigurasi Browser dengan Stealth Mode
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(
        `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_VERSION}/chromium-v${CHROMIUM_VERSION}-pack.tar`
      ),
      headless: chromium.headless // boolean (true/false),
    });

    // 2. Setup Halaman dengan Fingerprint Acak
    const page = await browser.newPage();
    
    // Set header dan user-agent acak
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Not/A:Brand";v="99", "Brave";v="133", "Chromium";v="133"',
      'Client-Id': generateClientId(),
    });
    
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    );

    // 3. Bypass Cloudflare Challenge
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { 
        get: () => ['en-US', 'en']
      });
    });

    // 4. Navigasi ke URL Target dengan Delay Acak
    const url = searchParams.get('url') || 'https://gmgn.ai';
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // 5. Simulasi Interaksi Manusia
    await page.mouse.move(
      Math.random() * 800,
      Math.random() * 600
    );
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 6. Ekstrak Data
    const data = await page.evaluate(() => {
      return {
        title: document.title,
        content: document.documentElement.outerHTML,
        cookies: document.cookie,
        userAgent: navigator.userAgent
      };
    });

    await browser.close();

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        clientId: generateClientId(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to bypass protection',
        solution: [
          'Coba rotate user-agent',
          'Update cookies secara berkala',
          'Gunakan proxy residential'
        ]
      },
      { status: 503 }
    );
  }
}