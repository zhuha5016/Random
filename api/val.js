// ✅ 真正的 REST JSON 接口
// 访问方式：
// https://zhuha5016.github.io/Random/api/val.js?tz=UTC+8

const params = new URLSearchParams(window.location.search);
const tz = params.get('tz') || 'UTC+8';

const offset = {
    'UTC+0': 0,
    'UTC+8': 8 * 60,
    'UTC-5': -5 * 60,
    'UTC+9': 9 * 60,
    'UTC+1': 1 * 60
};

const now = new Date();
const utc = now.getTime() + now.getTimezoneOffset() * 60000;
const local = new Date(utc + (offset[tz] || 0) * 60000);

const minutes = local.getHours() * 60 + local.getMinutes();
const seconds = local.getSeconds();

const seed = minutes + seconds;
const val = ('000000' + (seed % 1000000)).slice(-6);

const data = {
    val: val,
    tz: tz,
    server_time: local.toLocaleTimeString('en-US', { hour12: false }),
    expire_in: 60 - seconds
};

// ✅ 关键：HTTP JSON 响应
window.location.replace(
    'data:application/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(data))
);
