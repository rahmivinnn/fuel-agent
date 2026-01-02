# Face-API.js Models

This folder should contain the face-api.js model files for face recognition.

## Required Models:
1. `tiny_face_detector_model-weights_manifest.json`
2. `tiny_face_detector_model-shard1`
3. `face_landmark_68_model-weights_manifest.json`
4. `face_landmark_68_model-shard1`
5. `face_recognition_model-weights_manifest.json`
6. `face_recognition_model-shard1`
7. `face_recognition_model-shard2`

## Download Instructions:
1. Go to: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download the required model files listed above
3. Place them in this `/public/models/` directory

## Alternative:
You can also use CDN links in your code:
```javascript
await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
```

The models are needed for:
- **tiny_face_detector**: Fast face detection
- **face_landmark_68**: 68 facial landmark points
- **face_recognition**: Face descriptor generation for recognition