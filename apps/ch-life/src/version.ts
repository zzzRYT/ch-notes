/**
 * OTA 발행 번호. 스토어 버전(`app.config.ts`의 `version`)에 이어 붙여
 * 설정 화면에 `1.0.2+3`처럼 보여 준다.
 *
 * - 같은 스토어 버전에 OTA 번들을 낼 때마다 **+1** 하고 그 커밋을 배포한다.
 * - 새 스토어 버전을 낼 때 **0으로 되돌린다.**
 *
 * `app.config.ts`의 `version` 자체에는 넣지 않는다 — iOS
 * `CFBundleShortVersionString`은 숫자와 점만 허용하고, hot-updater가 겨냥하는
 * `--target-app-version`도 그 값에서 나오기 때문이다(`wiki/git.md` 5절).
 */
export const OTA_RELEASE = 0;
