
const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
};

const base64Encode = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    if (typeof btoa === 'function') {
        return btoa(binary);
    }
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(buffer).toString('base64');
    }
    return '';
};

// Enhanced generator with frequency sliding and phase accumulation
export const generateTone = (frequency = 440, duration = 0.5, type = 'sine', volume = 0.5) => {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const data = new Float32Array(numSamples);

    let phase = 0;

    for (let i = 0; i < numSamples; i++) {
        // Calculate current frequency (support static or sliding)
        let currentFreq = frequency;
        if (typeof frequency === 'object') {
            const progress = i / numSamples;
            // Linear slide from start to end
            currentFreq = frequency.start + (frequency.end - frequency.start) * progress;
        }

        // Accumulate phase
        phase += currentFreq / sampleRate;
        if (phase > 1) phase -= 1; // Keep precision high

        let sample = 0;
        const t = phase; // Normalized 0-1 cycle

        if (type === 'sine') {
            sample = Math.sin(2 * Math.PI * t);
        } else if (type === 'square') {
            sample = t < 0.5 ? 1 : -1;
            sample *= 0.5;
        } else if (type === 'sawtooth') {
            sample = 2 * (t - 0.5);
            sample *= 0.5;
        } else if (type === 'triangle') {
            sample = 1 - 4 * Math.abs(t - 0.5);
        } else if (type === 'noise') {
            sample = (Math.random() * 2 - 1) * 0.5;
        }

        // Envelope (Attack - Sustain - Decay)
        const attackIdx = Math.floor(sampleRate * 0.01); // 10ms attack
        const decayIdx = numSamples - attackIdx;

        let envelope = 1;
        if (i < attackIdx) {
            envelope = i / attackIdx;
        } else {
            // Quadratic decay for smooth fade out
            const decayProgress = (i - attackIdx) / decayIdx;
            envelope = Math.pow(1 - decayProgress, 2);
        }

        data[i] = sample * envelope * volume;
    }

    // Create WAV file
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Write PCM samples
    floatTo16BitPCM(view, 44, data);

    const base64 = base64Encode(buffer);
    return `data:audio/wav;base64,${base64}`;
};
