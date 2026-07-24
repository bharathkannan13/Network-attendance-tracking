import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  const ipAddress = rawIp ? rawIp.split(',')[0].trim() : null;

  const allowedPrefixes = (process.env.ALLOWED_IP_PREFIX || '172.16.50.,1.6.224.,2401:4900:ca77:,10.79.130.,127.0.0.1,::1').split(',');
  const strictCheck = process.env.STRICT_NETWORK_CHECK !== 'false';

  let isAuthorized = true;

  if (ipAddress) {
    isAuthorized = allowedPrefixes.some(prefix => prefix.trim() && ipAddress.startsWith(prefix.trim()));
  }

  if (strictCheck && !isAuthorized) {
    return NextResponse.json({
      authorized: false,
      ipAddress,
      error: 'Invalid Network: Please connect to the authorized RAMBOLL group network.',
      authorizedSSID: process.env.AUTHORIZED_SSID || 'RAMBOLL-GUEST (guest.rambollgrp.com)'
    }, { status: 403 });
  }

  return NextResponse.json({
    authorized: true,
    ipAddress,
    authorizedSSID: process.env.AUTHORIZED_SSID || 'RAMBOLL-GUEST (guest.rambollgrp.com)'
  });
}
