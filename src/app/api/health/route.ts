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

// CORS headers utility following Single Responsibility Principle
class CorsService {
  static getCorsHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*', // Allow all origins, or specify your frontend domain
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400', // 24 hours
    };
  }

  static createCorsResponse(data: any, status: number = 200): NextResponse {
    return NextResponse.json(data, {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...CorsService.getCorsHeaders()
      }
    });
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: CorsService.getCorsHeaders()
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const healthStatus = HealthService.getHealthStatus();
    
    return CorsService.createCorsResponse(healthStatus, 200);
  } catch (error) {
    return CorsService.createCorsResponse(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      500
    );
  }
}