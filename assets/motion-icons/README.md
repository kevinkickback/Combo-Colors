# Motion icon assets

Joystick SVG viewBoxes use tight horizontal artwork bounds with four units of optical padding on
each side. Preserve that padding when adding or replacing an asset so adjacent joystick icons keep
consistent visible spacing. Vertical bounds normally remain shared; unusually oversized artwork,
such as SPD, may use symmetric vertical padding to maintain a consistent visual scale.

Compound joystick motions should compose the smallest available icons. For example, 720 and 1080
render two or three `spd.svg` icons rather than dedicated compound assets.

## Asset provenance

The current motion icon set was added directly to the Combo Colors repository by its maintainer and
has no recorded third-party source. The project is distributed under the MIT license in the root
`LICENSE` file. Any future third-party artwork must document its creator, source, and license here.
