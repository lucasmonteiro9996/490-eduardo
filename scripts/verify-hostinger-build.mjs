import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join(process.cwd(), 'dist')
const required = ['index.html', '.htaccess']

const missing = required.filter((file) => !existsSync(join(distDir, file)))

if (missing.length > 0) {
  console.error(`Build incompleto para Hostinger. Arquivos ausentes em dist/: ${missing.join(', ')}`)
  process.exit(1)
}

const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf8')
if (!indexHtml.includes('Ocean Capital')) {
  console.warn('Aviso: index.html gerado sem o titulo esperado da aplicacao.')
}

console.log('Build pronto para publicacao na Hostinger (pasta dist/).')
