import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const count = await prisma.user.count()
    return NextResponse.json({
      success: true,
      count,
      message: 'Conexão com o banco de dados está funcionando perfeitamente!'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || String(error),
      stack: error.stack,
      env: {
        HAS_DATABASE_URL: !!process.env.DATABASE_URL,
        HAS_DIRECT_URL: !!process.env.DIRECT_URL,
        DATABASE_URL_PREFIX: process.env.DATABASE_URL 
          ? process.env.DATABASE_URL.substring(0, 30) + '...' 
          : 'undefined'
      }
    }, { status: 500 })
  }
}
