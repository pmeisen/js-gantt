# js-gantt (Examples)
[![Bower version](https://badge.fury.io/bo/js-gantt.svg)](https://badge.fury.io/bo/js-gantt)
[![npm version](https://badge.fury.io/js/js-gantt.svg)](https://badge.fury.io/js/js-gantt)
[![Build Status](https://travis-ci.org/pmeisen/js-gantt.svg?branch=master)](https://travis-ci.org/pmeisen/js-gantt)

This folder contains examples created to illustrate some of the possibilities.

### Creating SVG from nodeJS

Yes it is possible to create Gantt-Charts, i.e.,
SVG files (and also convert these to, e.g., PNG) within nodeJS. I personally
only use the library within a browser, so the example just shows what may be
possible. The examples utilizes *phantomJs* to render the SVG in the headless
browser, retrieves the created SVG and stores it in a file. There are some
things to be considered to make this example more usable:

1. It may be nicer to push the options, as well as the width and height
   through nodeJs into the JavaScript. Currently the *options* are also
   defined in the JavaScript part. The main reason is that the *js-gantt*
   library only supports *Date* instances out of the box. The options coming
   from nodeJs are stringified (using *JSON*), which does not support *Date*
   types.
2. The rendering of the SVG may take some milliseconds (or seconds if large
   external sources are used). The *js-gantt* chart provides events to know
   when the rendering is finished. Nevertheless, in the example the script
   just waits a couple of seconds. In a nicer version, nodeJs would utilize
   the events provided by the library.