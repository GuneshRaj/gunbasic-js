# gunbasic-js

(From https://code.google.com/p/gunbasic-js Around 2008)

Gun Basic-JS is a Simple, Ad hoc library for Web Developers that dont want to create fat html clients.
It works by allowing Ajax responses to be self descriptive allowing it to update to which DIV or Evaluating any Javascript codes.
It is extremely simple to use, very small code base.
Targets web developers that are not inclined to code too much on Javascript.
It is free from any Javascript Libraries, Stand alone.

Example

To make a GunBasic Call
```js
autoajaxcall (null, 'GET', 'js.html', 'exampleparam=123', showworking, hideworking);
```

Params:
Just Ignore for now, use null.
HTTP Method, GET|POST
URL of the Ajax Call
Parameters for the Ajax Call
Function OnStart, Optional
Function OnComplete, Optional

The output from js.html would be:

```html
<!-- [SGUN:] -->
div1example2|div2example2|
<!-- [EGUN:] -->
<!-- [SVAL:] -->
TITLE|HEY|
<!-- [EVAL:] -->

<!-- [SGUN:div1example2] -->
For the first <b>Example</b><br />
This is for the first DIV<br />
Changed for Example 2
<!-- [EGUN:div1example2] -->

<!-- [SGUN:div2example2] -->
For the First <b>Example</b><br />
This is for the Second DIV<br />
Changed for Example 2
<!-- [EGUN:div2example2] -->

<!-- [SVAL:TITLE] -->
document.title="New Title, changed for Example 2"
<!-- [EVAL:TITLE] -->

<!-- [SVAL:HEY] -->
alert('As Expected, GunBasic sends this Alert via Ajax, One Line of Code, Check Page Title!');
<!-- [EVAL:HEY] -->
```

