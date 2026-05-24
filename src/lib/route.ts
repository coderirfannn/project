import type { NextRequest } from 'next/server';
import { ValidationError, handleError } from '@/lib/errors';

export function withRouteHandler<TContext = unknown>(
  handler: (request: NextRequest, context: TContext) => Promise<Response>,
) {
  return async (request: NextRequest, context: TContext): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error, request);
    }
  };
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json();

    if (body === null || typeof body !== 'object') {
      throw new ValidationError('Request body must be a JSON object');
    }

    return body as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Request body must be valid JSON');
    }

    throw error;
  }
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
