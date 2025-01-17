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
    if (photoData.rolls[currentRoll].length >= 36) {
        alert('Roll is full! Start a new roll to continue.');
        return;
    }

    try {
        const position = await getCurrentPosition();
        
        const video = document.getElementById('viewfinder');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        const photoEntry = {
            timestamp: new Date().toISOString(),
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
    document.getElementById('rollNumber').textContent = currentRoll;
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
        meta.innerHTML = `
            <strong>Frame ${index + 1}</strong><br>
            ${date.toLocaleString()}<br>
            ${photo.location.latitude.toFixed(6)}, ${photo.location.longitude.toFixed(6)}
        `;
        
        entry.appendChild(img);
        entry.appendChild(meta);
        photoList.appendChild(entry);
    });
}

// Initialize
document.getElementById('captureBtn').addEventListener('click', capturePhoto);
document.getElementById('newRollBtn').addEventListener('click', startNewRoll);
document.getElementById('exportBtn').addEventListener('click', exportData);

initCamera();
updateRollInfo();
updatePhotoList();