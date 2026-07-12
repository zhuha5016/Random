/* ====================================================
   Random VAL - 主应用逻辑
   数字显示、时间管理、滚动动画
   复刻 index(3).html 的文字滚动效果
   ==================================================== */

var timezoneOffset;
var currentNumber;
var lastMinute;
var updateInterval;
var appInitialized = false;

/**
 * 初始化主应用 (登录后调用)
 */
function initApp() {
    if (appInitialized) return;
    appInitialized = true;

    var timezoneSelect = document.getElementById('timezoneSelect');
    var randomNumber = document.getElementById('randomNumber');
    var timeRemaining = document.getElementById('timeRemaining');
    var serverTime = document.getElementById('serverTime');
    var userTimezone = document.getElementById('userTimezone');
    var syncBtn = document.getElementById('syncBtn');
    var copyBtn = document.getElementById('copyBtn');

    timezoneOffset = parseInt(defaultTimezone);
    currentNumber = '------';
    lastMinute = -1;

    document.getElementById('userGreeting').textContent =
        '欢迎, ' + getUserDisplayName(currentUser);

    /* 时区切换 */
    timezoneSelect.addEventListener('change', function() {
        timezoneOffset = parseInt(timezoneSelect.value);
        userTimezone.textContent = 'UTC' + (timezoneOffset >= 0 ? '+' : '') + timezoneOffset;
        lastMinute = -1;
        updateTimeDisplay();
    });

    /* 同步时间按钮 */
    syncBtn.addEventListener('click', function() {
        syncBtn.classList.add('glow');
        setTimeout(function() {
            syncBtn.classList.remove('glow');
        }, 2000);
        lastMinute = -1;
        updateTimeDisplay();
    });

    /* 复制按钮 */
    copyBtn.addEventListener('click', function() {
        if (currentNumber === '------') return;
        navigator.clipboard.writeText(currentNumber)
            .then(function() {
                var originalText = copyBtn.textContent;
                copyBtn.textContent = '已复制!';
                setTimeout(function() {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(function() {
                var textarea = document.createElement('textarea');
                textarea.value = currentNumber;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                var originalText = copyBtn.textContent;
                copyBtn.textContent = '已复制!';
                setTimeout(function() {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
    });

    /* 更新时间显示 */
    function updateTimeDisplay() {
        var now = new Date();
        var utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        var serverTimeObj = new Date(utcTime.getTime() + timezoneOffset * 3600000);

        var timeStr = serverTimeObj.toTimeString().substring(0, 8);
        serverTime.textContent = timeStr;

        var seconds = 60 - serverTimeObj.getSeconds();
        timeRemaining.textContent = seconds + '秒';

        var currentMinute = Math.floor(serverTimeObj.getTime() / 60000);
        if (currentMinute !== lastMinute) {
            lastMinute = currentMinute;
            updateRandomNumber();
        }
    }

    /* 生成随机数 */
    async function updateRandomNumber() {
        try {
            var num = await generateSecureRandom(timezoneOffset);
            updateDigitalDisplay(num);
        } catch (error) {
            console.error('随机数更新错误:', error);
        }
    }

    /**
     * 数字滚动效果 - 复刻 index(3).html
     * 每位数字独立滚动: 先向上滚出, 然后替换数字, 再滚回原位
     */
    async function updateDigitalDisplay(newNumber) {
        var newStr = newNumber.toString();
        currentNumber = newStr;

        var digitColumns = randomNumber.querySelectorAll('.digit-column');

        for (var i = 0; i < 6; i++) {
            var currentDigit = digitColumns[i].querySelector('.digit-scroll').textContent;
            var newDigit = newStr[i];

            if (currentDigit !== newDigit) {
                var scrollElement = digitColumns[i].querySelector('.digit-scroll');

                /* 如果当前是'-'(初始状态), 不滚动直接替换 */
                var scrollOffset = (currentDigit === '-') ? '0' : '-70px';
                scrollElement.style.transform = 'translateY(' + scrollOffset + ')';

                setTimeout(function(el, digit) {
                    el.textContent = digit;
                    el.style.transform = 'translateY(0)';
                }, 50, scrollElement, newDigit);
            }
        }
    }

    /* 初始化 */
    updateTimeDisplay();
    updateInterval = setInterval(updateTimeDisplay, 1000);
}
