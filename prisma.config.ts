import { defineConfig } from '@prisma/config';

export default defineConfig({
    earlyAccess: true,
    schema: {
        kind: "multi-file",
        root: "./prisma/schema.prisma"
    }
});
