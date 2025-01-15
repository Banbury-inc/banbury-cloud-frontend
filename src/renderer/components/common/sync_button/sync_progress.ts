
export const SyncProgress = () => {

    const syncingFiles = [
        { filename: 'myBig.psd', progress: 49, speed: '482kb/s' },
    ]

    const recentlyChanged = [
        { filename: '06 Takeover.mp3', timeAgo: '14 hours ago' },
        { filename: '04 Nothing Between Us.mp3', timeAgo: '14 hours ago' },
        { filename: '03 Wanna Tell You.mp3', timeAgo: '14 hours ago' },
    ]

    return { syncingFiles, recentlyChanged }

}