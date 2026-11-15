import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const [{outputFiles},html,css,svg]=await Promise.all([
  build({entryPoints:['src/app.mjs'],bundle:true,write:false,format:'iife',target:'es2022',minify:true,legalComments:'none'}),
  readFile('index.html','utf8'),readFile('styles.css','utf8'),readFile('assets/icon.svg','utf8')
]);
const iconURL='data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64');
const result=html
  .replace('<link rel="stylesheet" href="./styles.css">',()=>'<style>'+css+'</style>')
  .replace('<script type="module" src="./src/app.mjs"></script>',()=>'<script type="module">'+outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>')
  .replace('<link rel="manifest" href="./manifest.webmanifest">','')
  .replaceAll('./assets/icon.svg',iconURL)
  .replace('class="brand" href="./"','class="brand" href="#"');
await mkdir('release',{recursive:true});
await writeFile('release/Sternenhafen.html',result);
console.log('Direkt spielbar: release/Sternenhafen.html ('+Math.round(Buffer.byteLength(result)/1024)+' KB)');
