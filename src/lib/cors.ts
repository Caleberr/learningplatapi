import { NextRequest, NextResponse } from 'next/server';

// CORS configuration following SOLID principles
export interface CorsConfig {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export class CorsHandler {
  private config: CorsConfig;

  constructor(config: CorsConfig = {}) {
    this.config = {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: false,
      maxAge: 86400,
      ...config
    };
  }

  private getOriginHeader(request: NextRequest): string {
    const origin = request.headers.get('origin');
    
    if (this.config.origin === '*') {
      return '*';
    }
    
    if (typeof this.config.origin === 'string') {
      return this.config.origin;
    }
    
    if (Array.isArray(this.config.origin) && origin) {
      return this.config.origin.includes(origin) ? origin : '';
    }
    
    return '';
  }

  getCorsHeaders(request: NextRequest): Record<string, string> {
    const headers: Record<string, string> = {};
    
    const originHeader = this.getOriginHeader(request);
    if (originHeader) {
      headers['Access-Control-Allow-Origin'] = originHeader;
    }
    
    if (this.config.methods) {
      headers['Access-Control-Allow-Methods'] = this.config.methods.join(', ');
    }
    
    if (this.config.allowedHeaders) {
      headers['Access-Control-Allow-Headers'] = this.config.allowedHeaders.join(', ');
    }
    
    if (this.config.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    if (this.config.maxAge) {
      headers['Access-Control-Max-Age'] = this.config.maxAge.toString();
    }
    
    return headers;
  }

  handlePreflight(request: NextRequest): NextResponse {
    return new NextResponse(null, {
      status: 200,
      headers: this.getCorsHeaders(request)
    });
  }

  addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
    const corsHeaders = this.getCorsHeaders(request);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
}

// Default CORS handler instance
export const corsHandler = new CorsHandler({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URLs
  credentials: true
});