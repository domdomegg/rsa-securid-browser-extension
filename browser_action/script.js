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
    document.getElementById('deviceEntryField').addEventListener('keyup', (event) => { if (event.keyCode == ENTER_KEY_CODE) onToken(); });
    document.getElementById('passwordEntryField').addEventListener('keyup', (event) => { if (event.keyCode == ENTER_KEY_CODE) onToken(); });
    document.getElementById('tokenEntrySave').addEventListener('click', () => onToken());
}
const onToken = () => {
    const tokenEntryFieldValue = document.getElementById('tokenEntryField').value;
    const passwordEntryFieldValue = document.getElementById('passwordEntryField').value;
    const deviceEntryFieldValue = document.getElementById('deviceEntryField').value;
    const [token, err] = tryLots(
            () => securid.v3(tokenEntryFieldValue, passwordEntryFieldValue, deviceEntryFieldValue),
            () => securid.v3(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.android),
            () => securid.v3(tokenEntryFieldValue),
            () => securid.v3(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.iphone),
            () => securid.v3(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.blackberry),
            () => securid.v3(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.blackberry10),
            () => securid.v3(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.windowsPhone),
            () => securid.v3(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.windows),
            () => securid.v3(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.macos),

            () => securid.v2(tokenEntryFieldValue, passwordEntryFieldValue, deviceEntryFieldValue),
            () => securid.v2(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.android),
            () => securid.v2(tokenEntryFieldValue),
            () => securid.v2(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.iphone),
            () => securid.v2(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.blackberry),
            () => securid.v2(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.blackberry10),
            () => securid.v2(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.windowsPhone),
            () => securid.v2(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.windows),
            () => securid.v2(tokenEntryFieldValue, passwordEntryFieldValue, securid.deviceId.macos),
        );
    
    if (err) {
        document.getElementById('tokenEntryError').innerText = err;
        return;
    }
    if (!token) {
        document.getElementById('tokenEntryError').innerText = 'Failed to parse token';
        return;
    }

    document.getElementById('tokenEntry').style.display = '';

    const storableToken = {
        version: token.version,
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

/**
 * Tries a series of functions that return a result or throw.
 * @param  {...Function} fns
 * @returns a 2-tuple, either:
 * - the first element as result from the first non-throwing function i.e. `[result, undefined]`
 * - or if all throw then the second element as the first thrown thing i.e. `[undefined, err]`
 * 
 * If fns is empty then will return `[undefined, undefined]`.
 */
const tryLots = (...fns) => {
    let isFirstThrownThingSet = false;
    let firstThrownThing;
    for (fn of fns) {
        try {
            return [fn(), undefined];
        } catch (err) {
            if (!isFirstThrownThingSet) {
                firstThrownThing = err;
                isFirstThrownThingSet = true;
            }
        }
    }
    return [undefined, firstThrownThing];
}