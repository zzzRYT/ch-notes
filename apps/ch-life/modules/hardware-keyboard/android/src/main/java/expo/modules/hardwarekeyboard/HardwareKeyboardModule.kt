package expo.modules.hardwarekeyboard

import android.app.Activity
import android.view.InputDevice
import android.view.KeyEvent
import android.view.Window
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// 물리 키보드의 키 입력만 JS로 알린다. RN의 TextInput.onKeyPress는 Android에서
// 소프트 키보드(IME) 입력만 받으므로 Window.Callback을 감싸 하드웨어 이벤트를 본다.
class HardwareKeyboardModule : Module() {
  private var observing = false
  private var wrappedActivity: Activity? = null
  private var wrapper: Window.Callback? = null
  private var original: Window.Callback? = null

  override fun definition() = ModuleDefinition {
    Name("HardwareKeyboard")
    Events("onKeyPress")

    OnStartObserving {
      observing = true
      attach()
    }
    // 액티비티가 재생성(테마 변경 등)되면 새 창에 다시 건다.
    OnActivityEntersForeground { if (observing) attach() }
    OnStopObserving {
      observing = false
      detach()
    }
    OnDestroy { detach() }
  }

  private fun attach() {
    val activity = appContext.currentActivity ?: return
    if (wrappedActivity === activity) return
    detach()
    activity.runOnUiThread {
      val base = activity.window.callback ?: return@runOnUiThread
      val callback = object : Window.Callback by base {
        override fun dispatchKeyEvent(event: KeyEvent): Boolean {
          if (isPhysicalKeyDown(event)) sendEvent("onKeyPress")
          return base.dispatchKeyEvent(event)
        }
      }
      wrappedActivity = activity
      original = base
      wrapper = callback
      activity.window.callback = callback
    }
  }

  private fun detach() {
    val activity = wrappedActivity ?: return
    val base = original ?: return
    val mine = wrapper
    wrappedActivity = null
    original = null
    wrapper = null
    // ponytail: 우리 위에 다른 래퍼가 올라탔으면 건드리지 않는다 — 그 경우 그쪽이 base를 붙잡고 있다.
    activity.runOnUiThread {
      if (activity.window.callback === mine) activity.window.callback = base
    }
  }

  // IME가 합성한 키 이벤트는 device가 null(deviceId -1)이거나 virtual이다.
  private fun isPhysicalKeyDown(event: KeyEvent): Boolean {
    if (event.action != KeyEvent.ACTION_DOWN) return false
    val device = event.device ?: return false
    return !device.isVirtual && device.keyboardType == InputDevice.KEYBOARD_TYPE_ALPHABETIC
  }
}
