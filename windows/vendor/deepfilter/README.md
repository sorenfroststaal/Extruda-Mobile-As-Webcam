# DeepFilterNet runtime

Official x64 Windows mono LADSPA plugin, version 0.5.6 (released by Rikorose/DeepFilterNet). Includes the upstream default low-latency model. No Python, remote inference, account or model download is used at runtime.

Source: https://github.com/Rikorose/DeepFilterNet/tree/v0.5.6

Binary: https://github.com/Rikorose/DeepFilterNet/releases/download/v0.5.6/deep_filter_ladspa-0.5.6-x86_64-pc-windows-msvc.dll

SHA256: `f97e34275eb884b6076a96d261683d2a43c6b2d97ddf9e346bc06f7c8057eb04`

Run `node scripts/fetch-deepfilter.mjs` before building. The build verifies this pinned checksum. Binary is distributed in release packages, not committed to Git. Use of the upstream code selects its MIT license; see LICENSE-MIT.txt. Third-party notices are retained in the application package.

ExtrudaFilter.exe hosts the plugin in a private local process, with binary PCM over inherited pipes. A Windows job terminates it if the app exits. A bounded queue and timeout stop processing and restore original audio on failure. Processing can add latency, suppress quiet speech or change voice quality; it is optional and off at launch. This is noise reduction, not an Adobe-equivalent voice restoration guarantee.
