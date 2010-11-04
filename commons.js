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

Function.prototype.scope = function(){
	var argsOuter = Array.prototype.slice.call(arguments);
	var func = this;
	var scope = argsOuter[0];
	
	if(argsOuter.length > 1 && argsOuter[1] && !argsOuter[1].length){
		argsOuter = argsOuter.slice(1);
	}else if( argsOuter[1] && argsOuter[1].length > 1){
		argsOuter = argsOuter[1];
	}else{
		argsOuter = [];
	}

	var ret = function (){
		var args = Array.prototype.slice.call(arguments);
		args = argsOuter.concat(args);
		func.apply(scope, args);
	};
	return ret;
};

var byId = function(nm){
	return document.getElementById(nm);
};

var merge = function(a, b){
	a = a || {};
	b = b || {};
	for(var i in b){
		if( b.hasOwnProperty(i) ){
			a[i] = b[i];
		}
	}
	return a;
};

var listenOn = null;

var deafOn = function(el, name, cb){
	if(!el){
		return false;
	}
	if(cb){
		if( el.removeEventListener ){
			return el.removeEventListener(name, cb, false);
		}else if( el.detachEvent ){
			return el.detachEvent('on'+name, cb);
		}
	}
	
	return false;
};

(function(){

	var evDispatcher = function(cback, e){
		if(!e){ e=window.event; }
		cback.scope(this)(e);
	};

	listenOn = function(el, name, cb){
		var ret = null;
		if(!el){
			return ret;
		}
		if(el.addEventListener){
			ret = el.addEventListener(name, evDispatcher.scope(el, cb.scope(el) ), false);
		}else if(el.attachEvent){
			ret = el.attachEvent("on"+name, evDispatcher.scope(el, cb.scope(el) ) );
		}
			
		return ret;
	};
})();