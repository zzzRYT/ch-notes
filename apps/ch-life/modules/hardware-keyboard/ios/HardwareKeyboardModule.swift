import ExpoModulesCore
import GameController

// 물리 키보드의 키 입력만 JS로 알린다. 소프트 키보드 입력은 GCKeyboard를 거치지 않는다.
public class HardwareKeyboardModule: Module {
  private var observers: [NSObjectProtocol] = []

  public func definition() -> ModuleDefinition {
    Name("HardwareKeyboard")
    Events("onKeyPress")

    OnStartObserving {
      self.attach(GCKeyboard.coalesced)
      // 새로 연결된 키보드는 새 인스턴스라 핸들러를 다시 건다.
      self.observers = [
        NotificationCenter.default.addObserver(
          forName: .GCKeyboardDidConnect, object: nil, queue: .main
        ) { [weak self] note in
          self?.attach(note.object as? GCKeyboard ?? GCKeyboard.coalesced)
        }
      ]
    }

    OnStopObserving {
      self.observers.forEach(NotificationCenter.default.removeObserver)
      self.observers.removeAll()
      GCKeyboard.coalesced?.keyboardInput?.keyChangedHandler = nil
    }
  }

  private func attach(_ keyboard: GCKeyboard?) {
    keyboard?.keyboardInput?.keyChangedHandler = { [weak self] _, _, _, pressed in
      if pressed { self?.sendEvent("onKeyPress") }
    }
  }
}
