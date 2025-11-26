import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.JWT_SECRET || "super-secret-key-change-me";
const key = new TextEncoder().encode(SECRET_KEY);

export type Role = "ADMIN" | "QA" | "GUEST" | "USER";

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function logout() {
  cookies().set("session", "", { expires: new Date(0) });
}

export async function checkPermission(requiredRoles: Role[]) {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  
  // ADMIN is always allowed (unless specifically excluded, but usually has all permissions)
  if (session.user.role === "ADMIN") return true;

  if (!requiredRoles.includes(session.user.role as Role)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  return true;
}
