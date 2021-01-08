# 🔢 RSA SecurID Browser Extension [(install here)](https://chrome.google.com/webstore/detail/rsa-securid-code-generato/bdkphnndaejdmmbohpejmlfejfdbepap)

Easy to use browser extension for generating RSA SecurID token codes.

NB: This is an unofficial hobby project, and is in no way affiliated with or endorsed by RSA Security. Use at your own risk.

![Example of using the RSA SecurID browser extension to login](img/demo.gif)

Found a bug, or have an idea for an improvement? [Raise an issue](https://github.com/domdomegg/rsa-securid-browser-extension/issues).

## ✨ Automatic install

Install this extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/rsa-securid-code-generato/bdkphnndaejdmmbohpejmlfejfdbepap).

## 👷 Manual install

1. Clone this repository
2. Go to `chrome://extensions`
3. Enable `Developer mode` in the top right
4. Click `Load unpacked`, and select the cloned folder

## 🔧 Setup

1. Generate an Android token. This can be done via the RSA Self Service Portal:
    - Click 'Request Token'
    - Choose 'Software Token' then 'Android'
    - Set the PIN to something memorable, and submit it
    - Choose 'Scan Token Now' (the QR code option)
    - Use a QR code scanning app (e.g. [Google Lens](https://play.google.com/store/apps/details?id=com.google.ar.lens) or [Apple Camera](https://support.apple.com/en-gb/HT208843))
    - Your token should look like `http://127.0.0.1/securid/ctf?ctfData=AwAA...`
2. Click the extension icon (to the right of the address bar) and paste in the token

If you need to reset the extension, you can do this in the options (right click the extension icon, then 'Options')

## 💻 Usage

1. Click the extension icon, and enter your pin
2. Click the code to copy it to your clipboard
