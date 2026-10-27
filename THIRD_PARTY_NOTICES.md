# Third-party notices

## Three.js

The bundled classic Three.js distribution in `vendor/three.min.cjs` is preserved from the existing application to keep rendering behavior stable. It reports revision 160. Its MIT license is included in [vendor/THREE-LICENSE.txt](vendor/THREE-LICENSE.txt) and copied into generated HTML.

The `.cjs` suffix allows Node-based regression tests to load the same bytes; the build embeds the distribution as a classic browser script. The application's own source modules use ES modules. Migrating the Three.js distribution itself is a separate compatibility change.

## Development tools

esbuild and Prettier are development dependencies. Their package licenses are included in their respective installed distributions. They are not runtime network dependencies.

## References

School map/facility references are listed in `docs/sources/`. Satellite image pixels are not distributed in the game. The original design inspiration is [SMASH](https://hong-iron.github.io/SMASH/).

No blanket license for the project's own source is selected by this refactor. Third-party license notices remain applicable to their respective components.
