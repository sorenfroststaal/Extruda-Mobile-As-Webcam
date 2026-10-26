# Security review — 26 October 2026

Target: extruda - mobile as webcam 0.12.0, commit `7523945`.

This is a source review, dependency advisory check, installed-file permission check, live HTTP-header check and isolated local regression test. It is not an independent penetration test, native-code fuzzing campaign or security certification. No production load/attack test was performed. Application code, deployments and installed software were not changed. This report is local and has not been published to GitHub.

## Findings at a glance

| ID | Finding | Evidence / classification | Priority |
|---|---|---|---|
| A1 | Vulnerable undici version in development tooling | Confirmed affected version; exploitation in our workflow not demonstrated | Update soon |
| A2 | Shared pairing quota can be consumed by unrelated clients | Reproduced against an in-memory AbuseGuard, not production | Medium, availability |
| B1 | Hosted phone client remains a high-impact trust boundary | Design risk, requires hosting/deployment compromise | Protect deployment access |
| B2 | DeepFilterNet helper is a process boundary, not a permission sandbox | Confirmed missing restricted token/AppContainer; no native exploit demonstrated | Medium hardening |
| B3 | Local frames and recordings have a wider trust boundary than the paired phone | Confirmed design/access model | Medium privacy |
| C1 | Cross-user frame isolation needs a dedicated test | Potential issue from source; exploit not confirmed | Investigate before shared-PC rollout |

No unauthenticated remote route to start camera/microphone or write an arbitrary PC file was identified in this review. That is a bounded review result, not proof of absence.

## A1 — Three dependency advisories in development tooling

`pnpm-lock.yaml:570` pins undici 7.29.1, reached through `wrangler -> miniflare -> undici` (`pnpm-lock.yaml:952`). A current `pnpm audit --json` reports:

