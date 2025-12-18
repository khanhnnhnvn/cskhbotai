import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_CONFIG = {
    name: 'DocuSupport AI',
    rules: 'Always be polite. If unsure, ask the customer for clarification.'
};

export async function GET() {
    try {
        let config = await prisma.botConfig.findUnique({
            where: { id: 1 }
        });

        if (!config) {
            config = await prisma.botConfig.create({
                data: DEFAULT_CONFIG
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, rules } = body;

        const config = await prisma.botConfig.upsert({
            where: { id: 1 },
            update: { name, rules },
            create: { id: 1, name, rules },
        });

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
