import { NextRequest, NextResponse } from 'next/server';

// Health check endpoint following SOLID principles
// Single Responsibility: Only handles health status
// Open/Closed: Can be extended with additional health checks
// Interface Segregation: Simple, focused interface
// Dependency Inversion: Uses Next.js abstractions

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
}

class HealthService {
  static getHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const healthStatus = HealthService.getHealthStatus();
    
    return NextResponse.json(healthStatus, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    );
  }
}