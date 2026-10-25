import * as tf from '@tensorflow/tfjs';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { decode as jpegDecode } from 'jpeg-js';

import type { HazardType } from '@/types/report';
import { labelToHazardType } from '@/data/hazardLabels';

export { labelToHazardType };

/**
 * On-device hazard classifier backed by a Teachable Machine image model.
 *
 * HONEST SCOPE: this runs a real TensorFlow.js model the user trained on
 * Teachable Machine (https://teachablemachine.withgoogle.com). It only knows the
 * classes that model was trained on, and it returns a *suggestion* with a
 * confidence score that the user can always override. It is not a general hazard
 * detector and makes mistakes — the UI reflects that.
 *
 * We use the pure-JS tfjs CPU backend (no native modules) so it works in managed
 * Expo + the New Architecture. Inference is a bit slower than a GPU backend but
 * runs entirely on-device; the model is fetched once from the Teachable Machine
 * "shareable link" URL and cached in memory.
 */

export interface Prediction {
  /** Raw class label from the trained model, e.g. "Pothole". */
  label: string;
  /** 0..1 confidence. */
  confidence: number;
  /** Mapped app hazard type, if the label matches one. */
  hazardType?: HazardType;
}

export interface ClassifyResult {
  ok: boolean;
  /** Top predictions, highest confidence first. */
  predictions: Prediction[];
  /** Reason when ok === false. */
  reason?: 'no_model' | 'load_failed' | 'inference_failed';
  message?: string;
}

const TM_INPUT_SIZE = 224;

let tfReady = false;
let cachedModel: tf.LayersModel | null = null;
let cachedModelUrl: string | null = null;
let cachedLabels: string[] = [];

async function ensureTf() {
  if (!tfReady) {
    await tf.ready();
    tfReady = true;
  }
}

/** Normalize a Teachable Machine shareable URL to the model.json / metadata.json base. */
function tmBase(url: string): string {
  return url.replace(/\/+$/, '').replace(/\/model\.json$/, '');
}

async function loadModel(modelUrl: string): Promise<void> {
  if (cachedModel && cachedModelUrl === modelUrl) return;
  const base = tmBase(modelUrl);
  const model = await tf.loadLayersModel(`${base}/model.json`);
  // Teachable Machine ships class labels in metadata.json.
  let labels: string[] = [];
  try {
    const meta = await fetch(`${base}/metadata.json`).then((r) => r.json());
    labels = meta.labels ?? [];
  } catch {
    labels = [];
  }
  cachedModel = model;
  cachedModelUrl = modelUrl;
  cachedLabels = labels;
}

/** Decode + resize a local photo URI into a [1,224,224,3] normalized tensor. */
async function imageToTensor(uri: string): Promise<tf.Tensor4D> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: TM_INPUT_SIZE, height: TM_INPUT_SIZE } }],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );
  const b64 = manipulated.base64!;
  const raw = tf.util.encodeString(b64, 'base64').buffer;
  const { width, height, data } = jpegDecode(new Uint8Array(raw), { useTArray: true });
  // data is RGBA; drop alpha and normalize to [-1, 1] to match Teachable Machine.
  const rgb = new Float32Array(width * height * 3);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    rgb[j] = data[i] / 127.5 - 1;
    rgb[j + 1] = data[i + 1] / 127.5 - 1;
    rgb[j + 2] = data[i + 2] / 127.5 - 1;
  }
  return tf.tensor4d(rgb, [1, height, width, 3]);
}

/**
 * Classify a photo. Returns an honest result: when no model URL is configured, or
 * the model can't load, or inference fails, `ok` is false with a reason — the UI
 * then falls back to manual selection.
 */
export async function classifyPhoto(uri: string, modelUrl?: string): Promise<ClassifyResult> {
  if (!modelUrl) return { ok: false, predictions: [], reason: 'no_model' };
  try {
    await ensureTf();
    await loadModel(modelUrl);
  } catch (e) {
    return { ok: false, predictions: [], reason: 'load_failed', message: String(e) };
  }
  let input: tf.Tensor4D | null = null;
  try {
    input = await imageToTensor(uri);
    const logits = cachedModel!.predict(input) as tf.Tensor;
    const probs = Array.from(await logits.data());
    logits.dispose();
    const preds: Prediction[] = probs
      .map((confidence, i) => {
        const label = cachedLabels[i] ?? `class ${i}`;
        return { label, confidence, hazardType: labelToHazardType(label) };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    return { ok: true, predictions: preds };
  } catch (e) {
    return { ok: false, predictions: [], reason: 'inference_failed', message: String(e) };
  } finally {
    input?.dispose();
  }
}
