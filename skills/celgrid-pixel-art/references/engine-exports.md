# Lossless Game Engine Export Recipes

Every `celgrid_export` call returns a `pack_zip` download containing lossless PNGs plus ready-to-import metadata for four target engines. Always keep nearest-neighbor / point texture filtering enabled so 1:1 pixels stay razor sharp at integer zoom levels.

## Godot 4
- Unzip `pack.zip` into your Godot project `res://assets/<sprite>/`.
- Use the bundled `animation.tres` (`SpriteFrames`) and `sprite.tscn` (`AnimatedSprite2D`), which pre-configure `texture_filter = 1` (Nearest) and frame durations matching the asset FPS.
- In Project Settings -> Rendering -> Textures -> Canvas Textures -> Default Texture Filter, set **Nearest** for crisp 2D pixel games.

## Phaser 3 (HTML5 / TypeScript / JavaScript)
- Copy `spritesheet.png` (or `sprite.png`), `atlas.json`, and `phaser-animations.json` into `public/assets/`.
- Configure your `Phaser.Game` with crisp pixel rendering:
  ```js
  const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    zoom: 4
  };
  ```
- Load in `preload()` with `this.load.aseprite("hero", "assets/knight_walk.png", "assets/knight_walk.atlas.json")` or standard atlas loader, then call `this.anims.createFromAseprite("hero")`.

## Unity 2D
- Drop the PNG spritesheet and bundled `UnityCelgridImporter.cs.txt` (rename to `.cs` inside `Assets/Editor/`) into your Unity project.
- The importer enforces `FilterMode.Point`, `TextureImporterCompression.Uncompressed`, exact `Pixels Per Unit`, and clean frame slicing with aligned pivots so zero bilinear blur or texture bleeding occurs.

## Aseprite
- Open the bundled `RGBA8888` spritesheet PNG and Aseprite JSON (`frameTags`, per-frame `duration` in ms, pivot metadata) directly in Aseprite or edit directly in the zero-install Celgrid browser Studio.
