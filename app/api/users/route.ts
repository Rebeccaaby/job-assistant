import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
});

// GET /api/users - List all users (for testing)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        applications: true,
      },
    });

    return Response.json({ users });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        applications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: body.name,
        phone: body.phone,
      },
      include: { profile: true },
    });

    return Response.json({ user });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateUserSchema.parse(body);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      return Response.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: validatedData,
      include: { profile: true },
    });

    return Response.json({ user }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}