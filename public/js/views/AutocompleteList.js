define(['views/AutocompleteItemView',
		'models/AutocompleteItem',
		'channel',
		'marionette'
], function(AutocompleteItemView, AutocompleteItem, channel) {
	'use strict';

	return Marionette.CollectionView.extend({

		itemViewContainer: '#autocomplete',

		itemView: AutocompleteItemView,

		initialize: function() {
			this.listenTo(channel, 'autocompleteClose', this.close);
			this.listenTo(channel, 'addArtistsData', this.addArtistsData);
			this.listenTo(channel, 'addCitiesData', this.addCitiesData);

			this.listenTo(this.collection, 'close', this.close);
			this.listenTo(this.collection, 'repaint', this.repaint);
		},

		repaint: function() {
			this.collection.reset();
			this.$el.show();
		},

		close: function() {
			this.collection.reset();
			this.$el.hide();
		},

		addArtistsData: function(artist) {
			this.repaint();

			var self = this;

			$.ajax({
				url: 'http://ws.audioscrobbler.com/2.0/',
				type: 'GET',
				data: {
					method: 'artist.search',
					artist: artist,
					limit: 5,
					api_key: 'dd349d2176d3b97b8162bb0c0e583b1c',
					format: 'json'
				},
				success: function(data) {
					if (typeof data.results != 'undefined') {
						var res = data.results.artistmatches.artist;

						if (typeof res != 'undefined' && res.length) {
							res.forEach(function(value, index) {
								self.collection.add(new AutocompleteItem({
									title: value.name, 
									meta: '', 
									selected: false
								}));
							});
						}
					}
				}
			});
		},

		addCitiesData: function(city) {
			this.repaint();

			var self = this;

			var promise = $.getJSON("http://gd.geobytes.com/AutoCompleteCity?callback=?&q="+city);

			promise.done(function (data) {
				data.length = 5;

				data.forEach(function(value, index) {
					if (value && typeof value != 'undefined') {
						var res = value.split(', ');
						self.collection.add(new AutocompleteItem({
							title: res[0], 
							meta: res[2], 
							selected: false
						}));
					}
				});
			});
		}

	});

});