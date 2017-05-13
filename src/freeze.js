#!/usr/bin/env node
const fs = require('fs')
const exec = require('child_process').exec

// Get installed modules info
const installedModulesPromise = getInstalledModules()
// Get package.josn info
const PackageDataPromise = getPackageData()

console.log('Fetching data...')

// When data ready...
Promise.all([
  installedModulesPromise,
  PackageDataPromise
]).then(([installedModules, PackageData]) => {
  // Update dependencie modules
  Object.keys(PackageData.dependencies).map(moduleName => {
    PackageData.dependencies[moduleName] = installedModules.dependencies[moduleName].version
  })

  // Update dev dependencie modules
  Object.keys(PackageData.devDependencies).map(moduleName => {
    PackageData.devDependencies[moduleName] = installedModules.dependencies[moduleName].version
  })

  // Write updated info to package.json
  writePackageData(PackageData).then(() => {
    console.log('package.json Updated!')
  })
}).catch(error => {
  console.log(error)
  process.exit(0)
})

/**
 * Get installed modules info
 * @return {Promise<Object, Error>} Installed modules info
 */
function getInstalledModules () {
  return new Promise((resolve, reject) => {
    exec('npm list --depth=0 --json', (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      resolve(JSON.parse(stdout))
    })
  })
}

/**
 * Read package.json file & output data as JSON
 * @return {Promise<Object, Error>} package.json data
 */
function getPackageData () {
  return new Promise((resolve, reject) => {
    fs.readFile('package.json', 'utf8', (error, data) => {
      if (error) {
        reject(error)
        return
      }
      resolve(JSON.parse(data))
    })
  })
}

/**
 * Write new data to package.json
 * @param  {Object} data package.json data
 * @return {Promise<String, Error>} package.json as String
 */
function writePackageData (data) {
  return new Promise((resolve, reject) => {
    var fileData = JSON.stringify(data, null, 2)
    fs.writeFile('package.json', fileData, 'utf8', error => {
      if (error) {
        reject(error)
        return
      }
      resolve(data)
    })
  })
}
