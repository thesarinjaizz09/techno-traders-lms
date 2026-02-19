/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@prisma/nextjs-monorepo-workaround-plugin' {
  
  export class PrismaPlugin {
    constructor();
    apply(compiler: any): void;
  }
}