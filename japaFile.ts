import 'reflect-metadata'
import execa from 'execa'
import { join } from 'path'
import getPort from 'get-port'
import { configure } from 'japa'
import fs from 'fs'
import sourceMapSupport from 'source-map-support'

process.env.NODE_ENV = 'testing'
process.env.ADONIS_ACE_CWD = join(__dirname)
sourceMapSupport.install({ handleUncaughtExceptions: false })

async function runMigration() {
  if (!fs.existsSync(`${__dirname}/tmp`)) {
    fs.mkdirSync(`${__dirname}/tmp`)
  }
  await execa.node('ace', ['migration:run'], {
    stdio: 'inherit',
  })
}

async function rollbackMigrations() {
  if (process.platform === 'win32') {
    await execa.node('ace', ['migration:rollback', '--batch=0'], {
      stdio: 'inherit',
    })
  } else {
    fs.rmSync(`${__dirname}/tmp/db.sqlite3`)
  }
}

// Add this method to the file
function getTestFiles() {
  const testType = process.argv.slice(2)[0]

  if (testType) {
    const valueType = process.argv.slice(3)[0]
    if (testType === '-f') {
      return `tests/${valueType.replace(/\.ts$|\.js$/, '')}.ts`
    } else if (testType === '-m') {
      return `tests/${valueType}/**/*.spec.ts`
    }
  } else {
    return 'tests/**/*.spec.ts'
  }
}

async function cleanUp() {
  try {
    fs.rmdirSync('./resources/storageTest', { recursive: true })
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}

async function startHttpServer() {
  const { Ignitor } = await import('@adonisjs/core/build/src/Ignitor')
  process.env.PORT = String(await getPort())
  await new Ignitor(__dirname).httpServer().start()
}

/**
 * Configure test runner
 */
configure({
  files: getTestFiles(),
  before: [runMigration, startHttpServer],
  after: [rollbackMigrations, cleanUp],
})
