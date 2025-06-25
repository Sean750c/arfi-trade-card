export function formatDate(timestamp: number) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (diffSec < 60) {
        return 'Just now';
    } else if (diffMin < 60) {
        return `${diffMin} minutes ago`;
    } else if (diffHour < 24 && now.getDate() === date.getDate()) {
        return `${diffHour} hours ago`;
    } else if (
        diffHour < 48 &&
        now.getDate() - date.getDate() === 1 &&
        now.getMonth() === date.getMonth() &&
        now.getFullYear() === date.getFullYear()
    ) {
        // Yesterday
        return `Yesterday ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } else if (now.getFullYear() === date.getFullYear()) {
        // This year
        return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } else {
        // Previous years
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
}

export function formatDateString(timestamp: string) {
    if (!timestamp) return '';
    // 兼容 'YYYY-MM-DD HH:mm:ss' 格式
    let date: Date;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
        // 替换空格为T，兼容Safari
        date = new Date(timestamp.replace(' ', 'T'));
    } else if (/^\d{10,13}$/.test(timestamp)) {
        // 秒/毫秒时间戳
        let ts = Number(timestamp);
        if (timestamp.length === 13) ts = Math.floor(ts / 1000);
        date = new Date(ts * 1000);
    } else {
        // 其他格式直接尝试 new Date
        date = new Date(timestamp);
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (diffSec < 60) {
        return 'Just now';
    } else if (diffMin < 60) {
        return `${diffMin} minutes ago`;
    } else if (diffHour < 24 && now.getDate() === date.getDate()) {
        return `${diffHour} hours ago`;
    } else if (
        diffHour < 48 &&
        now.getDate() - date.getDate() === 1 &&
        now.getMonth() === date.getMonth() &&
        now.getFullYear() === date.getFullYear()
    ) {
        return `Yesterday ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } else if (now.getFullYear() === date.getFullYear()) {
        return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } else {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
} 
