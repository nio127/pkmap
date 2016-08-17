pk = {};

(function(p) {
    p.opts = {
      "rarity" : 4,                     //1~5
      "serverID" : 1,                   //0~1
      "notificationInterval" : 30,      //unit: seconds
      "lang" : 2,                       //1: english, 2:chinese
      "timerID" : 0,                    
      "posRightTop" :   [25.063047, 121.653781],
      "posLeftBottom" : [25.059373, 121.644071],
      "favoriteList" : ["Pikachu"],     //check english name only
      "ignoreList": []
    };

    p.data = {};
    //fetchUrl = "https://pkget.com/pkm.aspx?v1=111&v2=25.062588&v3=121.653605&v4=25.060333&v5=121.644528";
    fetchUrl = "https://pkget.com/pkm.aspx?v1=111&v2=25.063047&v3=121.653781&v4=25.059373&v5=121.644071";

    document.title = "pmap";    //change title
    $("h1").remove();   //remove header

    var arrayToUpperCase = function(entry) {return entry.toUpperCase();};
    p.opts.favoriteList = p.opts.favoriteList.map(arrayToUpperCase);
    p.opts.ignoreList = p.opts.ignoreList.map(arrayToUpperCase);


    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    };

    var getUrl = function() {
        var params = {"v2": p.opts.posRightTop[0],
                      "v3": p.opts.posRightTop[1],
                      "v4": p.opts.posLeftBottom[0],
                      "v5": p.opts.posLeftBottom[1]
        };
        var str = "";
        for (var key in params) {
            if (str != "") str+="&";
            str += key+"="+ params[key];
        }    
        return "https://" + (p.opts.serverID == 1 ? "s1." : "") +
            "pkget.com/pkm.aspx?v1=111&" + str
    };

    fetchUrl = getUrl();

    p.stop = function() {
        console.log("stop to monitor pkmap...");
        clearInterval(p.opts.timerID);
    };

    p.addNotification = function(title, text) {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        else {
            var notification = new Notification(title, {
              body: text
            });
        }
    };
    var getRestTime = function(tick) {
        var restSec = Math.floor((tick - Date.now()) / 1000);
        var rMin = Math.floor(restSec / 60);
        var rSec = restSec % 60;
        var str = (rMin == 0 ? "" : rMin+"m") + rSec + "s";
        return str;
    };
    var checkPM = function(pkData) {
        p.data = pkData.pk123;
        var len = p.data.length;
        var pklist = {"1":[], "2":[], "3":[], "4":[], "5":[]};
        for (var i = 0; i < len; i++) {
            //d1: index
            //d2: english name
            //d3: expire time
            //d4,d5: gps position
            //d6: chinese name
            //d7: rare value
            var item = p.data[i];
            var debug = [];
            var eName = item["d2"];
            var cName = item["d6"];
            var rare = item["d7"].length;
            
            if ($.inArray(eName.toUpperCase(), p.opts.favoriteList) != -1) {
                console.log("addNotification(" + rare + ", " + eName + ")");
                p.addNotification(rare, eName + "(" + cName + ")");
                continue;
            }
            if ($.inArray(eName.toUpperCase(), p.opts.ignoreList) != -1) {
                continue;
            }
            
            pklist[rare].push(item);
        }
        
        for (var i=p.opts.rarity; i<=5; i++) {
            var group = pklist[i];
            //var text = group.join(", ");
            var text = group.map(function(entry) {
                return (p.opts.lang == 2 ? entry["d6"] : entry["d2"] ) + "(" + getRestTime(entry["d3"]) + ")";
            }).join(", ");
            if (group.length) {
                p.addNotification(i, text);
            }
        }
    };

    p.go = function() {
        $.getJSON(fetchUrl, checkPM);

        p.opts.timerID = setInterval(function(){$.getJSON(fetchUrl, checkPM);} , p.opts.notificationInterval * 1000);
        console.log("start to monitor pkmap...");
    };

    p.reset = function() {
        this.stop();
        this.go();
    };

    return this;
})(pk);

pk.go();

