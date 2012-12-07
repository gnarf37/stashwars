Meteor.subscribe("auctions");

Template.auction_list.all = function () {
  return Auctions.find({});
};
Template.auction_list.show = function () {
  return Session.get( "auction-page" );
};

Template.auction_page.auction = function() {
  var auction = Auctions.findOne({ _id: Session.get( "auction-id" ) });
  console.log( auction );
  return auction;
};

Template.auction_page.show = function() {
  return Session.get( "auction-id" );
};

window.onhashchange = function() {
  Session.set( "auction-page", location.hash.match(/auctions/) );
  var idMatch = location.hash.match(/auction-([\w-]+)/);
  Session.set( "auction-id", idMatch && idMatch[1] );
  jQuery(".nav a").each(function(){
    var elem = jQuery(this);
    elem.closest("li").toggleClass("active", this.hash == location.hash);
  });
};

Template.page.rendered = function() {
  if (!this.onlyonce) {
    this.onlyonce = true;
    window.onhashchange();
  }
};


///////////////////////////////////////////////////////////////////////////////
// Create Auction Dialog

var openCreateDialog = function () {
  Session.set("createError", null);
  Session.set("showCreateDialog", true);
  jQuery(Template.create_dialog.find(".modal")).removeClass("disabled");
};

Template.page.events({
  'click .create': function() {
    openCreateDialog();
  }
});

Template.create_dialog.show = function () {
  return Session.get("showCreateDialog");
};

Template.create_dialog.events({
  'click .save': function (event, template) {
    // Pull out our field values
    if ( template.find(".modal.disabled") ) {
      return;
    }
    var title = template.find(".title").value,
        duration = template.find(".duration").value;
    // Ensure the Title Length
    if(!title.length) {
      Session.set("createError",
                  "Your auction needs a title.");
    }
    // Ensure the Duration
    if(duration < 15) {
      Session.set("createError",
                  "The duration must be greater than 15 minutes.");
    }
    if(duration > 60) {
      Session.set("createError",
                  "The duration must be less than 60 minutes.");
    }
    // Ensure we have no errors before save
    if(!Session.get("createError")) {
      jQuery(template.find(".modal")).addClass("disabled");
      Meteor.call('createAuction', {
        title: title,
        duration: duration
      }, function (error, auction) {
        jQuery(template.find(".modal")).removeClass("disabled");
        if (error) {
          Session.set("createError", "There was an error creating this auction: " + error);
        } else {
          window.location = "#auction-" + auction;
          Session.set("showCreateDialog", false);
        }
      });
    }
  },

  'click .cancel': function () {
    Session.set("showCreateDialog", false);
  }
});

Template.create_dialog.error = function () {
  return Session.get("createError");
};
