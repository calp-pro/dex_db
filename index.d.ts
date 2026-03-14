export type pair = [string, string, string]

export interface dex_db_instance {
  index: (pair: pair) => void
  find_pairs_with_token: (token: string) => string[]
  find_pairs_with_tokens: (token_a: string, token_b: string) => string[]
}

export function dex_db(pairs?: pair[]): dex_db_instance

export default dex_db
