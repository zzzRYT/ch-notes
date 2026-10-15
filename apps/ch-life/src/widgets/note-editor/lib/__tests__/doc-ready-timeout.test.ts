import { createDocReadyTimeout } from "../doc-ready-timeout";

jest.useFakeTimers();

describe("createDocReadyTimeout", () => {
  it("기한 안에 ready가 안 오면 onTimeout을 한 번 호출한다", () => {
    const onTimeout = jest.fn();
    const t = createDocReadyTimeout(8000, onTimeout);
    t.start();
    jest.advanceTimersByTime(7999);
    expect(onTimeout).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(8000);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("ready가 먼저 오면 onTimeout을 호출하지 않는다", () => {
    const onTimeout = jest.fn();
    const t = createDocReadyTimeout(8000, onTimeout);
    t.start();
    jest.advanceTimersByTime(1000);
    t.ready();
    jest.advanceTimersByTime(10000);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("start를 다시 부르면 처음부터 다시 센다", () => {
    const onTimeout = jest.fn();
    const t = createDocReadyTimeout(8000, onTimeout);
    t.start();
    jest.advanceTimersByTime(7000);
    t.start();
    jest.advanceTimersByTime(7000);
    expect(onTimeout).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("dispose 뒤에는 onTimeout을 호출하지 않는다", () => {
    const onTimeout = jest.fn();
    const t = createDocReadyTimeout(8000, onTimeout);
    t.start();
    t.dispose();
    jest.advanceTimersByTime(20000);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("타임아웃 뒤에 ready가 와도 onTimeout은 한 번뿐이다", () => {
    const onTimeout = jest.fn();
    const t = createDocReadyTimeout(8000, onTimeout);
    t.start();
    jest.advanceTimersByTime(8000);
    t.ready();
    jest.advanceTimersByTime(8000);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
