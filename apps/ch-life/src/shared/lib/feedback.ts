import { create } from "zustand";

export type FeedbackAction = {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void | Promise<void>;
};

export type Feedback = {
  id: number;
  message: string;
  tone: "info" | "error";
  expiresAt: number;
  action?: FeedbackAction;
};

export type FeedbackInput = Pick<Feedback, "message" | "tone"> & {
  durationMs: number;
  action?: FeedbackAction;
};

type FeedbackState = {
  feedback: Feedback | null;
  showFeedback: (input: FeedbackInput) => Feedback;
  clearFeedback: (id: number) => void;
};

let feedbackSequence = 0;

export const useFeedbackStore = create<FeedbackState>((set) => ({
  feedback: null,
  showFeedback: (input) => {
    const feedback: Feedback = {
      id: ++feedbackSequence,
      message: input.message,
      tone: input.tone,
      action: input.action,
      expiresAt: Date.now() + input.durationMs,
    };
    set({ feedback });
    return feedback;
  },
  clearFeedback: (id) =>
    set((state) => (state.feedback?.id === id ? { feedback: null } : state)),
}));

export function showFeedback(input: FeedbackInput): Feedback {
  return useFeedbackStore.getState().showFeedback(input);
}
