Promise = require("promise");
require("whatwg-fetch");

var page = tabris.create("Page", {
    title: "Flickr Search",
    topLevel: true
});

var tagInput = tabris.create("TextInput", {
    layoutData: {
        left: 8,
        right: 8,
        top: 8
    },
    message: "Search..."
}).on("accept", loadItems).appendTo(page);

var view = tabris.create("CollectionView", {
    layoutData: {
        left: 0,
        top: [tagInput, 8],
        right: 0,
        bottom: 0
    },
    itemHeight: 200,
    refreshEnabled: true,
    initializeCell: function(cell) {
        var imageView = tabris.create("ImageView", {
            layoutData: {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            },
            scaleMode: 'fill'
        }).appendTo(cell);
        var titleComposite = tabris.create("Composite", {
            background: "rgba(0,0,0,0.8)",
            top: 0,
            right: 0,
            left: 0
        }).appendTo(cell);
        var textView = tabris.create("TextView", {
            layoutData: {
                left: 30,
                top: 5,
                bottom: 5,
                right: 30
            },
            alignment: "center",
            font: "16px Roboto, sans-serif",
            textColor: "#fff"
        }).appendTo(titleComposite);
        cell.on("change:item", function(widget, item) {
            animateFadeInFromRight(widget, 500);
            imageView.set("image", {
                src: item.media.m
            });
            item.title ? textView.set("text", item.title) : textView.set("text", 'No Title');
        });
    }
}).on("refresh", function() {
    loadItems();
}).appendTo(page);

function loadItems() {
    view.set({
        refreshIndicator: true,
        refreshMessage: "loading..."
    });
    fetch("https://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=JSON_CALLBACK&tags=" + tagInput.get('text')).then(function(response) {
        var dyn_function = new Function("JSON_CALLBACK", response._bodyInit);
        dyn_function(function(json) {
            if (json.items && json.items.length) {
                view.set({
                    items: json.items,
                    refreshIndicator: false,
                    refreshMessage: "refreshed"
                });
            } else {
                navigator.notification.alert('Nothing found with tag: ' + tagInput.get('text'), null, 'Result');
                view.set({
                    refreshIndicator: false,
                    refreshMessage: "refreshed"
                });
            }
        })
    }).catch(function(error) {
        console.log('request failed:', error)
    })
}

function animateFadeInFromRight(widget, delay) {
    widget.set({
        opacity: 0.0,
        transform: {
            translationX: 150
        }
    });
    widget.animate({
        opacity: 1.0,
        transform: {
            translationX: 0
        }
    }, {
        duration: 500,
        delay: delay,
        easing: "ease-out"
    });
}
loadItems();
page.open();
