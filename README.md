# jquery.video

```javascript

    $("video").video()[0].play();
    $("video").video({captions: true})[0].play();

```

```html
    <video id="c-40" src="c-40.mp4" autobuffer autoloop loop poster="c-40.jpg" vttsrc="c-40.vtt" vttlang="en" vttlabel="English">
        <track kind="captions" src="c-40-de.vtt" type="text/vtt" srclang="de" label="Deutsch">
    </video>

    <div for="c-40" kind="captions" vttlang="en">

    </div>
    <div for="c-40" kind="captions" vttlang="de">

    </div>
```