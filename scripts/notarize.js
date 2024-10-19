const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.banbury.cloud',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "mamills@maine.rr.com",
    appleIdPassword: "mgwm-abks-hehu-reom",
  });
};

