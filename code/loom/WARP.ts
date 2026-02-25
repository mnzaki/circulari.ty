/**
 * Circulari.ty Code WARP - Architecture Definition
 *
 * This WARP imports the o19 foundframe core and defines app-level spirals.
 * The loom generates app-specific hookups and configurations.
 */

import loom from '@o19/spire-loom';
import { appHookupTreadle } from '../../o19/loom/treadles/app-hookups.js';

export * from '../../o19/loom/media.js';
export * from '../../o19/loom/bookmark.js';
export * from '../../o19/loom/post.js';
export * from '../../o19/loom/person.js';
export * from '../../o19/loom/conversation.js';
export * from '../../o19/loom/device.js';
export * from '../../o19/loom/node.js';
export * from '../../o19/loom/pkb.js';

// ============================================================================
// App: DearDiary
// ============================================================================

/**
 * DearDiary - Personal diary application
 * Path: code/apps/DearDiary
 *
 * Already integrated with o19-foundframe-tauri manually.
 * This spiral applies hookups for spire-generated code.
 */
export const deardiary = loom.spiral.tauri.app().tieup({
  treadles: [
    {
      treadle: appHookupTreadle,
      warpData: {
        appName: 'DearDiary',
        template: 'svelte-kit'
      }
    }
  ]
});
deardiary.name = 'DearDiary';

// ============================================================================
// Future Apps
// ============================================================================

/**
 * MeStreamm - Media streaming app
 * Path: code/apps/MeStreamm
 */
// export const mestreamm = loom.spiral.tauri.app()...

export default loom;
