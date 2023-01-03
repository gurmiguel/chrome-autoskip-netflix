const packageJson = require("./package.json");

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: 'Auto Skip Netflix',
  version: packageJson.version,
  description: packageJson.description,
  icons: {
    '16': 'imgs/icon-16.png',
    '32': 'imgs/icon-32.png',
    '48': 'imgs/icon-48.png',
    '128': 'imgs/icon-128.png',
  },
  content_scripts: [
    {
      matches: [ 'https://www.netflix.com/watch/*' ],
      js: ['autoskip.js']
    }
  ],
  action: {
    default_popup: 'popup.html',
    default_icon: 'imgs/icon.png'
  },
  permissions: [
    'storage',
  ]
}

export default manifest;