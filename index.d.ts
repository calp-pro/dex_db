export type pair = [string, string, string]

export interface dex_db_instance {
  index: (pair: pair) => [number, number, number]
  index_save: (pair: pair, filename?: string) => [number, number, number] | undefined
  find_pairs_with_token: (token: string) => string[]
  find_pairs_with_tokens: (token_a: string, token_b: string) => string[]
  save: (filename?: string) => void
  load: (filename?: string) => void
  get_pair_tokens: (pair: string) => [string | undefined, string | undefined]
  get_all_pairs: () => string[]
  get_all_tokens: () => string[]
}

export function dex_db(pairs?: pair[]): dex_db_instance

export default dex_db
