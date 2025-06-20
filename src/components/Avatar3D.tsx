import React, { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  useAnimations, 
  Environment, 
  PerspectiveCamera,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { Loader2, AlertCircle } from 'lucide-react';

// Define proper interfaces for the ErrorBoundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: (props: { error: Error }) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Create our own error boundary component since ErrorBoundary is not exported from drei
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Three.js error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback({ error: this.state.error as Error });
    }
    return this.props.children;
  }
}

// Define mouth shape mapping for lip sync
const MOUTH_SHAPE_MAPPING = {
  'A': ['viseme_A', 'viseme_AA', 'mouthOpen', 'jawOpen', 'A', 'O'],
  'B': ['viseme_B', 'viseme_M', 'viseme_P', 'B', 'M', 'P', 'viseme_PP'],
  'C': ['viseme_C', 'viseme_CH', 'viseme_SH', 'C', 'viseme_I'],
  'D': ['viseme_D', 'viseme_T', 'D', 'T', 'viseme_kk'],
  'E': ['viseme_E', 'viseme_I', 'E', 'I'],
  'F': ['viseme_F', 'viseme_V', 'F', 'V', 'viseme_FF'],
  'G': ['viseme_G', 'viseme_K', 'G', 'K'],
  'H': ['viseme_H', 'H', 'viseme_TH'],
  'X': ['viseme_X', 'X', 'viseme_PP'],
  'O': ['viseme_O', 'viseme_U', 'O', 'U'],
  'S': ['viseme_S', 'viseme_Z', 'S', 'Z'],
  'R': ['viseme_R', 'R'],
  'W': ['viseme_W', 'W'],
  'TH': ['viseme_TH', 'TH'],
  'L': ['viseme_L', 'L'],
  'N': ['viseme_N', 'N'],
  'J': ['viseme_J', 'J'],
};

// Update the RHUBARB_MOUTH_SHAPES mapping to match available morph targets
const RHUBARB_MOUTH_SHAPES = {
  'A': ['mouthOpen', 'jawOpen'], // Open mouth - moderate (removed stretching to prevent exaggerated look)
  'B': ['viseme_PP', 'mouthClose', 'mouthPucker'], // Closed mouth with slight pucker instead of funnel
  'C': ['viseme_I', 'mouthSmile', 'mouthStretch'], // Wide mouth with natural smile
  'D': ['viseme_O', 'viseme_U', 'mouthRound'], // Round mouth with proper rounding
  'E': ['viseme_E', 'mouthSmile'], // Small mouth with slight smile
  'F': ['viseme_FF', 'mouthLowerDown'], // Bottom lip touching upper teeth, refined
  'G': ['jawOpen', 'mouthOpen', 'mouthPress'], // Teeth touching (adjusted to prevent overextension)
  'H': ['viseme_TH', 'tongueOut'], // Tongue visible (very subtle)
  'X': ['mouthClose', 'jawClose'] // Neutral mouth position (removed redundant morph targets)
};

// Simplified lip sync data structure
interface LipSyncCue {
  start: number;
  end: number;
  value: string;
}

interface ModelProps {
  modelUrl: string;
  isSpeaking: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}

