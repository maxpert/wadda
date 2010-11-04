Function.prototype.scope=function(){var b=Array.prototype.slice.call(arguments);var d=this;var c=b[0];if(b.length>1&&b[1]&&!b[1].length){b=b.slice(1)}else{if(b[1]&&b[1].length>1){b=b[1]}else{b=[]}}var a=function(){var e=Array.prototype.slice.call(arguments);e=b.concat(e);d.apply(c,e)};return a};var byId=function(a){return document.getElementById(a)};var merge=function(d,c){d=d||{};c=c||{};for(var e in c){if(c.hasOwnProperty(e)){d[e]=c[e]}}return d};var listenOn=null;var deafOn=function(c,b,a){if(!c){return false}if(a){if(c.removeEventListener){return c.removeEventListener(b,a,false)}else{if(c.detachEvent){return c.detachEvent("on"+b,a)}}}return false};(function(){var a=function(b,c){if(!c){c=window.event}b.scope(this)(c)};listenOn=function(e,d,b){var c=null;if(!e){return c}if(e.addEventListener){c=e.addEventListener(d,a.scope(e,b.scope(e)),false)}else{if(e.attachEvent){c=e.attachEvent("on"+d,a.scope(e,b.scope(e)))}}return c}})();var Wadda=function(a,c){var b=this;b.conf={lensRadius:70,xOff:0,yOff:0,fadeLens:true,loadingStart:null,loadingFail:null,loadingComplete:null,zoom:2};merge(b.conf,c);b.canv=document.createElement("canvas");if(!b.canv){return null}b.hcanv=document.createElement("canvas");b.canv.style.position="absolute";b.canv.style.display="none";b.canv.width=b.canv.height=b.hcanv.width=b.hcanv.height=b.conf.lensRadius*2;document.body.appendChild(b.canv);if(typeof a==="string"){a=byId(a)}b.image=a;b.doZoom=false;b.setZoom(b.conf.zoom);listenOn(b.image,"mousedown",b.mouseDown.scope(b));listenOn(b.image,"mousemove",b.mouseMove.scope(b));listenOn(b.canv,"mousemove",b.mouseMove.scope(b));listenOn(b.image,"mouseup",b.mouseUp.scope(b));listenOn(document.body,"mouseup",b.mouseUp.scope(b));return b};Wadda.prototype={setZoom:function(b){var a=this;a.imgCanv=null;if(a.bigImage){a.conf.zoom=b;a.imgCanv=Wadda.Helpers.createScaledImageCanvas(a.image,a.conf.zoom,a.bigImage);return}if(a.conf.loadingStart){a.conf.loadingStart(a)}Wadda.Helpers.loadImage(a.image.title,function(c){if(!c.complete){if(a.conf.loadingFail){a.conf.loadingFail(a)}return}a.conf.zoom=b;a.bigImage=c;if(a.conf.loadingComplete){a.conf.loadingComplete(a)}a.imgCanv=Wadda.Helpers.createScaledImageCanvas(a.image,a.conf.zoom,a.bigImage)})},cursorWithinBounds:function(h){var j=this;var i=function(l,k){if(!k||!k.offsetParent||l!="Left"||l!="Top"){return null}l="offset"+l;var e=k[l];while(k.offsetParent){k=k.offsetParent;e+=k[l]}return e};var c=h.pageX;var b=h.pageY;var g=i("Left",j.image);var f=i("Top",j.image);var d=g+j.image.clientWidth;var a=f+j.image.clientHeight;return c>g&&b>f&&c<d&&b<a},setFade:function(a){this.conf.fadeLens=a},dispose:function(){var a=this;document.body.appendChild(a.canv);a.imgCanv=null},mouseDown:function(b){var a=this;if(!a.imgCanv){return}a.canv.style.display="";a.canv.style.zIndex=99999;a.doZoom=true;a.mouseMove(b);if(b.preventDefault){b.preventDefault()}else{b.returnValue=false}},mouseUp:function(b){var a=this;a.canv.style.display="none";a.doZoom=false},mouseMove:function(g){var h=this;if(!h.doZoom||!h.imgCanv){return}if(!h.cursorWithinBounds(g)){h.mouseUp(g);return}var b=g.pageX;var a=g.pageY;var f=h.canv.width/2;var d=h.canv.height/2;var c=h.canv.width/2;var k=h.canv.height/2;var m=h.canv.getContext("2d");var j=h.hcanv.getContext("2d");h.canv.style.left=(b-c+h.conf.xOff)+"px";h.canv.style.top=(a-k+h.conf.yOff)+"px";m.globalCompositeOperation="source-over";var n=b-h.image.offsetLeft;var i=a-h.image.offsetTop;j.globalCompositeOperation="source-over";j.fillRect(-1,-1,h.canv.width+1,h.canv.height+1);j.globalCompositeOperation="xor";j.beginPath();j.arc(f,d,c,0,Math.PI*2,true);j.closePath();j.fill();n=n*h.conf.zoom-c;i=i*h.conf.zoom-k;if(n<0){n=0}else{if(n>h.imgCanv.width-h.canv.width){n=h.imgCanv.width-h.canv.width}}if(i<0){i=0}else{if(i>h.imgCanv.height-h.canv.height){i=h.imgCanv.height-h.canv.height}}m.drawImage(h.imgCanv,n,i,h.canv.width,h.canv.height,0,0,h.canv.width,h.canv.height);m.globalCompositeOperation="destination-out";m.drawImage(h.hcanv,0,0,h.canv.width,h.canv.height);if(h.conf.fadeLens){m.globalCompositeOperation="destination-atop";var l=m.createRadialGradient(f,d,0,f,d,c);l.addColorStop(0.5,"rgba(0,0,0,1)");l.addColorStop(1,"rgba(0,0,0,0.1)");m.fillStyle=l;m.beginPath();m.arc(f,d,c,0,Math.PI*2,true);m.closePath();m.fill()}}};Wadda.Helpers={loadImage:function(c,a){var b=new Image();listenOn(b,"load",a.scope(b,b));b.src=c;return b},createScaledImageCanvas:function(c,e,a){a=a||c;var d=document.createElement("canvas");var f=Wadda.Helpers.getImageSize(a);d.width=c.width*e;d.height=c.height*e;var b=d.getContext("2d");b.drawImage(a,0,0,f.w,f.h,0,0,d.width,d.height);return d},getImageSize:function(b){var a=document.createElement("img");a.src=b.src;document.body.appendChild(a);var c={w:a.clientWidth,h:a.clientHeight};document.body.removeChild(a);return c}};
