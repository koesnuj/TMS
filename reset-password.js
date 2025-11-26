const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    const newPassword = await bcrypt.hash("12345678", 10);
    
    // 모든 사용자의 비밀번호를 12345678로 변경하고 승인 상태로 만듦
    const result = await prisma.user.updateMany({
      data: {
        password: newPassword,
        status: 'ACTIVE',
        role: 'ADMIN'
      }
    });
    console.log(`Reset password for ${result.count} users to '12345678'`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

