/*
The MIT License

Copyright (c) 2010 Zohaib Sibt-e-Hassan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Wadda = function(img, opts){
	var me = this;
	me.conf = {
		lensRadius: 70,
		xOff: 0,
		yOff: 0,
		fadeLens: true,
		loadingStart: null,
		loadingFail: null,
		loadingComplete: null,
		zoom: 2
	};
	
	merge(me.conf, opts);
	me.canv = document.createElement('canvas');
	if(!me.canv)
		return null;
	me.hcanv = document.createElement('canvas');
	
	me.canv.style.position = 'absolute';
	me.canv.style.display = 'none';
	
	me.canv.width = me.canv.height = me.hcanv.width = me.hcanv.height = me.conf.lensRadius*2;
	document.body.appendChild(me.canv);
	
	if(typeof img === 'string')
		img = byId(img);
	
	me.image = img;
	me.doZoom = false;
	me.setZoom(me.conf.zoom);
	
	listenOn(me.image, 'mousedown', me.mouseDown.scope(me));
	listenOn(me.image, 'mousemove', me.mouseMove.scope(me));
	listenOn(me.canv,  'mousemove', me.mouseMove.scope(me));
	
	listenOn(me.image, 'mouseup', me.mouseUp.scope(me));
	listenOn(document.body, 'mouseup', me.mouseUp.scope(me));
	
	return me;
};

Wadda.prototype = {
	setZoom: function(z){
		var me = this;
		me.imgCanv = null;
		
		if(me.bigImage){
			me.conf.zoom = z;
			me.imgCanv = Wadda.Helpers.createScaledImageCanvas(me.image, me.conf.zoom, me.bigImage);
			return ;
		}
		
		if(me.conf.loadingStart)
			me.conf.loadingStart(me);
		Wadda.Helpers.loadImage(me.image.title, function(im){
			if(!im.complete) {
				if(me.conf.loadingFail)
					me.conf.loadingFail(me);
				return;
			}
			me.conf.zoom = z;
			me.bigImage = im;
			if(me.conf.loadingComplete)
				me.conf.loadingComplete(me);
			me.imgCanv = Wadda.Helpers.createScaledImageCanvas(me.image, me.conf.zoom, me.bigImage);
		});
	},
	
	cursorWithinBounds: function(e){
		var me = this;
		var posX = e.pageX;
		var posY = e.pageY;
		var minX = me.image.offsetLeft;
		var minY = me.image.offsetTop;
		var maxX = minX + me.image.clientWidth;
		var maxY = minY + me.image.clientHeight;
		
		return posX>minX && posY>minY && posX<maxX && posY<maxY;
	},
	
	setFade: function(m){
		this.conf.fadeLens = m;
	},
	
	dispose: function(){
		var me = this;
		document.body.appendChild(me.canv);
		me.imgCanv = null;
	},
	
	mouseDown: function(e){
		var me = this;
		if(!me.imgCanv) return;
		me.canv.style.display = '';
		me.canv.style.zIndex = 99999;
		me.doZoom = true;
		me.mouseMove(e);
		if(e.preventDefault)
			e.preventDefault();
		else
			e.returnValue = false;
	},
	
	mouseUp: function(e){
		var me = this;
		me.canv.style.display = 'none';
		me.doZoom = false;
	},
	
	mouseMove: function(e){
		var me = this;
		if(!me.doZoom || !me.imgCanv)
			return;
		if(!me.cursorWithinBounds(e)){
			me.mouseUp(e);
			return;
		}
		var posX = e.pageX;
		var posY = e.pageY;
		var centerX = me.canv.width/2;
		var centerY = me.canv.height/2;
		var clW = me.canv.width/2;
		var clH = me.canv.height/2;
		var ctx = me.canv.getContext('2d');
		var hctx = me.hcanv.getContext('2d');

		me.canv.style.left = (posX - clW + me.conf.xOff)+"px";
		me.canv.style.top = (posY - clH + me.conf.yOff)+"px";
		
		ctx.globalCompositeOperation = 'source-over';
		var lf = posX - me.image.offsetLeft;
		var tp = posY - me.image.offsetTop;
		
		//Make xored shape due to chrome
		hctx.globalCompositeOperation = 'source-over';
		
		hctx.fillRect(-1, -1, me.canv.width+1, me.canv.height+1);
		hctx.globalCompositeOperation = 'xor';
		hctx.beginPath();
		hctx.arc(centerX, centerY, clW, 0, Math.PI*2, true); 
		hctx.closePath();
		hctx.fill();
		
		lf = lf*me.conf.zoom - clW;
		tp = tp*me.conf.zoom - clH;
		
		if(lf<0) lf = 0;
		else if(lf>me.imgCanv.width - me.canv.width) lf = me.imgCanv.width - me.canv.width;
		if(tp<0) tp = 0;
		else if(tp>me.imgCanv.height - me.canv.height) tp = me.imgCanv.height - me.canv.height;
		
		
		ctx.drawImage(me.imgCanv, lf, tp, me.canv.width, me.canv.height, 0, 0, me.canv.width, me.canv.height);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.drawImage(me.hcanv, 0, 0, me.canv.width, me.canv.height);
		
		if(me.conf.fadeLens){
			ctx.globalCompositeOperation = 'destination-atop';
			var gradObj = ctx.createRadialGradient(centerX,centerY,0, centerX, centerY,clW);
			gradObj.addColorStop(0.5, "rgba(0,0,0,1)");
			gradObj.addColorStop(1, "rgba(0,0,0,0.1)");
			ctx.fillStyle = gradObj;
			ctx.beginPath();
			ctx.arc(centerX, centerY, clW, 0, Math.PI*2, true); 
			ctx.closePath();
			ctx.fill();	
		}
	}
};


Wadda.Helpers = {
	loadImage: function(src, cb){
		var img = new Image();
		img.src = src;
		listenOn(img, "load", cb.scope(img, img) );
		return img;
	},
	
	createScaledImageCanvas: function(img, zoom, orgImg){
		orgImg = orgImg || img;
		var tmp = document.createElement('canvas');
		var orgSz = Wadda.Helpers.getImageSize(orgImg);
		tmp.width = img.width*zoom;
		tmp.height = img.height*zoom;
		var con = tmp.getContext('2d');
		con.drawImage(orgImg, 0, 0, orgSz.w, orgSz.h, 0, 0, tmp.width, tmp.height);
		return tmp;
	},
	
	getImageSize: function (img){
		var im = document.createElement('img');
		im.src = img.src;
		document.body.appendChild(im);
		var ret = {w: im.clientWidth, h: im.clientHeight};
		document.body.removeChild(im);
		return ret;
	}
};
