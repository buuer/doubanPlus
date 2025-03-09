firefox 和 chrome 在 manifest v3 的支持上有一些差异，打包时要注意

firefox 打包需更改 `manifest.json` 

```json
"background": {
    "service_worker": "background.js",  // chrome 
    "scripts": ["background.js"]        // firefox
},
```
