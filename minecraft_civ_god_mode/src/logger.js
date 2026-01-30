const chalk = require('chalk')
module.exports = {
  ok: (...a) => console.log(chalk.green('✅'), ...a),
  info: (...a) => console.log(chalk.cyan('ℹ️'), ...a),
  warn: (...a) => console.log(chalk.yellow('⚠️'), ...a),
  err: (...a) => console.log(chalk.red('❌'), ...a),
  tag: (t, ...a) => console.log(chalk.magenta(`[${t}]`), ...a),
}
