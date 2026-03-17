import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - TikTok Developer',
  description: 'Terms of Service for TikTok Developer API integration',
}

export default function TermsOfServicePage() {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      color: '#ffffff',
      backgroundColor: '#000000'
    }}>
      <h1 style={{
        color: '#ffffff',
        borderBottom: '2px solid #ff0050',
        paddingBottom: '10px'
      }}>Terms of Service</h1>
      <p>Last updated: March 18, 2026</p>
      
      <h2 style={{ color: '#ffffff', marginTop: '30px' }}>TikTok Developer API Terms</h2>
      
      <h3 style={{ color: '#ffffff' }}>1. Acceptance of Terms</h3>
      <p>By accessing and using our TikTok Developer API integration services, you agree to be bound by these Terms of Service.</p>
      
      <h3 style={{ color: '#ffffff' }}>2. API Usage</h3>
      <p>You may use our TikTok Developer API services in accordance with TikTok's Developer Terms of Service and API documentation.</p>
      
      <h3 style={{ color: '#ffffff' }}>3. Rate Limits</h3>
      <p>API calls are subject to rate limits as specified in TikTok's API documentation. Excessive requests may be throttled or blocked.</p>
      
      <h3 style={{ color: '#ffffff' }}>4. Data Usage</h3>
      <p>All data obtained through TikTok API must be used in compliance with TikTok's data usage policies and applicable privacy laws.</p>
      
      <h3 style={{ color: '#ffffff' }}>5. Prohibited Uses</h3>
      <ul style={{ marginLeft: '20px' }}>
        <li style={{ marginBottom: '8px' }}>Spam or automated content generation</li>
        <li style={{ marginBottom: '8px' }}>Data scraping beyond API limits</li>
        <li style={{ marginBottom: '8px' }}>Violation of TikTok's community guidelines</li>
        <li style={{ marginBottom: '8px' }}>Reverse engineering of API endpoints</li>
      </ul>
      
      <h3 style={{ color: '#ffffff' }}>6. Intellectual Property</h3>
      <p>TikTok's API and related documentation remain the intellectual property of TikTok and its affiliates.</p>
      
      <h3 style={{ color: '#ffffff' }}>7. Disclaimer</h3>
      <p>Our service provides integration with TikTok's API but is not affiliated with or endorsed by TikTok. TikTok's terms and policies govern all API usage.</p>
      
      <h3 style={{ color: '#ffffff' }}>8. Limitation of Liability</h3>
      <p>We are not liable for any damages resulting from API downtime, rate limiting, or changes to TikTok's API.</p>
      
      <h3 style={{ color: '#ffffff' }}>9. Termination</h3>
      <p>We reserve the right to terminate access to our services for violations of these terms or TikTok's policies.</p>
      
      <h3 style={{ color: '#ffffff' }}>10. Contact</h3>
      <p>For questions about these terms, contact us at: suncah147@gmail.com</p>
      
      <h2 style={{ color: '#ffffff', marginTop: '30px' }}>TikTok Developer Links</h2>
      <ul style={{ marginLeft: '20px' }}>
        <li style={{ marginBottom: '8px' }}>
          <a href="https://developers.tiktok.com" target="_blank" rel="noopener" style={{ color: '#ff0050' }}>
            TikTok Developer Portal
          </a>
        </li>
        <li style={{ marginBottom: '8px' }}>
          <a href="https://developers.tiktok.com/doc" target="_blank" rel="noopener" style={{ color: '#ff0050' }}>
            API Documentation
          </a>
        </li>
        <li style={{ marginBottom: '8px' }}>
          <a href="https://www.tiktok.com/legal/terms-of-use" target="_blank" rel="noopener" style={{ color: '#ff0050' }}>
            TikTok Terms of Use
          </a>
        </li>
      </ul>
    </div>
  )
}
