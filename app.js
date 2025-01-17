let currentRoll = 1;
let stream = null;

// Initialize from localStorage or set defaults
let photoData = JSON.parse(localStorage.getItem('photoData')) || {
    rolls: {},
    currentRoll: 1
};

if (!photoData.rolls[currentRoll]) {
    photoData.rolls[currentRoll] = [];
}

async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                aspectRatio: 1.5
            }
        });
        document.getElementById('viewfinder').srcObject = stream;
    } catch (err) {
        console.error('Camera error:', err);
        alert('Could not access camera. Please ensure camera permissions are granted.');
    }
}

async function capturePhoto() {

    try {
        const position = await getCurrentPosition();
        
        const video = document.getElementById('viewfinder');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Get ISO string with timezone offset
        const now = new Date();
        const tzOffset = -now.getTimezoneOffset();
        const diffHrs = Math.floor(Math.abs(tzOffset) / 60);
        const diffMins = Math.abs(tzOffset) % 60;
        const tzString = `${tzOffset >= 0 ? '+' : '-'}${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}`;
        const timestamp = now.getFullYear() +
            '-' + String(now.getMonth() + 1).padStart(2, '0') +
            '-' + String(now.getDate()).padStart(2, '0') +
            'T' + String(now.getHours()).padStart(2, '0') +
            ':' + String(now.getMinutes()).padStart(2, '0') +
            ':' + String(now.getSeconds()).padStart(2, '0') +
            '.' + String(now.getMilliseconds()).padStart(3, '0') +
            tzString;
        
        const photoEntry = {
            timestamp: timestamp,
            location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            imageData: photoDataUrl
        };

        photoData.rolls[currentRoll].push(photoEntry);
        saveToLocalStorage();
        updatePhotoList();
        updateRollInfo();
    } catch (err) {
        console.error('Capture error:', err);
        alert('Error capturing photo. Please ensure location permissions are granted.');
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
}

function startNewRoll() {
    currentRoll++;
    photoData.currentRoll = currentRoll;
    photoData.rolls[currentRoll] = [];
    saveToLocalStorage();
    updateRollInfo();
    updatePhotoList();
}

function exportData() {
    const dataStr = JSON.stringify(photoData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `film-photos-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function saveToLocalStorage() {
    localStorage.setItem('photoData', JSON.stringify(photoData));
}

function updateRollInfo() {
    document.getElementById('photoCount').textContent = 
        photoData.rolls[currentRoll] ? photoData.rolls[currentRoll].length : 0;
}

function updatePhotoList() {
    const photoList = document.getElementById('photoList');
    photoList.innerHTML = '';
    
    const currentRollPhotos = photoData.rolls[currentRoll] || [];
    
    currentRollPhotos.forEach((photo, index) => {
        const entry = document.createElement('div');
        entry.className = 'photo-entry';
        
        const img = document.createElement('img');
        img.src = photo.imageData;
        
        const meta = document.createElement('div');
        meta.className = 'photo-meta';
        const date = new Date(photo.timestamp);
        // Format date with timezone offset
        const timeZoneOffset = date.getTimezoneOffset();
        const offsetHours = Math.abs(Math.floor(timeZoneOffset / 60));
        const offsetMinutes = Math.abs(timeZoneOffset % 60);
        const timeZoneString = `${timeZoneOffset <= 0 ? '+' : '-'}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
        
        meta.innerHTML = `
            ${date.toLocaleString()} (${photo.timestamp.slice(-6)})<br>
            ${photo.location.latitude.toFixed(6)}, ${photo.location.longitude.toFixed(6)}
        `;
        
        entry.appendChild(img);
        entry.appendChild(meta);
        photoList.appendChild(entry);
    });
}

function deleteAllData() {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
        photoData = {
            rolls: {},
            currentRoll: 1
        };
        currentRoll = 1;
        photoData.rolls[currentRoll] = [];
        localStorage.removeItem('photoData');
        updatePhotoList();
        updateRollInfo();
    }
}

// Initialize
document.getElementById('captureBtn').addEventListener('click', capturePhoto);
document.getElementById('newRollBtn').addEventListener('click', startNewRoll);
document.getElementById('exportBtn').addEventListener('click', exportData);
document.getElementById('deleteAllBtn').addEventListener('click', deleteAllData);

initCamera();
updateRollInfo();
updatePhotoList();