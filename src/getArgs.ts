export type Options = { nologin: boolean; test: boolean }
export function getArgs(argv: string[]): Options {
  let options: Options = { nologin: false, test: false }
  if (findArg(argv, ['-n', '--nologin', '-nologin'])) {
    options.nologin = true
  }
  if (findArg(argv, ['-t', '-test', '--test', '-teste', '--teste'])) {
    options.test = true
  }
  return options
}

function findArg(argv: string[], options: string[]): boolean {
  for (const arg of argv) {
    for (const option of options) {
      if (arg === option) return true
    }
  }
  return false
}
