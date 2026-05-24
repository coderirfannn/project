import type { NextRequest } from 'next/server';
import { ValidationError } from '@/lib/errors';
import { handleApiError } from '@/lib/errors';

export function withRouteHandler<TContext = unknown>(
  handler: (request: NextRequest, context: TContext) => Promise<Response>,
) {
  return async (request: NextRequest, context: TContext): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export async function resolveRouteParamId(context: unknown): Promise<string> {
  const routeContext = context as { params?: { id?: string } | Promise<{ id?: string }> };
  const params = routeContext.params ? await Promise.resolve(routeContext.params) : undefined;
  const id = params?.id;

  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new ValidationError('Missing route id parameter');
  }

  return id;
}
