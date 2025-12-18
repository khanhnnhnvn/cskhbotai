import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Testing connection to database...');
    try {
        await prisma.$connect();
        console.log('Successfully connected to database!');
        const count = await prisma.document.count();
        console.log(`Current document count: ${count}`);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
