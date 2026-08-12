const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

type PaginationInput = {
  limit?: string;
  offset?: string;
};

export type PaginationOptions = {
  take: number;
  skip: number;
};

export function parsePagination(input: PaginationInput): PaginationOptions {
  return {
    take: parsePositiveInt(input.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    skip: parseNonNegativeInt(input.offset, 0),
  };
}

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  max: number,
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function parseNonNegativeInt(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}
