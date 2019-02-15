<div id="header-controls">
  <div id="back-btn" class="pull-left">
    <a data-rel="back" class="icon icon-left-nav" style="color: white;"></a>
  </div>
  <div class="input-group">

    <div class="input-row" id="location-gridref-row">
      <% if (!obj.hideLocks) { %>
        <button id="location-lock-btn" 
          class="<%= obj.disableLocationLock ? 'disabled' : '' %> 
            lock-btn 
            icon 
            icon-lock-<%- obj.locks['location'] ? 'closed' : 'open' %>">
        </button>
      <% } %>

      <label class="media-object pull-left icon icon-location" for="location-gridref" />
      <input type="text" 
        title="set gridreference" 
        id="location-gridref" 
        placeholder="Coordinates" 
        size="15"
        value="<%- obj.value %>" 
        data-source="<%- obj.locationSource %>" 
      />
      <input type="text"  
        id="location-accuracy" 
        placeholder="Accuracy" 
        size="8"
        value="(<%- obj.locationAccuracy %>)" 
        disabled 
      />
    </div>

    <% if (!obj.hideName) { %>
    <div class="input-row" id="location-name-row">
      <% if (!obj.hideLocks) { %>
        <button id="name-lock-btn" 
          class="lock-btn icon icon-lock-<%- obj.locks['name'] ? 'closed' : 'open' %>">
        </button>
      <% } %>

      <label class="media-object pull-left icon icon-address" for="location-name" />
      <input class="typeahead" 
        type="text" 
        title="set location name" 
        id="location-name" 
        placeholder="Name of nearest town" 
        value="<%= obj.locationName %>"
      />
    </div>
    <% } %>

<!--    <div class="input-row" id="habitat-row">
      <a href="#samples/<%- obj.id %>/edit/habitat" id="habitat-button"
        class="<%- obj.locks['habitat'] ? 'lock' : 'navigate-right' %>">
       <span class="media-object pull-right descript"><%= obj.habitat %></span>
       Broad habitat
     </a>
 
    </div> -->

  </div>


 


<!--   <div class="input-row" id="location-landcover-row">
    <label class="media-object pull-left icon icon-location" for="location-gridref" />
    <input type="text"  
      id="location-landcover" 
      placeholder="Landcover" 
      value="<%- obj.locationLandcover %>" 
      disabled 
    />
  </div>
 -->
</div>
