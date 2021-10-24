/** NOTE CODE BORROWED FROM cross-env package, at version: @cross-env@^7.0.3*/

const { spawn } = require('cross-spawn')
const commandConvert = require('cross-env/src/command')
const varValueConvert = require('cross-env/src/variable')

module.exports = crossEnv

const envSetterRegex = /(\w+)=('(.*)'|"(.*)"|(.*))/

/**
 * our alteration to cross-env code is to add a callback for when NODE_ENV is set
 * @param {*} args 
 * @param {*} options 
 * @param {()=>void} cb 
 * @returns 
 */
function crossEnv(args, options = {}, cb = undefined) {
  let cbDone = false
  const [envSetters, command, commandArgs] = parseCommand(args)
  const env = getEnvVars(envSetters)
  if (command) {
    const proc = spawn(
      // run `path.normalize` for command(on windows)
      commandConvert(command, env, true),
      // by default normalize is `false`, so not run for cmd args
      commandArgs.map(arg => commandConvert(arg, env)),
      {
        stdio: 'inherit',
        shell: options.shell,
        env,
      },
    )
    process.on('SIGTERM', () => {
      proc.kill('SIGTERM')
      if (!cbDone) {
        cb() // NOTE << call our xenv script
        cbDone = true
      }
    })
    process.on('SIGINT', () => {
      proc.kill('SIGINT')
      if (!cbDone) {
        if (typeof cb === 'function') cb() // NOTE << call our xenv script
        cbDone = true
      }
    })
    process.on('SIGBREAK', () => {
      proc.kill('SIGBREAK')
      if (!cbDone) {
        if (typeof cb === 'function') cb() // NOTE << call our xenv script
        cbDone = true
      }
    })
    process.on('SIGHUP', () => {
      proc.kill('SIGHUP')
      if (!cbDone) {
        if (typeof cb === 'function') cb()
        cbDone = true
      }
    })
    proc.on('exit', (code, signal) => {
      let crossEnvExitCode = code
      // exit code could be null when OS kills the process(out of memory, etc) or due to node handling it
      // but if the signal is SIGINT the user exited the process so we want exit code 0
      if (crossEnvExitCode === null) {
        crossEnvExitCode = signal === 'SIGINT' ? 0 : 1
      }
      if (!cbDone) {
        if (typeof cb === 'function') cb() // NOTE << call our xenv script
        cbDone = true
      }
      process.exit(crossEnvExitCode) //eslint-disable-line no-process-exit
    })
    if (!cbDone) {
      if (typeof cb === 'function') cb() // NOTE << call our xenv script
      cbDone = true
    }
    return proc
  }
  return null
}

function parseCommand(args) {
  const envSetters = {}
  let command = null
  let commandArgs = []
  for (let i = 0; i < args.length; i++) {
    const match = envSetterRegex.exec(args[i])
    if (match) {
      let value

      if (typeof match[3] !== 'undefined') {
        value = match[3]
      } else if (typeof match[4] === 'undefined') {
        value = match[5]
      } else {
        value = match[4]
      }

      envSetters[match[1]] = value
    } else {
      // No more env setters, the rest of the line must be the command and args
      let cStart = []
      cStart = args
        .slice(i)
        // Regex:
        // match "\'" or "'"
        // or match "\" if followed by [$"\] (lookahead)
        .map(a => {
          const re = /\\\\|(\\)?'|([\\])(?=[$"\\])/g
          // Eliminate all matches except for "\'" => "'"
          return a.replace(re, m => {
            if (m === '\\\\') return '\\'
            if (m === "\\'") return "'"
            return ''
          })
        })
      command = cStart[0]
      commandArgs = cStart.slice(1)
      break
    }
  }

  return [envSetters, command, commandArgs]
}

function getEnvVars(envSetters) {
  const envVars = { ...process.env }
  if (process.env.APPDATA) {
    envVars.APPDATA = process.env.APPDATA
  }
  Object.keys(envSetters).forEach(varName => {
    envVars[varName] = varValueConvert(envSetters[varName], varName)
  })
  return envVars
}
