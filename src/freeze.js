#!/usr/bin/env node
const fs = require('fs')
const exec = require('child_process').exec

const installedModulesPromise = getInstalledModules()
const PackageDataPromise = getPackageData()

console.log('Fetching data...')

Promise.all([
  installedModulesPromise,
  PackageDataPromise
]).then(([installedModules, PackageData]) => {
  Object.keys(PackageData.dependencies).map(moduleName => {
    PackageData.dependencies[moduleName] = installedModules.dependencies[moduleName].version
  })

  Object.keys(PackageData.devDependencies).map(moduleName => {
    PackageData.devDependencies[moduleName] = installedModules.dependencies[moduleName].version
  })

  writePackageData(PackageData).then(() => {
    console.log('package.json Updated!')
  })
}).catch(error => {
  console.log(error)
  process.exit(0)
})

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

function getPackageData () {
  return new Promise((resolve, reject) => {
    fs.readFile('package.json', 'utf8', (error, data) => {
      if (error) {
        reject(error)
        return
      }
      var data = JSON.parse(data)
      resolve(data)
    })
  })
}

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
