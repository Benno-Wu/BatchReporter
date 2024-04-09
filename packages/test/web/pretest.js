const fs = require('fs')
const path = require("path")

const cwd = process.cwd()
const file = fs.readFileSync(path.resolve(cwd, `./node_modules/@bennowu/batch-reporter-web/dist/index.umd.js`))
fs.writeFileSync(path.resolve(cwd, `./src/index.web.js`), file)
