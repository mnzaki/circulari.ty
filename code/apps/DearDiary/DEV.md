# Dev

## Debugging tokio crashes

This will build an android build with tokio tracing feature and a console
subscriber over the network from the mobile device. Look at the output of the
`debug` package in the turbo interface, that's `adb logcat`. And `tokio-console`
is running from the `android-activities` package.

```sh
cd circulari.ty
pnpm DearDiary:android:tokio_debug
```
