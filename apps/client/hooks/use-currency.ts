'use client'

import { useState, useEffect } from 'react';

interface CurrencyInfo {
  symbol: string;
  code: string;
  position: 'before' | 'after';
}

// Currency mapping based on exchange data and common countries
const currencyMap: Record<string, CurrencyInfo> = {
  'US': { symbol: '$', code: 'USD', position: 'before' },
  'United States': { symbol: '$', code: 'USD', position: 'before' },
  'GB': { symbol: '£', code: 'GBP', position: 'before' },
  'United Kingdom': { symbol: '£', code: 'GBP', position: 'before' },
  'IN': { symbol: '₹', code: 'INR', position: 'before' },
  'India': { symbol: '₹', code: 'INR', position: 'before' },
  'CA': { symbol: 'C$', code: 'CAD', position: 'before' },
  'Canada': { symbol: 'C$', code: 'CAD', position: 'before' },
  'AU': { symbol: 'A$', code: 'AUD', position: 'before' },
  'Australia': { symbol: 'A$', code: 'AUD', position: 'before' },
  'DE': { symbol: '€', code: 'EUR', position: 'after' },
  'Germany': { symbol: '€', code: 'EUR', position: 'after' },
  'FR': { symbol: '€', code: 'EUR', position: 'after' },
  'France': { symbol: '€', code: 'EUR', position: 'after' },
  'JP': { symbol: '¥', code: 'JPY', position: 'before' },
  'Japan': { symbol: '¥', code: 'JPY', position: 'before' },
  'CN': { symbol: '¥', code: 'CNY', position: 'before' },
  'China': { symbol: '¥', code: 'CNY', position: 'before' },
  'BR': { symbol: 'R$', code: 'BRL', position: 'before' },
  'Brazil': { symbol: 'R$', code: 'BRL', position: 'before' },
  'MX': { symbol: '$', code: 'MXN', position: 'before' },
  'Mexico': { symbol: '$', code: 'MXN', position: 'before' },
  'KR': { symbol: '₩', code: 'KRW', position: 'before' },
  'South Korea': { symbol: '₩', code: 'KRW', position: 'before' },
  'SG': { symbol: 'S$', code: 'SGD', position: 'before' },
  'Singapore': { symbol: 'S$', code: 'SGD', position: 'before' },
  'HK': { symbol: 'HK$', code: 'HKD', position: 'before' },
  'Hong Kong': { symbol: 'HK$', code: 'HKD', position: 'before' },
  'CH': { symbol: 'CHF', code: 'CHF', position: 'after' },
  'Switzerland': { symbol: 'CHF', code: 'CHF', position: 'after' },
  'SE': { symbol: 'kr', code: 'SEK', position: 'after' },
  'Sweden': { symbol: 'kr', code: 'SEK', position: 'after' },
  'NO': { symbol: 'kr', code: 'NOK', position: 'after' },
  'Norway': { symbol: 'kr', code: 'NOK', position: 'after' },
  'DK': { symbol: 'kr', code: 'DKK', position: 'after' },
  'Denmark': { symbol: 'kr', code: 'DKK', position: 'after' },
};

// Exchange-specific currency mapping
const exchangeCurrencyMap: Record<string, CurrencyInfo> = {
  'NASDAQ': { symbol: '$', code: 'USD', position: 'before' },
  'NYSE': { symbol: '$', code: 'USD', position: 'before' },
  'LSE': { symbol: '£', code: 'GBP', position: 'before' },
  'NSE': { symbol: '₹', code: 'INR', position: 'before' },
  'BSE': { symbol: '₹', code: 'INR', position: 'before' },
};

export const useCurrency = (exchange?: string) => {
  const [currency, setCurrency] = useState<CurrencyInfo>({ symbol: '$', code: 'USD', position: 'before' });
  const [userCountry, setUserCountry] = useState<string>('');

  useEffect(() => {
    // Try to detect user's country from browser locale
    const detectUserCountry = async () => {
      try {
        // First try to get from browser locale
        const locale = navigator.language || navigator.languages?.[0];
        const countryCode = locale?.split('-')[1]?.toUpperCase();
        
        if (countryCode && currencyMap[countryCode]) {
          setUserCountry(countryCode);
          setCurrency(currencyMap[countryCode]);
          return;
        }

        // Try to get country from Intl API
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Map timezone to country (simplified)
        const timezoneCountryMap: Record<string, string> = {
          'America/New_York': 'US',
          'America/Los_Angeles': 'US',
          'America/Chicago': 'US',
          'America/Denver': 'US',
          'Europe/London': 'GB',
          'Europe/Paris': 'FR',
          'Europe/Berlin': 'DE',
          'Asia/Kolkata': 'IN',
          'Asia/Tokyo': 'JP',
          'Asia/Shanghai': 'CN',
          'Asia/Singapore': 'SG',
          'Australia/Sydney': 'AU',
          'America/Toronto': 'CA',
        };

        const detectedCountry = timezoneCountryMap[timeZone];
        if (detectedCountry && currencyMap[detectedCountry]) {
          setUserCountry(detectedCountry);
          setCurrency(currencyMap[detectedCountry]);
          return;
        }

        // Fallback to USD
        setUserCountry('US');
        setCurrency(currencyMap['US']);
      } catch (error) {
        console.warn('Could not detect user country, defaulting to USD:', error);
        setUserCountry('US');
        setCurrency(currencyMap['US']);
      }
    };

    detectUserCountry();
  }, []);

  // If exchange is specified, use exchange-specific currency
  const getCurrencyForExchange = (exchangeKey: string): CurrencyInfo => {
    return exchangeCurrencyMap[exchangeKey] || currency;
  };

  const formatPrice = (price: number, exchangeKey?: string): string => {
    const currencyToUse = exchangeKey ? getCurrencyForExchange(exchangeKey) : currency;
    const formattedPrice = price.toLocaleString();
    
    if (currencyToUse.position === 'before') {
      return `${currencyToUse.symbol}${formattedPrice}`;
    } else {
      return `${formattedPrice} ${currencyToUse.symbol}`;
    }
  };

  return {
    currency,
    userCountry,
    formatPrice,
    getCurrencyForExchange,
  };
};