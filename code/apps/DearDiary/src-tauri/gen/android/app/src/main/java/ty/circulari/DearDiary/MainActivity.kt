package ty.circulari.DearDiary

import ty.circulari.o19.ffi.initRustlsPlatformVerifier

import android.os.Bundle
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    initRustlsPlatformVerifier(this)
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }
}