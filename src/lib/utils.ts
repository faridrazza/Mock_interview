import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
}

export function generateRequestId(): string {
  return uuidv4();
}

export function formatErrorResponse(error: any): string {
  if (!error) return "Unknown error";
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.details && Array.isArray(error.details)) {
    return error.details.map((detail: any) => detail.issue || detail.description).join(', ');
  }
  
  return JSON.stringify(error);
}

export async function getPayPalAuthToken(apiUrl: string, clientId: string, secretKey: string): Promise<string> {
  // Basic authentication for PayPal OAuth
  const auth = btoa(`${clientId}:${secretKey}`);

  const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`PayPal authentication failed: ${data.error_description || 'Unknown error'}`);
  }
  
  return data.access_token;
}

// PayPal subscription utility functions
export function validatePayPalSubscriptionData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!data.approvalUrl || typeof data.approvalUrl !== 'string') return false;
  if (!data.subscriptionId || typeof data.subscriptionId !== 'string') return false;
  return true;
}

// Improved function to safely handle PayPal URLs
export function sanitizePayPalUrl(url: string): string {
  // Ensure URL is valid
  if (!url || typeof url !== 'string') return '';
  
  // List of valid PayPal domains
  const validDomains = [
    'www.paypal.com',
    'checkout.paypal.com',
    'www.sandbox.paypal.com',
    'checkout.sandbox.paypal.com',
    'sandbox.paypal.com'
  ];
  
  try {
    // Parse the URL to validate it
    const urlObj = new URL(url);
    
    // Check against our list of valid domains
    if (validDomains.includes(urlObj.hostname)) {
      return url;
    }
    
    console.warn("Invalid PayPal URL domain:", urlObj.hostname);
    return '';
  } catch (err) {
    console.error("Invalid PayPal URL format:", err);
    return '';
  }
}

// Helper for safely opening PayPal windows
export function openPayPalWindow(url: string, name: string = "PayPal"): Window | null {
  try {
    // Try to open with standard size first
    const paypalWindow = window.open(url, name, "width=1000,height=800");
    
    // If popup was blocked or failed to open, return null
    if (!paypalWindow || paypalWindow.closed || typeof paypalWindow.closed === 'undefined') {
      console.warn("Failed to open PayPal window - popup might be blocked");
      return null;
    }
    
    // Focus the window
    paypalWindow.focus();
    return paypalWindow;
  } catch (err) {
    console.error("Error opening PayPal window:", err);
    return null;
  }
}

/**
 * Format a date to display in a user-friendly way
 * Shows the month name and day with year
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}
