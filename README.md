# electron-vite-experiment

Fiddling with electron and vite. Basic ideas are from https://github.com/cawa-93/vite-electron-builder.

```sh
# development
pnpm i
npm run dev

# package and run
npm run build
npm run package
./build/electron-vite-experiment-0.0.0.AppImage
```

![image](https://user-images.githubusercontent.com/4232207/190849029-d6f91f8d-b419-4fbd-934f-4d03585c29d5.png)

## todo

- [x] preload script
- [x] package application
- [ ] write as vite plugin using vavite multibuild https://github.com/cyco130/vavite
