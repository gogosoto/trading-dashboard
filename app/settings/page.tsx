"use client";

import { useState, useEffect } from 'react';

interface ApiConfig {
  oandaApiKey: string;
  oandaAccountId: string;
  telegramBotToken: string;
  telegramChatId: string;
  tradingMode: 'paper' | 'semi-auto';
  confidenceThreshold: number;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ApiConfig>({
    oandaApiKey: '',
    oandaAccountId: '',
    telegramBotToken: '',
    telegramChatId: '',
    tradingMode: 'paper',
    confidenceThreshold: 70,
  });
  
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('trading_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(prev => ({ ...prev, ...parsed }));
    }
  }, []);

  // Save to localStorage
  const handleSave = () => {
    localStorage.setItem('trading_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Clear all data
  const handleClear = () => {
    if (confirm('Are you sure? This will delete all API keys.')) {
      localStorage.removeItem('trading_config');
      setConfig({
        oandaApiKey: '',
        oandaAccountId: '',
        telegramBotToken: '',
        telegramChatId: '',
        tradingMode: 'paper',
        confidenceThreshold: 70,
      });
      setSaved(true);
    }
  };

  const toggleShow = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>⚙️ Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Configure your trading credentials securely
          </p>
        </div>
      </header>

      {/* Status Banner */}
      {saved && (
        <div style={{
          background: 'var(--accent-green)',
          color: '#000',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontWeight: '600',
        }}>
          ✅ Settings saved securely!
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        
        {/* OANDA Configuration */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🏦 OANDA API</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Forex Broker</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* API Key */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                API Key
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showKeys.oandaKey ? 'text' : 'password'}
                  value={config.oandaApiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, oandaApiKey: e.target.value }))}
                  placeholder="8da25fa2d73ca408..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
                <button
                  onClick={() => toggleShow('oandaKey')}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {showKeys.oandaKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Account ID */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Account ID
              </label>
              <input
                type="text"
                value={config.oandaAccountId}
                onChange={(e) => setConfig(prev => ({ ...prev, oandaAccountId: e.target.value }))}
                placeholder="001-001-12345678-001"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <a 
              href="https://www.oanda.com/account/security" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: 'var(--accent-blue)' }}
            >
              → Get your OANDA API key
            </a>
          </div>
        </div>

        {/* Telegram Configuration */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📱 Telegram Bot</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trade Alerts</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Bot Token */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Bot Token
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showKeys.telegramToken ? 'text' : 'password'}
                  value={config.telegramBotToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, telegramBotToken: e.target.value }))}
                  placeholder="123456:ABC-DEF..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
                <button
                  onClick={() => toggleShow('telegramToken')}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {showKeys.telegramToken ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Chat ID */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Your Chat ID
              </label>
              <input
                type="text"
                value={config.telegramChatId}
                onChange={(e) => setConfig(prev => ({ ...prev, telegramChatId: e.target.value }))}
                placeholder="123456789"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <a 
              href="https://t.me/BotFather" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: 'var(--accent-blue)' }}
            >
              → Create bot with @BotFather
            </a>
            <a 
              href="https://t.me/userinfobot" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: 'var(--accent-blue)' }}
            >
              → Get your Chat ID from @userinfobot
            </a>
          </div>
        </div>

        {/* Trading Settings */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 Trading Settings</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Trading Mode */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Trading Mode
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, tradingMode: 'paper' }))}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: config.tradingMode === 'paper' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                    border: `1px solid ${config.tradingMode === 'paper' ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    color: config.tradingMode === 'paper' ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  📝 Paper
                </button>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, tradingMode: 'semi-auto' }))}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: config.tradingMode === 'semi-auto' ? 'var(--accent-yellow)' : 'var(--bg-secondary)',
                    border: `1px solid ${config.tradingMode === 'semi-auto' ? 'var(--accent-yellow)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    color: config.tradingMode === 'semi-auto' ? '#000' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  ⚡ Semi-Auto
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                {config.tradingMode === 'paper' 
                  ? 'Simulated trading with virtual money' 
                  : 'You approve trades via Telegram before execution'}
              </p>
            </div>

            {/* Confidence Threshold */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Minimum Confidence: {config.confidenceThreshold}%
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={config.confidenceThreshold}
                onChange={(e) => setConfig(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>50% (More signals)</span>
                <span>95% (Only best)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Security Info */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔒 Security</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--success-bg)', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                ✅ Stored Locally
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Your API keys are stored in your browser only. 
                Never sent to any server.
              </p>
            </div>
            
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                🔑 Keep Secrets Safe
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Never share your API keys. Revoke and create new ones 
                if keys are exposed.
              </p>
            </div>

            <button
              onClick={handleClear}
              style={{
                padding: '12px',
                background: 'transparent',
                border: '1px solid var(--accent-red)',
                borderRadius: '8px',
                color: 'var(--accent-red)',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>

      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '16px 32px',
            background: 'var(--accent-green)',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          💾 Save Settings
        </button>
        
        <a 
          href="/"
          style={{
            padding: '16px 32px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          ← Back to Dashboard
        </a>
      </div>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '24px', 
        color: 'var(--text-muted)',
        fontSize: '12px',
        borderTop: '1px solid var(--border-color)',
        marginTop: '48px'
      }}>
        <p>Wyckoff + VPA Trading System</p>
        <p style={{ marginTop: '8px' }}>
          Multi-Timeframe Analysis • Confidence Scoring
        </p>
      </footer>
    </div>
  );
}