- High: CVE-2026-109869 / [GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c): malformed content-encoding responses can terminate a Node process.
- Moderate: CVE-2026-109924 / [GHSA-4qv8-2p9j-2685](https://github.com/advisories/GHSA-4qv8-2p9j-2685): unbounded EventSource parser memory use.
- Moderate: CVE-2026-109841 / [GHSA-f72v-6w45-q472](https://github.com/advisories/GHSA-f72v-6w45-q472): mixed-case SRI algorithm handling can skip integrity verification.

Affected version is confirmed. The scanner's high severity describes the library advisory; this does not establish a high-severity remotely exploitable defect in the shipped webcam app. These are development dependencies. The Windows release package does not bundle this Node dependency tree, and Cloudflare production uses its own runtime. Exploit reachability through our specific Miniflare/Wrangler usage was not demonstrated.

Remediation: update the toolchain so the resolved undici is at least 7.30.1 (or another patched supported branch), regenerate/review the lockfile, rerun audit and local deployment tests. Do not blindly force incompatible transitive major versions. The earlier report's zero-advisory result is historical and no longer describes the current scan.

## A2 — Global pairing budget is shared with unauthenticated traffic

`src/worker.js:64` calls one global guard before role authentication. `src/worker.js:173` caps all sources together at 120 creations and 600 requests per minute, alongside per-source caps. A non-browser client can supply an allowed Origin header; Origin is a browser protection, not client authentication.

Safe reproduction: instantiate AbuseGuard with in-memory storage, simulate 120 creates across six documentation-only IP addresses, then request a create from a different simulated legitimate IP. The 120 creates were accepted and the unrelated request returned 429. No real addresses were spoofed, no production requests were sent and no Cloudflare quota was deliberately consumed.

Consequence: distributed traffic can deny new pairings for the current budget window. Existing direct WebRTC media does not need to stop simply because new room creation is limited. This does not reveal media, decrypt sessions or bypass PC approval.

Remediation: edge-level bot/rate controls, fairer quota allocation and separate budgets for invalid/new traffic versus legitimate session activity. Keep a global safety cap but do not rely on it as the sole abuse control. Cloudflare account-side rules and quota configuration were not audited, so they may provide additional protection not visible here.

## B1 — Compromised phone hosting can change the endpoint itself

The Windows UI is local under Program Files, and native messages require the exact `https://app.extruda.local` origin (`windows/app/main.cpp:47`, `:82`, `:112`). The phone still downloads executable client code from the Cloudflare site.

A person who compromises the authorized deployment path could replace the phone client and misuse camera/microphone access that the browser/user grants to that origin. Transport encryption cannot protect plaintext from a compromised endpoint. This requires control of a trusted component; it is not a demonstrated anonymous-internet attack.

Remediation: least-privilege deployment access, protected accounts/release workflows and reviewable release provenance. Account MFA, token scopes and GitHub branch protection were not inspected and must not be assumed absent.

## B2 — Audio helper inherits ordinary user authority

`windows/app/AudioFilter.h:66` configures a kill-on-close job, and `:67` starts the helper with normal process credentials. The inherited-handle list is restricted. `windows/app/FilterHost.cpp:22` loads the pinned DLL from the executable directory with a restricted DLL search path. Input blocks and attenuation are bounded and validated.

These are useful lifecycle and input protections, but no restricted token or AppContainer prevents the helper from accessing user files/network if arbitrary code were to execute inside it. A job object alone is not a security sandbox. The helper's normal code uses local PCM pipes and an embedded model; no cloud inference is required.

No exploitable DeepFilterNet memory-corruption bug was identified or reproduced. The third-party native binary and all statically included Rust dependencies were not comprehensively scanned, rebuilt or fuzzed. The pinned SHA256 establishes which binary is used; it does not establish that the binary is vulnerability-free.

Remediation: evaluate a restricted-token/AppContainer helper with an explicit read/IPC allowlist, no unnecessary network authority, memory/CPU limits, and a native dependency inventory/advisory process. Compatibility and actual restriction effectiveness require tests.

## B3 — Local media is accessible according to Windows/file permissions

- `windows/app/FrameWriter.h:26` allows the current user and SYSTEM and grants LocalService read access. Frames use a file-backed mapping under ProgramData (`:35`), with delete-on-close and best-effort clearing. It is not anonymous RAM only, nor encrypted-at-rest media transport.
- Ordinary software with appropriate access to the virtual camera/microphone can capture their output. PC pairing approval is not an application-specific allowlist for Teams or Zoom.
- `windows/app/RecordingFile.h:45` creates a `.partial` file in the selected directory using that directory's access model. Interrupted partial files may remain. Saving in OneDrive/shared folders may synchronize or expose the recording through those services' permissions.
- The optional listening test is bounded and explicitly started, uses application memory and creates no test file. Releasing memory does not promise forensic erasure of RAM/pagefiles.

This does not show that every Windows account can read the frame file. Installed Program Files permissions on this PC gave ordinary Users read/execute access, not application-file write access.

Remediation: keep app-specific output selection clear, stop media explicitly, offer local/private save locations, and evaluate a narrower shared-memory broker. Limit sensitive media retention. Do not claim that deleting a file securely erases all disk traces.

## C1 — Potential cross-user frame reuse; not yet verified

`windows/camera/MediaSource.cpp:16` receives a frame path from camera attributes. `windows/camera/FrameGenerator.cpp:16` limits it to the shared ProgramData directory and checks size/header, but does not itself verify that the file owner matches the camera client's Windows user. Every legitimate frame file grants LocalService read access. On this PC the parent directory inherited Users read/list and write permissions; actual frame files have protected DACLs.

Hypothesis: on a multi-user PC, a second user might be able to reference another user's frame path through their own instance of the globally registered camera source, if Windows Frame Server does not independently block that route. The source review alone cannot establish Frame Server's impersonation/access behavior, so this is not a confirmed cross-user video leak.

Required next test: two non-administrator accounts and a controlled synthetic frame stream, checking whether account B can obtain account A's frames and whether the service opens files as LocalService or the caller. No extra account was created, no permissions were changed and no other user's media was accessed during this review.

If reproduced: bind transport authorization to the originating user/client, validate ownership with the actual service/caller access model, and use a narrowly authorized broker rather than trusting a shared path prefix.

## Controls checked and passing

- Random room IDs, separate role tokens and one-use role authorization.
- AES-GCM signalling; WebRTC transport; PC approval bound to a phone nonce and a six-digit comparison code.
- QR bearer material removed from the visible URL; no-referrer policy.
- Microphone defaults off and requires phone-side user action/permission.
- Fixed native origin, local UI, blocked external top-level navigation and denied desktop camera/microphone permission requests.
- Bounded request bodies, signalling, direct control messages, audio blocks, pending filter queues and recording writes.
- No peer-supplied arbitrary recording path; a native save dialog selects the target. Normal recording commits replace the target only at finalization.
- Live HTTP checks: CSP, frame-ancestors none, no-referrer, nosniff, self-only camera/microphone policy and no-store.
- DeepFilterNet checksum pinning and restricted child-handle inheritance.
- All 66 automated tests passed against an isolated server on localhost:8790. No physical camera/microphone test, tone injection, production flood or live-session interruption was performed.

## Scope limits and deferred item

No native fuzzing, independent exploit development, full installed-driver audit, network packet capture, hardware/iOS/Android security certification or account-control audit was performed. WebView2 155.0.4283.62 was observed; this review did not establish its current patch status. Optional third-party virtual-audio drivers are separate trust boundaries.

Authenticode still reports NotSigned for the installed app. This remains a distribution/provenance risk; digital signing was explicitly deferred by the user and no signing work was attempted here.

References: [Microsoft WebView2 security guidance](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/security), the three GitHub advisories above, and the local source references in each finding.

Recommended order: update development dependencies; improve abuse isolation; verify cross-user frame isolation before shared-PC deployment; then restrict native helper authority and improve local-media isolation. Keep hosting and release access protected throughout.

## Remediation — 0.13.0

A1: toolchain updated; undici pinned to 7.30.1; current package audit reports zero advisories. A2: global consumable quota removed in favor of per-source objects with IPv6 /64 grouping; unrelated-source regression test passes. B2: capability-free AppContainer, job limits and no unsandboxed fallback; synthetic processing, private-file denial and TCP-denial probes pass. B3: private recording defaults/ACLs, no shared write handle, storage warning and low-space guard; frames moved into private per-session directories. C1: camera transport now requires a random per-session 256-bit capability and a new COM component; missing key is rejected, wrong key produces black, correct key produces expected pixels. This removes the path-only authorization weakness. A two-real-account test was not performed and is not claimed. B1 remains a deployment/account trust boundary; CI is added but does not replace account protection. Signing remains deferred.
