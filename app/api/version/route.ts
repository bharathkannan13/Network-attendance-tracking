import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'READY',
    environment: process.env.NODE_ENV || 'production',
    commit: 'e146e37',
    commitMessage: 'fix: strict IP consolidation key and add Clear All Records button',
    activeNetworkKey: process.env.AUTHORIZED_SSID || 'RAMBOLL-GUEST (guest.rambollgrp.com)',
    deployedAt: new Date().toISOString(),
  });
}
