# Native device verification checklist

Status: NOT RUN on Android/iOS. Record OS, device, build type, app version, date and results.

The mock OTP reader requires a private interactive terminal with HOST=127.0.0.1 in its
environment. A LAN-hosted backend uses HOST=0.0.0.0. Verify/document this private CLI
configuration path as part of the device check; it has not been tested on a phone.
Read PHASE_1_RUNBOOK.md for current CMD/PowerShell retrieval instructions.

1. Start the corresponding backend with HOST=0.0.0.0 on a trusted development network.
   Set EXPO_PUBLIC_API_URL to the computer's LAN address and port 4001 or 4002; restart
   Expo. A phone's 127.0.0.1 points at the phone. Android emulator may use 10.0.2.2;
   iOS simulator/build checks need macOS and its toolchain.
2. Use Expo Go compatible with SDK 57. Stop old Metro servers, then run
   npm.cmd run dev -- --clear and scan the new QR code, or build with the platform toolchain. Keep
   customer/worker package IDs and API addresses separate.
3. Check keyboard, accessibility labels, font scaling, invalid phone, disabled/loading
   buttons, offline/timeout errors. Delivery is mock-only; use the matching backend's
   auth:mock-otp command with the displayed development challenge ID.
4. Check correct/incorrect/expired/used code, attempt limit and resend countdown.
5. Confirm customer home and worker pending onboarding; worker is not approved.
6. Relaunch native app: SecureStore should restore and rotate refresh credentials.
   Confirm ordinary app storage and logs contain no tokens. Web reload must require login.
7. Test background/foreground, terminate/relaunch and network changes. Valid sessions
   recover; revoked/expired sessions return to sign-in. Transient network failures must
   not erase otherwise valid native refresh credentials.
8. Sign out and relaunch: local credential is gone and server access is rejected.
   Sign out all devices for one role; the same phone's other role remains independent.
9. Test device lock and uninstall/reinstall. SecureStore persistence/backup behavior varies
   by platform; do not assume uninstall is server logout.
10. Check admin portal on mobile Safari/Chrome: password alone cannot reveal overview,
    TOTP is required, expiry/sign-out work. HTTPS Secure-cookie verification remains a
    future approved environment check.

Do not record real OTPs, passwords, TOTP seeds, tokens or DB URLs in evidence.
