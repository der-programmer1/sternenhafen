import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of ['index.html','styles.css','manifest.webmanifest','.nojekyll'])await copyFile(file,'dist/'+file);
await cp('src','dist/src',{recursive:true});
await cp('assets','dist/assets',{recursive:true});
console.log('Sternenhafen gebaut: dist/ (statisch, ohne Laufzeitabhängigkeiten)');
