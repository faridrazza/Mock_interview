# Ready Player Me Avatar Integration Guide

## Avatar Setup Instructions

1. Download your Ready Player Me avatar with Oculus VSEMS morph targets by using this URL:
   ```
   https://readyplayer.me/avatar?morphTargets=OculusVSEMS
   ```

2. Download the GLB file and rename it to `avatar_with_morphs.glb`

3. Place the GLB file in this directory (`public/assets/avatars/`)

4. The application will automatically load the avatar and enable lip-sync functionality

## Morph Target Requirements

Your Ready Player Me avatar GLB file should contain the following morph targets for proper lip-sync:

- Oculus VSEMS morph targets (viseme_A, viseme_B, etc.)
- Head and teeth morph targets
- Mouth-related morph targets (mouthOpen, jawOpen, etc.)

## Troubleshooting

If the avatar is not speaking properly, check the following:

1. Verify that your GLB file contains the required morph targets
2. Check the browser console for any errors related to loading the model
3. Ensure that audio playback is working correctly
4. Try a different Ready Player Me avatar if the current one doesn't have the required morph targets

## Advanced Customization

To customize the lip-sync behavior, you can modify the `MOUTH_SHAPE_MAPPING` in the `Avatar3D.tsx` component. 