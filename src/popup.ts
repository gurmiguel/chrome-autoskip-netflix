import { StorageKeys } from './utils/storage-keys'

function attachCheckboxToOption(checkboxId: string, option: StorageKeys) {
  const checkbox = document.getElementById(checkboxId) as HTMLInputElement

  checkbox.addEventListener('change', (e) => {
    chrome.storage.sync.set({
      [option]: checkbox.checked,
    })
  })
  
  chrome.storage.sync.get({ [option]: true }).then(options => {
    const { [option]: enabled } = options
  
    checkbox.checked = enabled
  })
}

attachCheckboxToOption('AutoIntroSkipEnabled', StorageKeys.AutoSkipIntroEnabled)
attachCheckboxToOption('AutoNextEpisodeEnabled', StorageKeys.AutoNextEpisodeEnabled)