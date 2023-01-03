import { StorageKeys } from './utils/storage-keys'

const enabledOptions: Record<StorageKeys, boolean> = {
  [StorageKeys.AutoSkipIntroEnabled]: true,
  [StorageKeys.AutoNextEpisodeEnabled]: true,
}
let loaded = false
const selectors: Record<StorageKeys, string> = {
  [StorageKeys.AutoSkipIntroEnabled]: '[data-uia="player-skip-intro"]',
  [StorageKeys.AutoNextEpisodeEnabled]: '[data-uia="next-episode-seamless-button-draining"]',
}

chrome.storage.sync.get(Object.values(StorageKeys).reduce((keys, option) => ({
  ...keys,
  [option]: enabledOptions[option],
}), {})).then(async (options) => {
  for (const option of Object.values(StorageKeys)) {
    enabledOptions[option] = options[option] ?? enabledOptions[option]

    tryHitButton(document.body, option)
  }

  loaded = true
})

chrome.storage.sync.onChanged.addListener((changes) => {
  for (const option of Object.values(StorageKeys)) {
    if (option in changes) {
      enabledOptions[option] = changes[option].newValue

      tryHitButton(document.body, option)
    }
  }
})

const mo = new MutationObserver((mutations => {
  if (!loaded)
    return

  for (const mutation of mutations) {
    const { target } = mutation

    for (const option of Object.values(StorageKeys)) {
      if (!enabledOptions[option])
        continue

      if (tryHitButton(target as HTMLElement, option))
        return
    }
  }
}))

mo.observe(document.body, {
  subtree: true,
  childList: true,
})

function tryHitButton(context: HTMLElement, option: StorageKeys) {
  const targetSelector = selectors[option]
  const skipButton = (context as HTMLElement).querySelector<HTMLButtonElement>(targetSelector)

  if (!skipButton)
    return false

  skipButton.click()

  console.log('SKIPPED', option)

  return true
}