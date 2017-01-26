"use strict"

// MiniRequest: https://github.com/ThreeLetters/MiniRequest
const http=require("http"),https=require("https");var request=function(t,n){var e,l,o,h,i=!1,s="/",p="",r="";o=t.split("://"),i="https"==o[0]?!0:!1,h=o[1]?o[1]:o[0],o=h.split("/"),e=o[0],h=o[o.length-1].split(":"),h.length>1&&(r=parseInt(h[h.length-1]),o[o.length-1]=h.slice(0,h.length-1).join(":")),o[1]&&(s+=o.slice(1).join("/")),l=i?https:http;try{var u=l.request({host:e,path:s,port:r},function(t){t.setEncoding("utf8"),t.on("data",function(t){p+=t}),t.on("end",function(){n(!1,t,p)})});u.on("error",function(t){n(t,null,null)}),u.end()}catch(c){n(c,null,null)}};
// END

var fs = require('fs')
var exec = require('child_process').exec
module.exports = class Updater {
    constructor(files,base) {

        this.dir = base
        this.filesURL = files;
        this.tobe = 0;
        this.dow = 0;
    }
    updateDone() {
        this.loading("done. Installing modules..")
        this.install(function (e) {
            if (e) throw e;
            else {
                this.loading("done. Restarting...             ");
                exit(0);
            }
        }.bind(this))

    }
    install(call) {
        var child = exec("npm install", function (error, stdout, stderr) {
            call(error)
        });
    }
    update() {
        this.dow = 0;
        this.tobe = 2;
        console.log("[Update] Updating...")
        request(this.filesURL, function (e, r, b) {
            try {
                if (!e && r.statusCode == 200) {
                    var data = JSON.parse(b)
                    this.count = 0;
                    data.forEach((dt) => {
                        if (!dt) return;
                        this.count++;
                        this.tobe++;

                        this.downloadFile(dt, function (e) {
                            if (e) throw e

                            this.count--;
                            if (this.count <= 0) {
                                this.updateDone()

                            }
                        }.bind(this))
                    })

                }
            } catch (e) {
                throw e
            }
        }.bind(this))
    }
    writeFileSafe(dir, file, data, call) {

        file = file.split("/")
        if (!file[0]) {
            file = file.slice(1)
        }
        try {
            fs.lstatSync(dir + "/" + file.join("/"))
        } catch (e) {
            var test = dir
            for (var i = 0; i < file.length - 1; i++) {
                var a = file[i]
                test += "/" + a
                try {

                    fs.lstatSync(test)
                } catch (e) {

                    fs.mkdir(test)
                }
            }
        }


        fs.writeFile(dir + "/" + file.join("/"), data, function () {
            call()
        })

    }
    loading(action) {
        this.dow++;
        var percent = Math.round(this.dow / this.tobe * 10)
        var bar = ""
        for (var i = 0; i < percent; i++) {
            bar = bar + "===";
        }
        if (percent == 10) bar = bar + "=";
        else bar = bar + ">";
        var extras = 31 - bar.length;
        var extra = "";
        for (var i = 0; i < extras; i++) extra = extra + " ";
        process.stdout.write("[Update] [" + bar + extra + "] " + percent * 10 + "% " + action + "\r");



    }
    downloadFile(data, call) {
        var src = data.src
        var url = this.dir + data.url


        request(url, function (e, r, b) {
            if (!e && r.statusCode == 200 && b) {
                this.loading("Downloading");
                this.writeFileSafe(__dirname + "/../../", src, b, call)


            } else {

                call("Could not locate " + this.dir + data.url)
            }

        }.bind(this))



    }


}
