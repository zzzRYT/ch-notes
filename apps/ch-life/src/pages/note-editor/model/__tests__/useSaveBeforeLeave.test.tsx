import React from "react";
import { act, create } from "react-test-renderer";
import { useSaveBeforeLeave } from "../useSaveBeforeLeave";

type Listener = (e: { preventDefault: () => void; data: { action: string } }) => void;
const mockNav = {
  listener: null as Listener | null,
  dispatch: jest.fn(),
  addListener: (_: string, fn: Listener) => {
    mockNav.listener = fn;
    return () => {
      mockNav.listener = null;
    };
  },
};
jest.mock("expo-router", () => ({ useNavigation: () => mockNav }));

function Probe(p: { save: () => Promise<void>; onFail: (e: unknown) => void; skip: { current: boolean } }) {
  useSaveBeforeLeave(p.save, p.onFail, p.skip);
  return null;
}
// 이동 시도: preventDefault가 불렸는지 돌려준다.
const leave = () => {
  const e = { preventDefault: jest.fn(), data: { action: "BACK" } };
  mockNav.listener!(e);
  return e.preventDefault.mock.calls.length > 0;
};
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });
const mount = (props: React.ComponentProps<typeof Probe>) => {
  let r!: ReturnType<typeof create>;
  act(() => { r = create(<Probe {...props} />); });
  return r;
};

beforeEach(() => mockNav.dispatch.mockClear());

describe("useSaveBeforeLeave", () => {
  it("이동을 막고 저장이 끝난 뒤에 원래 이동을 이어 간다", async () => {
    let done!: () => void;
    const save = jest.fn(() => new Promise<void>((res) => { done = res; }));
    mount({ save, onFail: jest.fn(), skip: { current: false } });

    expect(leave()).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
    expect(mockNav.dispatch).not.toHaveBeenCalled(); // 저장 전에는 떠나지 않는다
    await act(async () => { done(); });
    await flush();
    expect(mockNav.dispatch).toHaveBeenCalledWith("BACK");
  });

  it("저장이 실패하면 이동하지 않고 실패를 알린다", async () => {
    const err = new Error("db");
    const onFail = jest.fn();
    mount({ save: () => Promise.reject(err), onFail, skip: { current: false } });
    leave();
    await flush();
    expect(mockNav.dispatch).not.toHaveBeenCalled();
    expect(onFail).toHaveBeenCalledWith(err);
  });

  it("실패한 뒤 다시 시도하면 다시 저장한다", async () => {
    const save = jest.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue(undefined);
    mount({ save, onFail: jest.fn(), skip: { current: false } });
    leave();
    await flush();
    leave();
    await flush();
    expect(save).toHaveBeenCalledTimes(2);
    expect(mockNav.dispatch).toHaveBeenCalledTimes(1);
  });

  it("저장 중 연타해도 한 번만 저장한다", async () => {
    let done!: () => void;
    const save = jest.fn(() => new Promise<void>((res) => { done = res; }));
    mount({ save, onFail: jest.fn(), skip: { current: false } });
    leave();
    expect(leave()).toBe(true); // 막기는 하되
    expect(save).toHaveBeenCalledTimes(1); // 다시 저장하지 않는다
    await act(async () => { done(); });
    await flush();
    expect(mockNav.dispatch).toHaveBeenCalledTimes(1);
  });

  it("삭제 뒤처럼 skip이면 가로채지 않는다 — 저장하지 않는다", () => {
    const save = jest.fn();
    mount({ save, onFail: jest.fn(), skip: { current: true } });
    expect(leave()).toBe(false);
    expect(save).not.toHaveBeenCalled();
  });

  it("이동을 이어 가는 dispatch는 다시 가로채지 않는다", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    mount({ save, onFail: jest.fn(), skip: { current: false } });
    mockNav.dispatch.mockImplementationOnce(() => { expect(leave()).toBe(false); });
    leave();
    await flush();
    expect(save).toHaveBeenCalledTimes(1);
    expect(mockNav.dispatch).toHaveBeenCalledTimes(1);
  });
});
