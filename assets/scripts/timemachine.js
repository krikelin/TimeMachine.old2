'use strict';

/*var sp = getSpotifyApi();
var models = sp.require('$api/models');
var runtime = sp.require("$api/runtime");*/
var TimeMachine = function () {
	this.init();
};
TimeMachine.prototype = {

	init: function () {
		
		console.log(this);
		var self = this;

		require(["$views/tabbar#TabBar", "$api/models"], function (tabBar, models) {
			if(false) {
				var tabBar = tabBar.withTabs([
					{
						id: 'Overview', name: 'Overview', active: true

					},
					{
						id: 'Album', name: 'Albums'
					}

				]);
				tabBar.addToDom(document.querySelector("header"), 'after');
			}
			models.application.addEventListener('arguments', function () {
				models.application.load('arguments').done(function (app) {
					console.log(app.arguments);
					var args = app.arguments;

					// Set corresponding section
					var section = args[args.length-1];
					console.log(section);

					// If year is provided (eg. arguments is longer than one change year)
					if(args.length > 1) {
						
						var year = args[0];//= args[0].split('-');
						
						console.log("A");
						self.setTime(year, -1, '', function (objects) {
							objects.forEach(function(artist) {
								console.log(artist);
							});
						}, 25);
					}
				});
			})
			self.setTime(2001, 2009, '', function (objects) {
				objects.forEach(function(artist) {
					console.log(artist);
				});
			}, 25);

		});
	},
	setTime: function (startYear, endYear, q, callback, maxlength) {

		
var blocked_items = "";
		require(['$api/search#Search', '$api/models#Promise', "$api/models#Artist", "$views/image#Image", "$api/models#Album", "$api/models#Track", "$views/throbber#Throbber", "$views/list#List", "$api/models#Playlist"], function (Search, Promise, Artist, Image, Album, Track, Throbber, List, Playlist) {
			var artists = document.querySelector("#artists");
			document.querySelector("#toplist").innerHTML = "";
			document.querySelector("#biography").innerHTML = "";
			artists.innerHTML = "";
	  		var throbber = Throbber.forElement(document.body);
			var searchs = [];

			//for(var i = startYear; i < endYear; i++) {
				var search = Search.search('year:' + startYear);
				searchs.push(search.artists.snapshot(0, 20));
				searchs.push(search.albums.snapshot(0, 15));
				searchs.push(search.tracks.snapshot(0, 5));

			//}

			// Find albums released today (at the year specified)
			var release_date = startYear + '-' + (new Date().getMonth() +1); // + '-' + new Date().getDate();

			var url = 'http://www.musicbrainz.org/ws/2/release/?query=date:' + release_date;
			var req = new XMLHttpRequest();
			req.onreadystatechange = function () {
				if(req.readyState == 4) {
					if(req.status == 200) {
						var releases = req.responseXML.getElementsByTagName("release");
						var queries = [];
						console.log("TT");
						for(var r = 0; r < releases.length; r++) {
							var release = releases[r];
							console.log(release);
							console.log(release.getElementsByTagName('artist')[0]);
							var _search = Search.search('album:\"' + 
								release.getElementsByTagName('title')[0].firstChild.nodeValue +
								 '\" artist:\"' + 
								 release.getElementsByTagName('artist')[0].getElementsByTagName('name')[0].firstChild.nodeValue +
								 '\"');
							console.log(_search);
							queries.push(_search.albums.snapshot(0, 1));

						}
						var items2 = [];
						Promise.join(queries).each(function (_item) {
							items2.push(_item.loadAll('name', 'artists'));
						}).done(function () {
							Promise.join(items2).each(function (album) {

							}).done(function (albums) {
								console.log(albums);
								albums.forEach(function (album) {
									album.forEach(function (album) {
											var img = Image.forAlbum(album, {
												width: 150,
												height: 150,
												player: true,
												placeholder: 'album'
											});
											console.log(img.node); 
											document.querySelector("#albums").appendChild(img.node);
										
									});
								});
							});											
						}).fail(function () {

						});
					}
				}
			};
			req.open('get', url, true);
			req.send();

			
			var items = [];
			Promise.join(searchs).each(function (snapshot) {
				items.push(snapshot.loadAll('name', 'image'));

			}).done(function (snapshot) {
				Promise.join(items).each( function (obj) {


				}).done(function (objs) {
					Playlist.createTemporary().done(function (playlist) {

						console.log(objs);
						throbber.hide();
						objs.forEach(function (item) {
							var n = 0;
							
							playlist.load('tracks').done(function (playlist) {
								playlist.tracks.clear();


								item.forEach(function (obj) {
									console.log("item", obj);
									console.log(obj.uri, blocked_items.indexOf(obj.uri));
									if(blocked_items.indexOf(obj.uri) == -1) {
										if(obj instanceof Artist) {
											blocked_items += ";" + (obj.uri);
											var image = Image.forArtist(obj, {
										   		width: 150,
										    	height: 150,
										    	link: 'auto',
										    	overlay: [obj.name]
										  	});
										  	var li = document.createElement("li");
										  	image.node.style.margin ="3px";
										  	li.appendChild(image.node);
										  	document.querySelector("#artists").appendChild(li);
										}
										if(obj instanceof Track) {
											if( n < 5) {
												console.log(playlist);
												playlist.tracks.add(obj);
												n++;
											}
										}
									}
								});
								
							});
							
						/*	// Change 2000s in music later
							var url = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&format=xml&rvprop=content&rvlimit=10&rvparse=&rvcontentformat=text%2Fplain&titles=2000s_in_music".replace('${year}', startYear);
							var xmlHttp = new XMLHttpRequest();
							xmlHttp.onreadystatechange = function () {
								if(xmlHttp.readyState == 4) {
									if(xmlHttp.status == 200) {
										
											document.querySelector("#yeartext").innerHTML = startYear;
											var xml = xmlHttp.responseXML;
											console.log(xmlHttp.responseXML);
											var rev = xml.getElementsByTagName("rev")[0].textContent;
											console.log(rev);*/
											
								/*		}
								}
							};
							xmlHttp.open('GET', url, true);
							xmlHttp.send(null);*/
						});
						console.log(playlist);
				var list = List.forPlaylist(playlist, {
					style: 'rounded',
					layout: 'toplist',
				});
				document.querySelector("#toplist").appendChild(list.node);
				list.init();


				// Load biography
				require(['$api/models'], function (models) {
					models.application.readFile('assets/text/cheatwiki.txt').done(function (text) {
						document.querySelector("#biography").innerHTML = text;
					});
				});
					});
					


				}).fail(function () {});

			}).fail(function (objects) {

			});
		});
	
	},
	
	
};		
window.addEventListener("load", function () {
	new TimeMachine();
});

