const ENTER_KEY_CODE = '13';

console.log('Want to clear the token? Right click the icon, then \'Options\'');

chrome.storage.local.get(['token', 'pin'], ({ token, pin }) => {
    if (token && pin) {
        generateCode(token, pin);
    } else if (token) {
        requestPin(token);
    } else {
        requestToken();
    }
})

const requestToken = () => {
    document.getElementById('tokenEntry').style.display = 'block';
    document.getElementById('tokenEntryField').focus();

    document.getElementById('tokenEntryField').addEventListener('keyup', (event) => { if (event.keyCode == ENTER_KEY_CODE) onToken(); });
    document.getElementById('tokenEntrySave').addEventListener('click', () => onToken());
}
const onToken = () => {
    let token;
    try {
        token = securid.v3(document.getElementById('tokenEntryField').value, '', securid.deviceId.android);
    } catch (err) {
        document.getElementById('tokenEntryError').innerText = err;
        return;
    }

    document.getElementById('tokenEntry').style.display = '';

    const storableToken = {
        serial: token.serial,
        flags: token.flags,
        intervalInSeconds: token.intervalInSeconds,
        digits: token.digits,
        decryptedSeed: Array.from(token.decryptedSeed)
    };

    if (document.getElementById('tokenEntryRemember').checked) {
        chrome.storage.local.set({ token: storableToken });
    }

    requestPin(storableToken);
}

const requestPin = (token) => {
    if (token.flags.pinIsRequired === false) {
        generateCode(token, '0000');
        return;
    }

    document.getElementById('pinEntry').style.display = 'block';
    document.getElementById('pinEntryField').focus();

    document.getElementById('pinEntryField').addEventListener('keyup', (event) => { if (event.keyCode == ENTER_KEY_CODE) onPin(token); });
    document.getElementById('pinEntrySave').addEventListener('click', () => onPin(token));
}
const onPin = (token) => {
    document.getElementById('pinEntry').style.display = '';

    const pin = document.getElementById('pinEntryField').value || '0000';

    if (document.getElementById('pinEntryRemember').checked) {
        chrome.storage.local.set({ pin });
    }

    generateCode(token, pin);
};


const generateCode = (token, pin) => {
    document.getElementById('codeDisplay').style.display = 'block';

    const code = securid.computeCode(token, pin);

    document.getElementById('code').innerText = code.code;

    const timerBarInner = document.getElementById('timer_bar_inner');

    // Gross hack to reset the animation
    timerBarInner.style.animationName = '';
    timerBarInner.offsetHeight; // force reflow
    timerBarInner.style.animationName = 'maxWidth'

    timerBarInner.style.animationDuration = `${token.intervalInSeconds}s`;
    timerBarInner.style.animationDelay = `-${(new Date() - code.validFrom) / 1000}s`;

    setTimeout(() => generateCode(token, pin), code.expiresAt - new Date());
}

document.getElementById('codeDisplay').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('code').innerText);
});