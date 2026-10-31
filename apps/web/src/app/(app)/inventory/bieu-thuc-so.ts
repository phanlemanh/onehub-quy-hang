// Luật số của ô lọc — chép từ `filter-expression.ts` của khối data-grid-editing-6, đổi cách đọc số cho tiếng Việt:
// dấu phẩy thập phân («4,5»), «and/or» thêm «và/hoặc», bỏ hậu tố k/m của đô la.
export type NumberTest = (value: number) => boolean

export type ExpressionResult =
  | { state: "empty" }
  | { state: "valid"; test: NumberTest }
  | { state: "invalid" }

const COMPARATORS: Record<string, (value: number, bound: number) => boolean> = {
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
  "=": (a, b) => Math.abs(a - b) < 1e-9,
  "!=": (a, b) => Math.abs(a - b) >= 1e-9,
}

/** Spellings people type for the same operator. */
const OPERATOR_ALIASES: Record<string, string> = {
  "=>": ">=",
  "=<": "<=",
  "<>": "!=",
  "==": "=",
}

function readNumber(raw: string): number | null {
  const cleaned = raw.replace(/[_\s]/g, "").replace(",", ".")
  const match = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/.exec(cleaned)
  return match ? Number(match[1]) : null
}

function readRange(term: string): NumberTest | null {
  const match =
    /^(.+?)\s*(?:\.\.|\bto\b|\bđến\b)\s*(.+)$/i.exec(term) ??
    /^([\d.,_]+)\s*-\s*([\d.,_]+)$/.exec(term)
  if (!match) return null
  const from = readNumber(match[1] ?? "")
  const to = readNumber(match[2] ?? "")
  if (from === null || to === null) return null
  const low = Math.min(from, to)
  const high = Math.max(from, to)
  return (value) => value >= low && value <= high
}

function readComparison(term: string): NumberTest | null {
  const match = /^(>=|<=|=>|=<|!=|<>|==|=|>|<)?\s*(.+)$/.exec(term)
  if (!match) return null
  const operator = OPERATOR_ALIASES[match[1] ?? ""] ?? match[1] ?? "="
  const bound = readNumber(match[2] ?? "")
  const compare = COMPARATORS[operator]
  if (bound === null || !compare) return null
  return (value) => compare(value, bound)
}

function readTerm(raw: string): NumberTest | null {
  const term = raw.trim()
  if (!term) return null
  return readRange(term) ?? readComparison(term)
}

export function parseNumberExpression(raw: string): ExpressionResult {
  if (!raw.trim()) return { state: "empty" }
  const alternatives: NumberTest[][] = []
  for (const group of raw.split(/\s+(?:or|hoặc)\s+|\|/i)) {
    const terms = group.split(/\s+(?:and|và)\s+|&/i).map(readTerm)
    const valid = terms.filter((test): test is NumberTest => test !== null)
    if (valid.length !== terms.length) return { state: "invalid" }
    alternatives.push(valid)
  }
  return {
    state: "valid",
    test: (value) =>
      alternatives.some((terms) => terms.every((test) => test(value))),
  }
}
