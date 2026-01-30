const path = require('path')

const rootDir = path.join(__dirname, '..')
const paths = {
  rootDir,
  dataDir: path.join(rootDir, 'data'),
  eventsDir: path.join(rootDir, 'data', 'events'),
  busDir: path.join(rootDir, 'data', 'bus'),
  commandBusPath: path.join(rootDir, 'data', 'bus', 'commands.json')
}

module.exports = { paths }
