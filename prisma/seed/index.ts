async function main(): Promise<void> {
  console.log('Prisma seed completed: no seed data registered yet.');
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
