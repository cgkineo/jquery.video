var fsg = require("fs-glob");
var fs = require("fs");
var path = require("path");
var uglify = require("uglify-js");

fsg.stats({
    globs: [
        "*.css",
        "**/*.css"
    ],
    location: "./src"
}).then((stats)=>{

    var cssJS = '$("<style>",{text:"';
    return stats.each((stat, next, resolve)=>{

        if (!stat) return resolve();

        var css = fs.readFileSync(stat.location).toString();
        css = css.replace(/\"/g, "'");
        css = css.replace(/  /g, "");
        css = css.replace(/\r\n/g, "");
        css = css.replace(/ [\{]/g, "{");
        css = css.replace(/ *: */g, ":");
        cssJS+=css;

        next();

    }).then(()=>{
        cssJS += '"}).appendTo("head");';
        return {
            "jquery.video.css": cssJS
        };
    });


}).then((files)=>{

    files['jquery.video.util.js'] = fs.readFileSync("./src/jquery.video.utils.js").toString();
    files['jquery.video.core.js'] = fs.readFileSync("./src/jquery.video.core.js").toString();
    files['jquery.video.controls.js'] = fs.readFileSync("./src/jquery.video.controls.js").toString();

    return fsg.stats({
        globs: [
            "*.js",
            "**/*.js",
            "!jquery.video.utils.js",
            "!jquery.video.core.js",
            "!jquery.video.controls.js"
        ],
        location: "./src"
    }).then((stats)=>{

        return stats.each((stat, next, resolve)=>{

            if (!stat) return resolve(files);

            files[fsg.rel(stat.location, "./src")] = fs.readFileSync(stat.location).toString();

            next();

        });

    });

}).then((files)=>{

    var result = uglify.minify(files, {
        toplevel: true,
        compress: {
            passes: 2
        },
        mangle: {
            properties: {
                regex: /_.*/,
                builtins : true
            }
        },
        output: {
            beautify: false
        }
    });
    if (result.error) {
        console.log(result.error);
        return;
    }

    fsg.mkdir("./build");
    fs.writeFileSync("./build/jquery.video.min.js", "(function($){"+result.code+"})(jQuery);");

});
