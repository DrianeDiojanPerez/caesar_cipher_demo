export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export const mod = (n: number, m: number) => ((n % m) + m) % m

export function caesar(text: string, shift: number, decode = false): string {
  const s = decode ? -shift : shift
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const code = ch.charCodeAt(0)
    const base = code >= 97 ? 97 : 65
    return String.fromCharCode(base + mod(code - base + s, 26))
  })
}
