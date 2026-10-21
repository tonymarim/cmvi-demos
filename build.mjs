import {build} from 'vite';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
for(const name of ['nivel','vibracao']) await build({configFile:false,root:path.join(root,'src',name),base:'./',build:{outDir:path.join(root,'docs',name),emptyOutDir:true,chunkSizeWarningLimit:6000}});
