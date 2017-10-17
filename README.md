# jquery.video

```javascript

    $("video").play().mute(true).loop(true).pause();
    $("video").videos({captions: true}).play();

```

```html
    <video id="c-40" preload="none" src="c-40.mp4" loop poster="c-40.jpg">
        <track kind="captions" src="c-40-de.vtt" type="text/vtt" srclang="de" label="Deutsch">
        <track kind="captions" src="c-40-en.vtt" type="text/vtt" srclang="en" label="English">
    </video>

    <div for="c-40" kind="captions" srclang="en">

    </div>
    
    <div for="c-40" kind="buffering" class="toggle">

    </div>

    <div for="c-40" kind="controls" class="toggle">

        <div class="big-play play"> </div>

        <div class="scrub">
            <div class="little-playpause toggle"></div>
            <div class="rail">
                <div class="rail-back">
                </div>
                <div class="rail-inner">
                </div>
            </div>
        </div>
        
    </div>

    <div for="c-40" kind="captions" class="toggle" srclang="de">

    </div>
```
