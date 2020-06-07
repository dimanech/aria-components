# ARIA Components

![Tests](https://github.com/dimanech/aria-components/workflows/Tests%20and%20linting/badge.svg?branch=master)

This is collections of WAI-ARIA WCAG 2.1 AAA compatible components. 

Those components not fully tested or proven to work as expected in all browsers,
but in most cases it has production ready code and could be used in real project.

These components designed to be very portable and modular, without any additional 
dependencies or infrastructure. So they could be easily placed in any kind of 
projects without any dependencies and extra efforts.

It designed as development ready component, so it contains only needed code and styles.

[You could see it in action](https://dimanech.github.io/aria-components/)

## Quick start

1. Copy some component file into you project. In most cases it is just single file.

2. Init component on the page

```js
import ScrollCarousel from './ScrollCarousel.js';

document.querySelectorAll('[data-component="./carousels/ScrollCarousel"]')
    .forEach(elem => new ScrollCarousel(elem).init());
```

Components have initializer, but it could be simply substituted with this code.

## Targeted browsers

* Chrome / Mobile Chrome
* Safari / Mobile Safari
* Firefox

---

* Windows Narrator with MS Edge, NVDA with Google Chrome
* MacOS VoiceOver Utility (v9 562.858) with Safari, Google Chrome
* GNU/Linux Gnome Orca Screen Reader 3.32 with Firefox (Gecko) and Epiphany (WebKitGtk)

## License

This software or documents includes material derived from 
[WAI-ARIA practice](https://www.w3.org/TR/wai-aria-practices/).
Copyright © 2020 W3C® (MIT, INRIA, ERCIM, Keio, Beihang).

All Rights Reserved. This work is distributed under the
[W3C® Software License](http://www.w3.org/Consortium/Legal/copyright-software)
in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.

Copyright © 2019-2020, D. Nechepurenko. Published under MIT license.
