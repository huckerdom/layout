<section id="about">
Layout
======

Layout is a whiteboard for planning plays in Ultimate.

It also refers to the acts of
[planning](http://www.dict.org/bin/Dict?Form=Dict2&Database=*&Query=layout), or
[diving for the disc](http://www.ultipedia.org/wiki/Layout).

Layout lets you [view and create animations](#demo), here and [embed](#embed) them into your site.
</section>

<section id="features">
Features
========

Layout lets you design, save and share plays and drills.  You can:

- Create plays by moving players and capturing key states
- Animate plays -- step-by-step or continuously
- Save/download and load plays
- [Embed](#embed) plays created using layout, in any web-page!
- Share Layouts
    1. Download your layout file
    2. Upload it somewhere on the web
    3. Enter URL to raw file
    <form action="#demo" method="GET">
    <input type="text" name="q" value="" placeholder="Enter URL to a layout json file"/>
    <input type="submit" value="Load file"/>
    </form>

Layout is currently in "alpha" and some of the requested/planned/hope-to-add
features are listed
[here](https://raw.github.com/huckerdom/layout/master/todo.org).

Layout is best supported in the latest versions of Chromium or Google
Chrome.  This site is best viewed at resolutions 1024x768 and above.
</section>

<section id="demo">
<div class="layout" width="900" height="450">
<script data-main="static/js/main.js" src="static/js/require.js"></script>
</div>
</section>


<section id="embed">
Embed
=====

FIXME: Write usage instructions
</section>

<section id="credits">
Credits
=======

##### Issues and suggestions

Layout is being developed by the folks at
[Huckerdom](https://github.com/huckerdom) -- a bunch of people who love
both hacking and hucking! Bouquets and brickbats are welcome
[here](https://github.com/huckerdom/layout/issues).

##### License & Credits

Layout is
[licensed](https://raw.github.com/huckerdom/layout/master/LICENSE) under
the BSD 3-clause license.

Layout uses [Raphael](http://raphaeljs.com) for SVG drawing and
animations, SVG icons from [iconmonstr](http://iconmonstr.com/) and
PNG icons from [Glyphicons](http://glyphicons.com).  We also use the
services of [Whatever Origin](http://whateverorigin.org) to fetch
layout json files, without having to worry about the same origin
policy.
</section>
