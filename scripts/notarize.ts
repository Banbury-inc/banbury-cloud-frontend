const { notarize } = require('@electron/notarize');

const projectRoot = require('path').resolve(__dirname, '..')

notarize({
  appBundleId: 'com.banbury.cloud',
  appPath: projectRoot + '/packages/mac-arm64/Banbury Cloud.app',
  appleId: "mamills@maine.rr.com",
  appleIdPassword: "mgwm-abks-hehu-reom",
  teamId: "5Q7W7ZFVLS", // Team ID for your developer team
}).catch((e: any) => {
  console.error("Didn't work :( " + e.message) // eslint-disable-line no-console
})



