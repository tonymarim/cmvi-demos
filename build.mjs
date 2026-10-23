import {build} from 'vite';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {copyFile,mkdir} from 'node:fs/promises';
const root=path.dirname(fileURLToPath(import.meta.url));
for(const name of ['nivel','vibracao']) await build({configFile:false,root:path.join(root,'src',name),base:'./',build:{outDir:path.join(root,'docs',name),emptyOutDir:true,chunkSizeWarningLimit:6000}});
await build({configFile:false,root:path.join(root,'src/n2/web'),base:'./',define:{'import.meta.env.VITE_BROWSER_DEMO':'"true"'},build:{outDir:path.join(root,'docs/n2'),emptyOutDir:true,chunkSizeWarningLimit:7000}});
await mkdir(path.join(root,'docs/n2/licenses'),{recursive:true});
await copyFile(path.join(root,'node_modules/@babylonjs/core/license.md'),path.join(root,'docs/n2/licenses/babylon.md'));
