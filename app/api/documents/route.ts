import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const documents = await prisma.document.findMany({
            orderBy: { uploadDate: 'desc' }
        });
        return NextResponse.json(documents);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, size, base64 } = body;

        const document = await prisma.document.create({
            data: {
                name,
                type,
                size,
                base64,
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }
}
