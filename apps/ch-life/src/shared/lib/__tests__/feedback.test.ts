import { showFeedback, useFeedbackStore } from "../feedback";

describe("feedback store", () => {
  beforeEach(() => {
    useFeedbackStore.setState({ feedback: null });
  });

  it("showFeedback가 메시지와 만료 시각을 저장한다", () => {
    showFeedback({ message: "추가했습니다", tone: "info", durationMs: 3000 });
    const feedback = useFeedbackStore.getState().feedback;
    expect(feedback?.message).toBe("추가했습니다");
    expect(feedback?.tone).toBe("info");
    expect(feedback?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("stale clear는 새 피드백을 지우지 않는다", () => {
    const first = showFeedback({ message: "첫", tone: "info", durationMs: 1 });
    showFeedback({ message: "새 안내", tone: "info", durationMs: 3000 });
    useFeedbackStore.getState().clearFeedback(first.id);
    expect(useFeedbackStore.getState().feedback?.message).toBe("새 안내");
  });

  it("현재 피드백의 clear는 배너를 비운다", () => {
    const current = showFeedback({ message: "안내", tone: "info", durationMs: 1 });
    useFeedbackStore.getState().clearFeedback(current.id);
    expect(useFeedbackStore.getState().feedback).toBeNull();
  });
});
