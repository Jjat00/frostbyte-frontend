import { useState, useRef, useCallback, useEffect } from "react";
import { env } from "@/config/env";
import { ENDPOINTS } from "@/services/api/endpoints";

const STATUS = { IDLE: "idle", RECORDING: "recording", TRANSCRIBING: "transcribing" };
const MAX_RECORDING_SECONDS = 30;

export default function useAudioRecorder() {
  const [recordingStatus, setRecordingStatus] = useState(STATUS.IDLE);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const isRecording = recordingStatus === STATUS.RECORDING;
  const isTranscribing = recordingStatus === STATUS.TRANSCRIBING;

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        clearInterval(timerRef.current);
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) {
          setError("No se grabó audio.");
          setRecordingStatus(STATUS.IDLE);
          return;
        }

        setRecordingStatus(STATUS.TRANSCRIBING);

        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");

          const res = await fetch(
            `${env.API_BASE_URL}${ENDPOINTS.AI_VOICE_TRANSCRIBE}`,
            { method: "POST", body: formData }
          );
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || "Error al transcribir");

          setTranscript(data.text || "");
        } catch (err) {
          setError(err.message || "Error al transcribir el audio.");
        } finally {
          setRecordingStatus(STATUS.IDLE);
        }
      };

      mediaRecorder.start();
      setRecordingStatus(STATUS.RECORDING);
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => {
          if (s + 1 >= MAX_RECORDING_SECONDS) {
            mediaRecorderRef.current?.stop();
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("No se pudo acceder al micrófono.");
      setRecordingStatus(STATUS.IDLE);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    elapsedSeconds,
    maxSeconds: MAX_RECORDING_SECONDS,
    startRecording,
    stopRecording,
  };
}