function Model({ modelUrl, isSpeaking, audioRef }: ModelProps) {
  const group = useRef<THREE.Group>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [animationMixer, setAnimationMixer] = useState<THREE.AnimationMixer | null>(null);
  
  // Use try-catch to handle potential errors in model loading
  const modelData = useMemo(() => {
    try {
      console.log("Attempting to load model from URL:", modelUrl);
      const data = useGLTF(modelUrl);
      console.log("Model loaded successfully:", data);
      console.log("Model animations:", data.animations.map(a => a.name));
      return data;
    } catch (error) {
      console.error("Error loading GLTF model:", error);
      let errorMessage = `Failed to load model: ${error instanceof Error ? error.message : String(error)}`;
      
      // Add more specific error information for common issues
      if (errorMessage.includes("Unexpected token '<'")) {
        errorMessage = `Failed to load model: ${modelUrl} - The server returned HTML instead of a GLB file. This usually means the file doesn't exist or there's a server configuration issue.`;
      } else if (errorMessage.includes("Failed to fetch")) {
        errorMessage = `Failed to load model: ${modelUrl} - Network error. Check your internet connection or if the file exists.`;
      }
      
      setModelError(errorMessage);
      // Return a minimal object to prevent further errors
      return { scene: new THREE.Group(), animations: [] };
    }
  }, [modelUrl]);
  
  // Also update the standingAnimationData useMemo for better debugging
  const standingAnimationData = useMemo(() => {
    try {
      console.log("Loading standing animation from: /assets/avatars/standinganimation.glb");
      const data = useGLTF('/assets/avatars/standinganimation.glb');
      console.log("Standing animation loaded successfully:", data);
      console.log("Standing animation clips:", data.animations.map(a => a.name));
      return data;
    } catch (error) {
      console.error("Error loading standing animation:", error);
      // Return empty animations if there's an error
      return { animations: [] };
    }
  }, []);
  
  const { scene, animations: modelAnimations } = modelData;
  // Combine model animations with standing animation
  const animations = useMemo(() => {
    return [...modelAnimations, ...standingAnimationData.animations];
  }, [modelAnimations, standingAnimationData.animations]);
  
  const { actions, names } = useAnimations(animations, group);
  const { camera } = useThree();
  const [lipSyncData, setLipSyncData] = useState<LipSyncCue[]>([]);
  const [currentMouthShape, setCurrentMouthShape] = useState<string | null>(null);
  const [morphTargetDict, setMorphTargetDict] = useState<Record<string, THREE.SkinnedMesh>>({});
  const lastAudioSrc = useRef<string>('');
  
  // Create animation mixer when scene is loaded
  useEffect(() => {
    if (!scene) return;
    
    const mixer = new THREE.AnimationMixer(scene);
    setAnimationMixer(mixer);
    
    return () => {
      mixer.stopAllAction();
    };
  }, [scene]);
  
  // Update animation mixer on each frame
  useFrame((state, delta) => {
    if (animationMixer) {
      animationMixer.update(delta);
    }
  });

  // Position camera to focus on the face/upper body
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      try {
        // Position camera to show upper body with perfect framing
        camera.position.set(0, 1.65, 2.2); // Moved even further back
        camera.lookAt(0, 1.65, 0); // Looking at the head/face area
        camera.fov = 22; // Even narrower field of view for perfect framing
      camera.updateProjectionMatrix();
        
        console.log("Camera positioned at:", camera.position, "FOV:", camera.fov);
      } catch (error) {
        console.error("Error setting up camera:", error);
      }
    }
  }, [camera]);

  // Play idle animation by default
  useEffect(() => {
    if (!sceneLoaded || !actions) return;
    
    try {
      // Check for standing animation first
      if (names.includes('Standing')) {
        console.log("Playing Standing animation");
        const standingAction = actions['Standing'];
        if (standingAction) {
          // Stop any currently playing animations
          Object.values(actions).forEach(action => {
            if (action.isRunning()) {
              action.fadeOut(0.5);
            }
          });
          
          // Play the standing animation
          standingAction.reset().fadeIn(0.5).play();
          
          // Set animation to loop
          standingAction.loop = THREE.LoopRepeat;
          standingAction.clampWhenFinished = false;
          
          return () => {
            standingAction.fadeOut(0.5);
          };
        }
      } else if (names.includes('Idle')) {
        console.log("Playing Idle animation");
      const idleAction = actions['Idle'];
      if (idleAction) {
        idleAction.reset().fadeIn(0.5).play();
        return () => {
          idleAction.fadeOut(0.5);
        };
      }
    } else if (names.length > 0) {
        // If no idle or standing animation, play the first available one
        console.log(`Playing ${names[0]} animation`);
      const action = actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.5).play();
        return () => {
          action.fadeOut(0.5);
        };
      }
    }
    } catch (error) {
      console.error("Error playing animation:", error);
    }
  }, [actions, names, sceneLoaded]);

  // Find and cache all morph targets in the model
  useEffect(() => {
    if (!scene) return;
    
    try {
    console.log("Model loaded, inspecting for mouth morphs");
      const morphDict: Record<string, THREE.SkinnedMesh> = {};
      
      // Log all meshes in the model to help identify the issue
      console.log("=== ALL MESHES IN MODEL ===");
      scene.traverse((node) => {
        console.log(`Node: ${node.name}, Type: ${node.type}`);
        
        if (node.type === 'SkinnedMesh') {
          const skinnedMesh = node as THREE.SkinnedMesh;
          console.log(`  - SkinnedMesh: ${skinnedMesh.name}`);
          console.log(`    Has morphTargetDictionary: ${!!skinnedMesh.morphTargetDictionary}`);
          console.log(`    Has morphTargetInfluences: ${!!skinnedMesh.morphTargetInfluences}`);
          
          if (skinnedMesh.morphTargetDictionary && skinnedMesh.morphTargetInfluences) {
            console.log(`    Morph target count: ${skinnedMesh.morphTargetInfluences.length}`);
            console.log(`    First 5 morph targets: ${Object.keys(skinnedMesh.morphTargetDictionary).slice(0, 5).join(', ')}`);
            
            // Special check for Wolf3D_Head to understand its structure
            if (skinnedMesh.name === 'Wolf3D_Head') {
              console.log("=== DETAILED INSPECTION OF HEAD MESH ===");
              console.log(`Head mesh position: ${skinnedMesh.position.x}, ${skinnedMesh.position.y}, ${skinnedMesh.position.z}`);
              console.log(`Head mesh rotation: ${skinnedMesh.rotation.x}, ${skinnedMesh.rotation.y}, ${skinnedMesh.rotation.z}`);
              console.log(`Head mesh scale: ${skinnedMesh.scale.x}, ${skinnedMesh.scale.y}, ${skinnedMesh.scale.z}`);
              console.log(`Head mesh visible: ${skinnedMesh.visible}`);
              console.log(`Head mesh parent: ${skinnedMesh.parent?.name || 'none'}`);
              
              // Log mouth-related morph targets on the head mesh
              console.log("Mouth-related morph targets on head mesh:");
              const mouthKeywords = ['mouth', 'jaw', 'lip', 'viseme', 'tongue'];
              Object.keys(skinnedMesh.morphTargetDictionary).forEach(morphName => {
                if (mouthKeywords.some(keyword => morphName.toLowerCase().includes(keyword))) {
                  const index = skinnedMesh.morphTargetDictionary![morphName];
                  console.log(`  - ${morphName} (index ${index}): ${skinnedMesh.morphTargetInfluences![index]}`);
                }
              });
              console.log("=== END OF HEAD MESH INSPECTION ===");
            }
            
            // Special check for Wolf3D_Teeth to see if it's causing the issue
            if (skinnedMesh.name === 'Wolf3D_Teeth') {
              console.log("=== DETAILED INSPECTION OF TEETH MESH ===");
              console.log(`Teeth mesh position: ${skinnedMesh.position.x}, ${skinnedMesh.position.y}, ${skinnedMesh.position.z}`);
              console.log(`Teeth mesh rotation: ${skinnedMesh.rotation.x}, ${skinnedMesh.rotation.y}, ${skinnedMesh.rotation.z}`);
              console.log(`Teeth mesh scale: ${skinnedMesh.scale.x}, ${skinnedMesh.scale.y}, ${skinnedMesh.scale.z}`);
              console.log(`Teeth mesh visible: ${skinnedMesh.visible}`);
              console.log(`Teeth mesh parent: ${skinnedMesh.parent?.name || 'none'}`);
              
              // Log all morph targets on the teeth mesh
              console.log("All morph targets on teeth mesh:");
              Object.keys(skinnedMesh.morphTargetDictionary).forEach(morphName => {
                const index = skinnedMesh.morphTargetDictionary![morphName];
                console.log(`  - ${morphName} (index ${index}): ${skinnedMesh.morphTargetInfluences![index]}`);
              });
              console.log("=== END OF TEETH MESH INSPECTION ===");
            }
            
            // Special check for Wolf3D_Body to see if it's causing the issue
            if (skinnedMesh.name === 'Wolf3D_Body') {
              console.log("=== DETAILED INSPECTION OF BODY MESH ===");
              console.log(`Body mesh position: ${skinnedMesh.position.x}, ${skinnedMesh.position.y}, ${skinnedMesh.position.z}`);
              console.log(`Body mesh rotation: ${skinnedMesh.rotation.x}, ${skinnedMesh.rotation.y}, ${skinnedMesh.rotation.z}`);
              console.log(`Body mesh scale: ${skinnedMesh.scale.x}, ${skinnedMesh.scale.y}, ${skinnedMesh.scale.z}`);
              console.log(`Body mesh visible: ${skinnedMesh.visible}`);
              console.log(`Body mesh parent: ${skinnedMesh.parent?.name || 'none'}`);
              
              // Log all morph targets on the body mesh
              console.log("All morph targets on body mesh:");
              Object.keys(skinnedMesh.morphTargetDictionary).forEach(morphName => {
                const index = skinnedMesh.morphTargetDictionary![morphName];
                console.log(`  - ${morphName} (index ${index}): ${skinnedMesh.morphTargetInfluences![index]}`);
                
                // Immediately set all body morph targets to zero to prevent any unwanted movements
                skinnedMesh.morphTargetInfluences![index] = 0;
              });
              console.log("=== END OF BODY MESH INSPECTION ===");
            }
          }
        }
      });
      console.log("=== END OF MESH LIST ===");
      
      // Calculate model dimensions to position it correctly
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      console.log("Model dimensions:", size, "Center:", center, "Box min/max:", box.min, box.max);
      
      // Adjust model position based on its dimensions
      if (group.current) {
        // Calculate the vertical offset to show upper body
        // We want to position the model so that the head is at around y=1.65
        const headPosition = box.max.y;
        const feetPosition = box.min.y;
        const modelHeight = headPosition - feetPosition;
        
        // Calculate offset to position head at y=1.65
        const targetHeadHeight = 1.65;
        // Add a larger offset to raise the model higher in the frame
        const verticalOffset = targetHeadHeight - headPosition + 0.4;
        
        console.log("Head position:", headPosition, "Feet position:", feetPosition, "Model height:", modelHeight, "Vertical offset:", verticalOffset);
        
        // Position the model
        group.current.position.set(
          -center.x, // Center horizontally
          verticalOffset, // Position vertically to show upper body
          -center.z // Center depth-wise
        );
        
        // If the model is too tall or too short, adjust its scale
        const idealHeight = 1.7; // Target height for the model
        const currentHeight = modelHeight;
        
        // Apply scaling regardless of current height to ensure consistent size
        const scaleFactor = idealHeight / currentHeight;
        console.log(`Adjusting model scale from ${currentHeight} to ${idealHeight}, factor: ${scaleFactor}`);
        group.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }
      
      // Create a map to store which morph targets belong to which meshes
      const meshMorphMap: Record<string, string[]> = {};
      
      scene.traverse((node) => {
        if (node.type === 'SkinnedMesh' && 
            'morphTargetDictionary' in node && 
            'morphTargetInfluences' in node) {
          const skinnedMesh = node as THREE.SkinnedMesh;
          
          if (skinnedMesh.morphTargetDictionary) {
            console.log("Found mesh with morph targets:", node.name, Object.keys(skinnedMesh.morphTargetDictionary));
            
            // Store which mesh this is for each morph target
            if (!meshMorphMap[node.name]) {
              meshMorphMap[node.name] = [];
            }
            
            // Store all morph targets for this mesh
            Object.keys(skinnedMesh.morphTargetDictionary).forEach(morphName => {
              morphDict[morphName] = skinnedMesh;
              meshMorphMap[node.name].push(morphName);
            });
          }
        }
      });
      
      // Log which morph targets belong to which meshes
      console.log("Morph targets by mesh:");
      Object.entries(meshMorphMap).forEach(([meshName, morphs]) => {
        console.log(`- ${meshName}: ${morphs.length} morph targets`);
        // Log a few examples
        if (morphs.length > 0) {
          console.log(`  Examples: ${morphs.slice(0, 5).join(', ')}${morphs.length > 5 ? '...' : ''}`);
        }
      });
      
      // Check for mouth-related morphs in each mesh
      console.log("Mouth-related morphs by mesh:");
      const mouthKeywords = ['mouth', 'jaw', 'lip', 'viseme', 'tongue'];
      Object.entries(meshMorphMap).forEach(([meshName, morphs]) => {
        const mouthMorphs = morphs.filter(morph => 
          mouthKeywords.some(keyword => morph.toLowerCase().includes(keyword))
        );
        if (mouthMorphs.length > 0) {
          console.log(`- ${meshName}: ${mouthMorphs.length} mouth-related morphs`);
          console.log(`  Examples: ${mouthMorphs.slice(0, 5).join(', ')}${mouthMorphs.length > 5 ? '...' : ''}`);
        }
      });
      
      setMorphTargetDict(morphDict);
      console.log("Cached morph targets:", Object.keys(morphDict));
      setSceneLoaded(true);
    } catch (error) {
      console.error("Error inspecting morph targets:", error);
      setModelError(`Error analyzing model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [scene]);

  // Also add a debug helper to visualize the model's position
  // This will be visible during development but can be removed in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && group.current) {
      // Add a small sphere to mark the target head position
      const geometry = new THREE.SphereGeometry(0.05, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(0, 1.65, 0);
      group.current.add(marker);
      
      return () => {
        if (group.current) {
          group.current.remove(marker);
        }
      };
    }
  }, [group.current]);

  // Update the useEffect that handles audio changes
  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    
    try {
      // Update the extractLipSyncFromUrl function to better handle the hash parameter
      const extractLipSyncFromUrl = (url: string) => {
        try {
          console.log("Extracting lip-sync data from URL:", url.substring(0, 50) + "...");
          console.log("URL has hash:", url.includes('#'));
          
          if (url.includes('#')) {
            const hashPart = url.split('#')[1];
            console.log("Found hash part:", hashPart.substring(0, 50) + "...");
            
            if (hashPart && hashPart.startsWith('lipsync=')) {
              const encodedData = hashPart.substring('lipsync='.length);
              console.log("Encoded data length:", encodedData.length);
              
              try {
                const decodedData = decodeURIComponent(encodedData);
                console.log("Decoded data length:", decodedData.length);
                
                try {
                  const parsedData = JSON.parse(decodedData);
                  console.log("Successfully parsed lip-sync data:", {
                    hasMouthCues: !!parsedData.mouthCues,
                    mouthCuesCount: parsedData.mouthCues ? parsedData.mouthCues.length : 0,
                    sampleCues: parsedData.mouthCues ? parsedData.mouthCues.slice(0, 3) : []
                  });
                  
                  return parsedData;
                } catch (parseError) {
                  console.error("Error parsing JSON data:", parseError);
                }
              } catch (decodeError) {
                console.error("Error decoding URL data:", decodeError);
              }
            }
          }
          
          // Try an alternative approach - sometimes the hash might be encoded in the URL
          if (url.includes('lipsync%3D')) {
            console.log("Found encoded lipsync parameter");
            const parts = url.split('lipsync%3D');
            if (parts.length > 1) {
              try {
                // The data might be double-encoded
                const encodedData = parts[1];
                const decodedData = decodeURIComponent(encodedData);
                const parsedData = JSON.parse(decodedData);
                
                console.log("Successfully parsed lip-sync data (alternative method):", {
                  hasMouthCues: !!parsedData.mouthCues,
                  mouthCuesCount: parsedData.mouthCues ? parsedData.mouthCues.length : 0
                });
                
                return parsedData;
              } catch (error) {
                console.error("Error with alternative parsing approach:", error);
              }
            }
          }
        } catch (e) {
          console.error("Error extracting lip-sync data from URL:", e);
        }
        
        console.log("No lip-sync data found in URL");
        return null;
      };
      
      // Function to generate lip sync data based on text analysis
      const generateLipSyncFromText = () => {
        const duration = audioRef.current?.duration || 0;
        if (duration <= 0) {
          console.warn("Audio duration is 0 or undefined, cannot generate lip sync");
          return;
        }
        
        console.log("Generating lip sync for audio with duration:", duration);
        
        // Get the current audio source URL to check if it contains lip-sync data
        const audioSrc = audioRef.current?.src || '';
        
        // Check if we have lip-sync data in the URL hash
        const lipsyncData = extractLipSyncFromUrl(audioSrc);
        
        // If we have lip-sync data from the URL, use it
        if (lipsyncData && lipsyncData.mouthCues) {
          const cues: LipSyncCue[] = lipsyncData.mouthCues.map((cue: any) => ({
            start: cue.start,
            end: cue.end,
            value: cue.value // Use the Rhubarb value directly
          }));
          setLipSyncData(cues);
          console.log("Using lip-sync data from URL:", cues.length, "cues");
          return;
        }
        
        console.log("No lip-sync data found, generating synthetic data");
        
        // Create phoneme sequence with timing
        const cues: LipSyncCue[] = [];
        
        // Calculate average phoneme duration based on audio length
        // Typical English speech has about 5-8 phonemes per second for natural speaking
        const phonemesPerSecond = 6; // Increased for more natural speech
        const totalPhonemes = Math.ceil(duration * phonemesPerSecond);
        const avgPhonemeLength = duration / totalPhonemes;
        
        // Create a more natural pattern of mouth movements
        // This simulates the rhythm of speech with appropriate pauses
        let currentTime = 0;
        let inWord = true;
        let wordLength = 0;
        let lastShape = 'X'; // Keep track of last shape for better transitions
        
        // Add a neutral starting position
        cues.push({
          start: 0,
          end: avgPhonemeLength * 0.3,
          value: 'X' // Start with neutral/closed mouth
        });
        currentTime = avgPhonemeLength * 0.3;
        
        // Common sequences in English speech
        const commonSequences = [
          ['B', 'A', 'E'], // "ba" sound
          ['X', 'A', 'D'], // opening to round sound
          ['B', 'C', 'D'], // closed to wide to round
          ['D', 'B', 'X'], // round to closed to neutral
          ['A', 'F', 'A'], // open to F (v/f) back to open
          ['C', 'E', 'B'], // wide to small to closed
          ['E', 'A', 'C'], // small to open to wide
          ['B', 'A', 'B', 'A'], // talking pattern
          ['X', 'D', 'A', 'X'], // neutral to round to open to neutral
          ['A', 'B', 'A', 'B'], // alternating open-closed
        ];
        
        // Create logical sequences of shapes based on speech patterns
        while (currentTime < duration) {
          if (inWord) {
            // We're in a "word" - generate a realistic sequence of phonemes
            
            // Either use a common sequence or generate random phonemes
            if (Math.random() < 0.7) { // 70% chance to use common sequences for realism
              // Select a random common sequence
              const sequence = commonSequences[Math.floor(Math.random() * commonSequences.length)];
              
              // Apply the sequence
              for (const phoneme of sequence) {
                // Vary phoneme duration for natural speech (80-120% of average)
                const variance = 0.8 + (Math.random() * 0.4);
                const phonemeDuration = avgPhonemeLength * variance;
                
                // Don't repeat the same phoneme twice in a row (unless it's X or B which can be held)
                if (phoneme !== lastShape || phoneme === 'X' || phoneme === 'B') {
                  cues.push({
                    start: currentTime,
                    end: currentTime + phonemeDuration,
                    value: phoneme
                  });
                  
                  currentTime += phonemeDuration;
                  lastShape = phoneme;
                }
              }
              
              wordLength += sequence.length;
            } else {
              // Use Rhubarb mouth shapes with weighted probabilities
              // Prioritize most common shapes in speech
              const phonemeChoices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'X'];
              
              // Mouth shape probabilities - based on English phoneme frequencies
              const phonemeWeights = [
                0.25, // A - open mouth (very common in speech)
                0.20, // B - closed mouth (common)
                0.10, // C - wide mouth (smile-like)
                0.15, // D - round mouth (o/u sounds)
                0.10, // E - small mouth
                0.05, // F - bottom lip to teeth (f/v sounds)
                0.05, // G - teeth touching
                0.10  // X - neutral/relaxed
              ];
              
              // Select a phoneme based on weights
              const randomValue = Math.random();
              let cumulativeWeight = 0;
              let phonemeIndex = 0;
              
              for (let i = 0; i < phonemeWeights.length; i++) {
                cumulativeWeight += phonemeWeights[i];
                if (randomValue < cumulativeWeight) {
                  phonemeIndex = i;
                  break;
                }
              }
              
              const phoneme = phonemeChoices[phonemeIndex];
              
              // Don't repeat the same phoneme twice in a row (unless it's X or B which can be held)
              if (phoneme !== lastShape || phoneme === 'X' || phoneme === 'B') {
                // Vary phoneme duration based on the type of sound
                // Open sounds (A) tend to be longer than consonants (B, F, G)
                let durationMultiplier = 1.0;
                
                if (phoneme === 'A' || phoneme === 'D') {
                  // Vowel sounds tend to be longer
                  durationMultiplier = 1.2 + (Math.random() * 0.4); // 120-160% of average
                } else if (phoneme === 'B' || phoneme === 'F' || phoneme === 'G') {
                  // Consonants tend to be shorter
                  durationMultiplier = 0.7 + (Math.random() * 0.3); // 70-100% of average
                } else {
                  // Other shapes have normal variation
                  durationMultiplier = 0.8 + (Math.random() * 0.4); // 80-120% of average
                }
                
                const phonemeDuration = avgPhonemeLength * durationMultiplier;
                
                cues.push({
                  start: currentTime,
                  end: currentTime + phonemeDuration,
                  value: phoneme
                });
                
                currentTime += phonemeDuration;
                lastShape = phoneme;
                wordLength++;
              }
            }
            
            // Decide if we should end the current "word"
            // Words are typically 1-7 phonemes long
            if (wordLength >= 2 + Math.floor(Math.random() * 5)) {
              inWord = false;
              wordLength = 0;
            }
          } else {
            // We're between "words" - add a brief pause (mouth closed)
            const pauseDuration = avgPhonemeLength * (0.3 + Math.random() * 0.4); // Slightly longer pauses
            
            // For pauses, use primarily B (closed mouth) with occasional X (neutral)
            if (Math.random() < 0.8) {
              // 80% chance of completely closed mouth during pauses
              cues.push({
                start: currentTime,
                end: currentTime + pauseDuration,
                value: 'B' // Closed mouth
              });
            } else {
              // 20% chance of neutral mouth during pauses
              cues.push({
                start: currentTime,
                end: currentTime + pauseDuration,
                value: 'X' // Neutral mouth
              });
            }
            
            currentTime += pauseDuration;
            lastShape = cues[cues.length - 1].value;
            inWord = true;
          }
        }
        
        // Ensure the last cue extends to the end of the audio
        if (cues.length > 0) {
          const lastCue = cues[cues.length - 1];
          if (lastCue.end < duration) {
            lastCue.end = duration;
          }
        }
        
        // Add a neutral ending position
        if (cues.length > 0 && cues[cues.length - 1].end < duration) {
          cues.push({
            start: cues[cues.length - 1].end,
            end: duration,
            value: 'X' // End with neutral/closed mouth
          });
        }
        
        // Smooth transitions between shapes for more natural movement
        for (let i = 0; i < cues.length - 1; i++) {
          // Add small overlap for certain transitions to create blending
          const currentShape = cues[i].value;
          const nextShape = cues[i+1].value;
          
          // Calculate appropriate overlap based on shapes
          let overlapTime = 0;
          
          // Different overlap times based on which sounds are transitioning
          if ((currentShape === 'A' && (nextShape === 'B' || nextShape === 'E')) || 
              (currentShape === 'B' && (nextShape === 'A' || nextShape === 'C'))) {
            // For transitions between open and closed/small shapes - medium overlap
            overlapTime = Math.min(0.04, (cues[i].end - cues[i].start) * 0.15);
          } else if ((currentShape === 'C' && (nextShape === 'D' || nextShape === 'E')) || 
                     (currentShape === 'D' && (nextShape === 'C' || nextShape === 'A'))) {
            // For transitions between wide/round shapes - larger overlap
            overlapTime = Math.min(0.05, (cues[i].end - cues[i].start) * 0.2);
          } else {
            // Default small overlap for other transitions
            overlapTime = Math.min(0.03, (cues[i].end - cues[i].start) * 0.1);
          }
          
          cues[i].end += overlapTime;
          cues[i+1].start -= overlapTime;
        }
        
        setLipSyncData(cues);
        console.log(`Generated enhanced lip sync data: ${cues.length} cues for ${duration} seconds`);
      };
      
      // Set up event listeners for audio changes
      const handleAudioChange = () => {
        if (audioRef.current?.src && audioRef.current.src !== lastAudioSrc.current) {
          lastAudioSrc.current = audioRef.current.src;
          console.log("Audio source changed, generating new lip sync data");
          
          // Wait for audio metadata to load
          if (audioRef.current.readyState >= 1) {
            generateLipSyncFromText();
          } else {
            console.log("Audio not ready, waiting for metadata");
            audioRef.current.addEventListener('loadedmetadata', handleMetadata, { once: true });
          }
        }
      };
      
      const handleMetadata = () => {
        console.log("Audio metadata loaded, generating lip sync");
        generateLipSyncFromText();
      };
      
      // Listen for play events to ensure lip sync is ready
      const handlePlay = () => {
        console.log("Audio play event detected");
        if (lipSyncData.length === 0) {
          console.log("No lip sync data available, generating now");
          generateLipSyncFromText();
        }
      };
      
      // Set up all event listeners
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('loadeddata', handleAudioChange);
      
      // Initial check for existing audio
      handleAudioChange();
      
      // Clean up event listeners
      return () => {
        audioRef.current?.removeEventListener('play', handlePlay);
        audioRef.current?.removeEventListener('loadedmetadata', handleMetadata);
        audioRef.current?.removeEventListener('loadeddata', handleAudioChange);
      };
    } catch (error) {
      console.error("Error setting up lip sync:", error);
    }
  }, [audioRef.current, isSpeaking]);

  // Add eye blinking functionality
  const [blinking, setBlinking] = useState(false);

  // Add eye blinking effect
  useEffect(() => {
    let blinkTimeout: number | null = null;
    
    const blink = () => {
      setBlinking(true);
      setTimeout(() => {
        setBlinking(false);
        scheduleNextBlink();
      }, 200); // Blink duration: 200ms
    };
    
    const scheduleNextBlink = () => {
      // Random time between 2 and 6 seconds
      const nextBlinkTime = 2000 + Math.random() * 4000;
      blinkTimeout = window.setTimeout(blink, nextBlinkTime);
    };
    
    // Start the blinking cycle
    scheduleNextBlink();
    
    // Clean up on unmount
    return () => {
      if (blinkTimeout) {
        clearTimeout(blinkTimeout);
      }
    };
  }, []);

  // Update the applyMouthShape function to use more natural and realistic values for the morph targets
  const applyMouthShape = (shape: string | null) => {
    try {
      // Skip excessive logging to improve performance
      if (shape) {
        console.log(`Applying mouth shape: ${shape}`);
      }
      
      // FIRST STEP: Reset ALL morph targets on ALL meshes to ensure no unwanted movements
      scene.traverse((node) => {
        if (node.type === 'SkinnedMesh' && 
            'morphTargetDictionary' in node && 
            'morphTargetInfluences' in node) {
          const skinnedMesh = node as THREE.SkinnedMesh;
          
          // Reset all morph targets for this mesh
          if (skinnedMesh.morphTargetInfluences) {
            for (let i = 0; i < skinnedMesh.morphTargetInfluences.length; i++) {
              skinnedMesh.morphTargetInfluences[i] = 0;
            }
          }
        }
      });
      
      // If we're just resetting, we can return now
      if (!shape) return;
      
      // SECOND STEP: Only apply mouth shapes to facial meshes
      // Find matching morph targets for this shape using Rhubarb mapping
      const targetMorphs = RHUBARB_MOUTH_SHAPES[shape as keyof typeof RHUBARB_MOUTH_SHAPES] || [];
      
      // If we have matching morphs, apply them with more natural intensity
      let appliedAny = false;
      
      // Transition smoothness factor - extract this value to make it configurable
      // Higher values (closer to 1) mean slower, smoother transitions
      // Lower values mean quicker transitions
      const transitionSmoothness = 0.4; // Reduced from 0.5 for slightly faster transitions
      
      // Apply only to facial meshes
      scene.traverse((node) => {
        if (node.type === 'SkinnedMesh' && 
            'morphTargetDictionary' in node && 
            'morphTargetInfluences' in node) {
          const skinnedMesh = node as THREE.SkinnedMesh;
          
          // Only apply to facial meshes
          if (skinnedMesh.name === 'Wolf3D_Head' || skinnedMesh.name === 'Wolf3D_Teeth') {
            
            // First try exact matches with the specific phoneme
            targetMorphs.forEach(morphName => {
              if (skinnedMesh.morphTargetDictionary && morphName in skinnedMesh.morphTargetDictionary) {
                const index = skinnedMesh.morphTargetDictionary[morphName];
                
                // Apply the morph target with a more natural value - finely tuned for each shape
                let targetValue = 0.35; // Reduced default value for more subtle movements
                
                // Use appropriate values for different shapes - finely calibrated
                if (shape === 'A') {
                  // Open mouth shapes should be moderate, not extreme
                  targetValue = morphName.includes('Open') ? 0.4 : 0.3; // Reduced opening
                } else if (shape === 'C') {
                  // Wide mouth shapes need balance
                  targetValue = morphName.includes('Smile') ? 0.45 : 0.35; // Prioritize smile for wide mouth
                } else if (shape === 'D') {
                  // Round mouth shapes
                  targetValue = morphName.includes('Round') || morphName.includes('O') ? 0.45 : 0.35;
                } else if (shape === 'B' || shape === 'X') {
                  // Closed mouth shapes
                  targetValue = morphName.includes('Close') ? 0.45 : 0.3;
                  // Prevent lips from crossing each other
                  if (morphName.includes('Pucker')) targetValue = 0.25; // Reduced pucker
                } else if (shape === 'E') {
                  // Small mouth shapes
                  targetValue = morphName.includes('Smile') ? 0.35 : 0.25;
                } else if (shape === 'F') {
                  // F shape (bottom lip to upper teeth)
                  targetValue = morphName.includes('Lower') ? 0.35 : 0.3;
                } else if (shape === 'G') {
                  // G shape (jaw open) should be moderate
                  targetValue = morphName.includes('Press') ? 0.4 : 0.3;
                } else if (shape === 'H') {
                  // H shape (tongue visible)
                  targetValue = morphName.includes('tongue') ? 0.15 : 0.25; // Very subtle tongue
                }
                
                // Check if this is a transition between shapes (indicated by -> in the shape name)
                // This is a special marker for blended transitions that our frame loop adds
                if (shape.includes('->')) {
                  // We're in the middle of a transition between two shapes
                  // Adjust the target value to be even gentler for transitions
                  targetValue *= 0.9; // Slightly reduce intensity during transitions
                }
                
                // Apply smoothly to prevent jerky transitions
                // If the mesh already has this morph target active, blend to target value
                if (skinnedMesh.morphTargetInfluences[index] !== undefined) {
                  // Smooth interpolation to target value
                  const currentValue = skinnedMesh.morphTargetInfluences[index];
                  skinnedMesh.morphTargetInfluences[index] = currentValue + (targetValue - currentValue) * transitionSmoothness;
                } else {
                  // Direct application if not already active
                  skinnedMesh.morphTargetInfluences[index] = targetValue;
                }
                
                appliedAny = true;
              }
            });
            
            // If no specific morph targets found, try to use generic mouth open/close
            if (!appliedAny) {
              // Select appropriate generic morphs based on the shape
              let genericMorphs: string[] = [];
              let targetValue = 0.35; // Reduced default value
              
              if (shape === 'A' || shape === 'C' || shape === 'D' || shape === 'E' || shape === 'G') {
                // Open mouth shapes
                genericMorphs = ['mouthOpen', 'jawOpen', 'viseme_AA'];
                targetValue = 0.4; // Moderate open
              } else if (shape === 'B' || shape === 'X') {
                // Closed mouth shapes
                genericMorphs = ['mouthClose', 'jawClose'];
                targetValue = 0.45; // Strong closing
              } else {
                // Other shapes
                genericMorphs = ['mouthOpen', 'jawOpen', 'mouthStretch'];
                targetValue = 0.3; // Moderate
              }
              
              // Try to apply these generic morphs
              genericMorphs.forEach(morphName => {
                if (skinnedMesh.morphTargetDictionary && morphName in skinnedMesh.morphTargetDictionary) {
                  const index = skinnedMesh.morphTargetDictionary[morphName];
                  
                  // Apply with smooth transition
                  if (skinnedMesh.morphTargetInfluences[index] !== undefined) {
                    const currentValue = skinnedMesh.morphTargetInfluences[index];
                    skinnedMesh.morphTargetInfluences[index] = currentValue + (targetValue - currentValue) * transitionSmoothness;
                  } else {
                    skinnedMesh.morphTargetInfluences[index] = targetValue;
                  }
                  
                  appliedAny = true;
                }
              });
              
              // If still no morphs applied, try any mouth-related morph as a last resort
              if (!appliedAny) {
                // Try to find any morph target with these keywords
                const mouthKeywords = ['mouth', 'jaw', 'lip', 'viseme', 'tongue'];
                
                if (skinnedMesh.morphTargetDictionary) {
                  Object.keys(skinnedMesh.morphTargetDictionary).forEach(morphName => {
                    if (mouthKeywords.some(keyword => morphName.toLowerCase().includes(keyword))) {
                      const index = skinnedMesh.morphTargetDictionary![morphName];
                      
                      // Use natural values for more realistic effect
                      let naturalValue = 0.3; // Reduced default value
                      
                      // Determine if this is an "open" or "close" morph based on name
                      if (morphName.toLowerCase().includes('open') || 
                          morphName.toLowerCase().includes('stretch') ||
                          morphName.toLowerCase().includes('funnel')) {
                        // For open mouth morphs
                        if (shape === 'A' || shape === 'C' || shape === 'D' || shape === 'E' || shape === 'G') {
                          naturalValue = 0.4; // Moderate open for open shapes
                        } else {
                          naturalValue = 0.0; // Fully closed for closed shapes
                        }
                      } else if (morphName.toLowerCase().includes('close')) {
                        // For closed mouth morphs
                        if (shape === 'B' || shape === 'X') {
                          naturalValue = 0.45; // Strong closed for closed shapes
                        } else {
                          naturalValue = 0.0; // Not closed for open shapes
                        }
                      } else if (morphName.toLowerCase().includes('round') || 
                                morphName.toLowerCase().includes('pucker') ||
                                morphName.toLowerCase().includes('funnel')) {
                        // For rounding/puckering morphs - prevent excessive pursing
                        naturalValue = shape === 'D' ? 0.35 : 0.0; // Only use for 'D' shape
                      }
                      
                      // Special handling for tongue morphs to prevent extreme tongue protrusion
                      if (morphName.toLowerCase().includes('tongue')) {
                        naturalValue = Math.min(naturalValue, 0.15); // Very subtle tongue movement
                      }
                      
                      // Special handling for smile morphs to prevent unnatural smiling
                      if (morphName.toLowerCase().includes('smile')) {
                        naturalValue = shape === 'C' || shape === 'E' ? 0.3 : 0.0; // Only use for 'C' and 'E' shapes
                      }
                      
                      // Apply with smooth transition
                      if (skinnedMesh.morphTargetInfluences[index] !== undefined) {
                        const currentValue = skinnedMesh.morphTargetInfluences[index];
                        skinnedMesh.morphTargetInfluences[index] = currentValue + (naturalValue - currentValue) * transitionSmoothness;
                      } else {
                        skinnedMesh.morphTargetInfluences[index] = naturalValue;
                      }
                    }
                  });
                }
              }
            }
          } else {
            // For non-facial meshes, explicitly set all morph targets to zero
            // Special handling for neck-related meshes
            const isNeckRelated = skinnedMesh.name.toLowerCase().includes('neck') || 
                                 skinnedMesh.name.toLowerCase().includes('throat') || 
                                 skinnedMesh.name === 'Wolf3D_Body';
            
            if (skinnedMesh.morphTargetInfluences) {
              for (let i = 0; i < skinnedMesh.morphTargetInfluences.length; i++) {
                // Double-check that these are really zero
                if (skinnedMesh.morphTargetInfluences[i] !== 0) {
                  skinnedMesh.morphTargetInfluences[i] = 0;
                }
              }
            }
          }
        }
      });
      
      // Apply eye blinking if needed - no changes needed here
      if (blinking) {
        scene.traverse((node) => {
          if (node.type === 'SkinnedMesh' && 
              'morphTargetDictionary' in node && 
              'morphTargetInfluences' in node) {
            const skinnedMesh = node as THREE.SkinnedMesh;
            
            // Only apply to eye meshes
            if (skinnedMesh.name === 'EyeLeft' || skinnedMesh.name === 'EyeRight' || skinnedMesh.name === 'Wolf3D_Head') {
              const eyeBlinkMorphs = ['eyeBlinkLeft', 'eyeBlinkRight', 'eyeClosed', 'eyesClosed'];
              
              eyeBlinkMorphs.forEach(morphName => {
                if (skinnedMesh.morphTargetDictionary && morphName in skinnedMesh.morphTargetDictionary) {
                  const index = skinnedMesh.morphTargetDictionary[morphName];
                  skinnedMesh.morphTargetInfluences[index] = 1.0; // Fully closed
                }
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Error applying mouth shape:", error);
    }
  };

  // Update lip sync on each frame
  useFrame(() => {
    try {
      if (isSpeaking && audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        
        if (lipSyncData.length > 0) {
          // Find current and next mouth shapes based on audio time
          // Instead of just finding the current cue, look for both current and next for blending
          const currentCue = lipSyncData.find(
            cue => currentTime >= cue.start && currentTime <= cue.end
          );
          
          // Find the next cue for smooth anticipatory transitions
          const nextCueIndex = currentCue ? 
            lipSyncData.findIndex(cue => cue.start > currentTime) : -1;
          const nextCue = nextCueIndex >= 0 ? lipSyncData[nextCueIndex] : null;
          
          if (currentCue) {
            // Calculate how far we are through the current mouth shape as a percentage (0-1)
            const progress = (currentTime - currentCue.start) / (currentCue.end - currentCue.start);
            
            // If we're near the end of the current cue and there's a next cue, start blending
            const transitionThreshold = 0.85; // Start transition when 85% through current cue
            
            if (progress > transitionThreshold && nextCue && nextCue.value !== currentCue.value) {
              // Blend between current and next shapes for smoother transitions
              const blendFactor = (progress - transitionThreshold) / (1 - transitionThreshold);
              
              // Apply anticipatory transition - log less frequently to reduce console spam
              if (currentMouthShape !== `${currentCue.value}->${nextCue.value}`) {
                console.log(`Blending from ${currentCue.value} to ${nextCue.value} at time ${currentTime.toFixed(2)}, blend: ${blendFactor.toFixed(2)}`);
                setCurrentMouthShape(`${currentCue.value}->${nextCue.value}`);
                
                // Apply the blended mouth shape
                // We'll use only the current shape's applyMouthShape for simplicity
                // The actual blending happens in the applyMouthShape function through smooth transitions
                applyMouthShape(currentCue.value);
              }
            } else if (currentCue.value !== currentMouthShape) {
              // Regular transition to new mouth shape
              console.log(`Applying mouth shape: ${currentCue.value} at time ${currentTime.toFixed(2)}`);
              setCurrentMouthShape(currentCue.value);
              applyMouthShape(currentCue.value);
            } else {
              // Continue applying the current shape to ensure consistent intensity
              // This helps with maintaining proper mouth shapes throughout their duration
              // Only apply every few frames to avoid performance issues
              if (Math.random() < 0.2) { // Apply updates at random to smooth things out
                applyMouthShape(currentCue.value);
              }
            }
          } else if (!currentCue) {
            // If no cue is found but we're still speaking, use a default mouth shape
            if (audioRef.current.paused) {
              // If audio is paused, close the mouth
              if (currentMouthShape !== null) {
                console.log("Audio paused, closing mouth");
                setCurrentMouthShape(null);
                applyMouthShape(null);
              }
            } else {
              // If audio is playing but no cue, use a default shape
              // Check if we're past the end of our cues but audio is still playing
              const lastCue = lipSyncData[lipSyncData.length - 1];
              if (lastCue && currentTime > lastCue.end) {
                // We're past our lip sync data but audio is still playing
                // Use a neutral mouth position
                const defaultShape = 'X'; // Neutral mouth
                
                if (currentMouthShape !== defaultShape) {
                  console.log(`Past lip sync data, using neutral shape at time ${currentTime.toFixed(2)}`);
                  setCurrentMouthShape(defaultShape);
                  applyMouthShape(defaultShape);
                }
              } else {
                // We're within the audio duration but don't have a specific cue
                // This could be a gap in our cue data
                const defaultShape = 'X'; // Neutral mouth
                if (currentMouthShape !== defaultShape) {
                  console.log(`Gap in lip sync data, using neutral shape at time ${currentTime.toFixed(2)}`);
                  setCurrentMouthShape(defaultShape);
                  applyMouthShape(defaultShape);
                }
              }
            }
          }
        } else {
          // No lip sync data available, use cycled shapes for a basic talking effect
          // Use a more natural cycle with smoother transitions
          const cycleTime = Math.floor(currentTime * 2.5) % 4; // Slower cycle (4 shapes)
          let defaultShape: string;
          
          // Cycle through different mouth shapes for more natural movement when no lip sync data
          switch(cycleTime) {
            case 0: defaultShape = 'X'; break; // Neutral
            case 1: defaultShape = 'B'; break; // Closed
            case 2: defaultShape = 'A'; break; // Open
            case 3: defaultShape = 'D'; break; // Round
            default: defaultShape = 'X';
          }
          
          if (currentMouthShape !== defaultShape) {
            console.log(`No lip sync data, using cycled shape: ${defaultShape}`);
            setCurrentMouthShape(defaultShape);
            applyMouthShape(defaultShape);
          }
        }
      } else if (!isSpeaking && currentMouthShape !== null) {
        // Not speaking, close the mouth
        console.log("Not speaking, closing mouth");
        setCurrentMouthShape(null);
        applyMouthShape(null);
      }
    } catch (error) {
      console.error("Error in lip sync frame update:", error);
    }
  });

  // Handle animation transitions based on speaking state
  useEffect(() => {
    if (!sceneLoaded || !actions || names.length === 0) return;
    
    try {
      // When speaking, we can add subtle animation changes if needed
      if (isSpeaking) {
        // You could add subtle head movements or other animations when speaking
        // For now, we'll keep the standing animation but could blend with others
        
        // Example of how to blend with a talking animation if available:
        if (names.includes('Talking') && actions['Talking']) {
          const talkAction = actions['Talking'];
          talkAction.reset().fadeIn(0.3).play();
          
          return () => {
            talkAction.fadeOut(0.3);
          };
        }
      } else {
        // When not speaking, ensure standing animation is playing
        if (names.includes('Standing') && actions['Standing']) {
          const standingAction = actions['Standing'];
          if (!standingAction.isRunning()) {
            standingAction.reset().fadeIn(0.5).play();
          }
        }
      }
    } catch (error) {
      console.error("Error transitioning animations:", error);
    }
  }, [isSpeaking, sceneLoaded, actions, names]);

  // State to track hover state
  const [isHovered, setIsHovered] = useState(false);

  // Handle hover interactions
  useEffect(() => {
    if (!sceneLoaded || !actions || names.length === 0) return;
    
    try {
      if (isHovered) {
        // When hovered, we could play a subtle reaction animation
        // For example, a slight head turn or nod if available
        if (names.includes('HeadTurn') && actions['HeadTurn']) {
          const hoverAction = actions['HeadTurn'];
          hoverAction.reset().fadeIn(0.2).play();
          
          return () => {
            hoverAction.fadeOut(0.2);
          };
        }
      }
    } catch (error) {
      console.error("Error handling hover animation:", error);
    }
  }, [isHovered, sceneLoaded, actions, names]);

  // State to track click interaction
  const [isClicked, setIsClicked] = useState(false);

  // Handle click interactions
  useEffect(() => {
    if (!sceneLoaded || !actions || names.length === 0) return;
    
    try {
      if (isClicked) {
        // When clicked, play a reaction animation if available
        if (names.includes('Wave') && actions['Wave']) {
          const waveAction = actions['Wave'];
          waveAction.reset().fadeIn(0.2).play();
          waveAction.loop = THREE.LoopOnce;
          waveAction.clampWhenFinished = true;
          
          // Reset the clicked state after animation completes
          const duration = waveAction.getClip().duration;
          const timer = setTimeout(() => {
            setIsClicked(false);
          }, duration * 1000);
          
          return () => {
            clearTimeout(timer);
            waveAction.fadeOut(0.2);
          };
        } else if (names.includes('Nod') && actions['Nod']) {
          // Try a nodding animation as fallback
          const nodAction = actions['Nod'];
          nodAction.reset().fadeIn(0.2).play();
          nodAction.loop = THREE.LoopOnce;
          nodAction.clampWhenFinished = true;
          
          // Reset the clicked state after animation completes
          const duration = nodAction.getClip().duration;
          const timer = setTimeout(() => {
            setIsClicked(false);
          }, duration * 1000);
          
          return () => {
            clearTimeout(timer);
            nodAction.fadeOut(0.2);
          };
        } else {
          // If no specific animation, just reset the state after a short delay
          const timer = setTimeout(() => {
            setIsClicked(false);
          }, 1000);
          
          return () => {
            clearTimeout(timer);
          };
        }
      }
    } catch (error) {
      console.error("Error handling click animation:", error);
      setIsClicked(false);
    }
  }, [isClicked, sceneLoaded, actions, names]);

  // Add random idle movements to make the avatar more lifelike
  useEffect(() => {
    if (!sceneLoaded || !scene) return;
    
    // Function to add subtle random movements
    const addRandomMovements = () => {
      // Small random head rotation
      scene.traverse((node) => {
        if (node.name.toLowerCase().includes('head') || node.name.toLowerCase().includes('neck')) {
          // Add subtle random rotation
          const randomX = (Math.random() - 0.5) * 0.05;
          const randomY = (Math.random() - 0.5) * 0.1;
          
          // Apply rotation smoothly
          if (node.rotation) {
            node.rotation.x += (randomX - node.rotation.x) * 0.1;
            node.rotation.y += (randomY - node.rotation.y) * 0.1;
          }
        }
      });
    };
    
    // Set up interval for random movements when not speaking
    const movementInterval = setInterval(() => {
      if (!isSpeaking) {
        addRandomMovements();
      }
    }, 2000); // Every 2 seconds
    
    return () => {
      clearInterval(movementInterval);
    };
  }, [sceneLoaded, scene, isSpeaking]);

  if (modelError) {
  return (
      <Html center>
        <div className="bg-red-900/80 p-4 rounded-lg text-white max-w-md relative z-10">
          <h3 className="font-medium">Model Error</h3>
          <p className="text-sm">{modelError}</p>
          <p className="text-xs mt-2 opacity-80">The interview will continue without the avatar visualization.</p>
        </div>
      </Html>
    );
  }

  return (
    <group 
      ref={group} 
      scale={1}
    >
      <primitive object={scene} />
    </group>
  );
}

// Custom error fallback component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <Html fullscreen>
      <div className="flex flex-col items-center justify-center h-full w-full text-white p-4 relative">
        {/* Blue gradient background */}
        <div 
          className="absolute inset-0 z-0" 
          style={{
            background: 'radial-gradient(circle, rgba(25,70,120,1) 0%, rgba(11,40,70,1) 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="z-10 flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <h3 className="text-lg font-medium mb-2">Failed to load 3D avatar</h3>
        <p className="text-sm text-center max-w-md opacity-80">{error.message}</p>
          <p className="text-xs mt-4 text-center max-w-md opacity-70">
            The interview will continue without the avatar visualization. 
            You can still participate in the interview normally.
          </p>
        </div>
      </div>
    </Html>
  );
}

interface Avatar3DProps {
  modelUrl: string;
  isSpeaking: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

export function Avatar3D({ modelUrl, isSpeaking, audioRef, className = '' }: Avatar3DProps) {
  const [modelError, setModelError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Add a retry loading function
  const retryLoading = () => {
    setModelError(null);
    setLoadAttempts(prev => prev + 1);
  };

  // Add a fallback error component
  const AvatarErrorFallback = () => (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium mb-2 text-white">Avatar Display Error</h3>
      <p className="text-sm text-white/80 mb-4">
        We encountered an issue displaying the interviewer avatar.
      </p>
      <p className="text-xs text-white/60 mb-6">
        {modelError || "Error loading 3D model"}
      </p>
      <button 
        onClick={retryLoading}
        className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 text-white"
      >
        Retry Loading Avatar
      </button>
      <p className="text-sm mt-4 text-white/80">
        The interview will continue in text-only mode.
      </p>
      </div>
    );

    return (
    <div 
      className={`avatar-container ${className}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {modelError ? (
        <AvatarErrorFallback />
      ) : (
        <Canvas
          key={`canvas-${loadAttempts}`}
          shadows
          gl={{ antialias: true }}
          camera={{ 
            position: [0, 1.65, 2.2], // Moved even further back for better framing
            fov: 22, // Even narrower field of view for tighter framing
            near: 0.1,
            far: 1000
          }}
          onError={(e) => {
            console.error("Canvas error:", e);
            setModelError("Error rendering 3D scene: " + (e instanceof Error ? e.message : "Unknown error"));
          }}
        >
          {/* Main ambient light for overall illumination */}
          <ambientLight intensity={0.8} />
          
          {/* Key light - main directional light from upper right */}
          <directionalLight 
            intensity={1.2} 
            position={[1.5, 2, 1]} 
            castShadow
          />
          
          {/* Fill light - softer light from left to reduce shadows */}
          <directionalLight 
            intensity={0.7} 
            position={[-1.5, 1.5, 1]} 
            color="#e0f0ff"
          />
          
          {/* Front light - direct light to illuminate the face */}
          <directionalLight 
            intensity={1.0} 
            position={[0, 1.65, 3]} 
            color="#ffffff"
          />
          
          {/* Rim light - subtle backlight for edge definition */}
          <directionalLight
            intensity={0.4} 
            position={[0, 1.8, -2]}
            color="#b0c4de"
          />
          
          {/* Avatar model */}
          <Suspense fallback={
            <Html center>
              <div className="text-white bg-black/50 p-3 rounded-lg flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Loading 3D model...</span>
              </div>
            </Html>
          }>
            <Model modelUrl={modelUrl} isSpeaking={isSpeaking} audioRef={audioRef} />
          </Suspense>
          
          {/* Environment and controls */}
          <Environment preset="city" />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={Math.PI / 3.2} // Slightly adjusted to keep face in view
            maxPolarAngle={Math.PI / 2.3} // Slightly adjusted to keep face in view
            minAzimuthAngle={-Math.PI / 10} // Slightly wider horizontal rotation
            maxAzimuthAngle={Math.PI / 10} // Slightly wider horizontal rotation
            enableDamping
            dampingFactor={0.1}
            rotateSpeed={0.5}
            target={new THREE.Vector3(0, 1.65, 0)} // Updated to match our camera lookAt point
          />
        </Canvas>
      )}
    </div>
  );
}

// Update the preload section to use the correct paths
try {
  useGLTF.preload('/assets/avatars/avatar_with_morphs.glb.glb');
} catch (e) {
  console.warn("Could not preload custom avatar:", e);
}

// Preload the standing animation
try {
  useGLTF.preload('/assets/avatars/standinganimation.glb');
} catch (e) {
  console.warn("Could not preload standing animation:", e);
}